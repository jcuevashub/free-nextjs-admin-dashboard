'use server';

/**
 * Screen Sanctions Action
 *
 * Screens entities (companies and individuals) against:
 * - OFAC sanctions lists
 * - PEP (Politically Exposed Persons) databases
 * - UN, EU, UK sanctions
 * - Adverse media
 */

import { createSupabaseServer } from '@/lib/supabaseServer';
import { screenForSanctions } from '@/lib/integrations/sanctions/screening';
import { revalidatePath } from 'next/cache';

interface ScreenSanctionsInput {
  caseId: string;
  entityName: string;
  entityType: 'company' | 'individual';
  entityIdentifier?: string; // RNC or cédula
  dateOfBirth?: string; // For individuals
}

interface ScreenSanctionsResult {
  success: boolean;
  isPEP?: boolean;
  isOnSanctionsList?: boolean;
  riskScore?: number;
  matches?: number;
  recommendation?: 'approve' | 'review' | 'reject';
  message?: string;
  error?: string;
}

/**
 * Screen entity for sanctions and PEP
 *
 * Performs comprehensive screening and updates onboarding case
 * with results. Auto-rejects if sanctions match found.
 */
export async function screenSanctionsAction(
  input: ScreenSanctionsInput
): Promise<ScreenSanctionsResult> {
  try {
    const supabase = await createSupabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      };
    }

    // Perform sanctions screening
    const result = await screenForSanctions(
      input.entityName,
      input.entityType,
      input.entityIdentifier,
      input.dateOfBirth
    );

    // Save screening results to database
    const { data: screeningRecord, error: screeningError } = await supabase
      .from('sanctions_screenings')
      .insert({
        onboarding_case_id: input.caseId,
        entity_type: input.entityType,
        entity_name: input.entityName,
        entity_identifier: input.entityIdentifier,
        entity_country: 'DO',
        provider: 'sanctions.io',
        screening_reference: result.screeningId,
        ofac_match: result.isOnSanctionsList,
        pep_match: result.isPEP,
        sanctions_match: result.isOnSanctionsList,
        adverse_media_match: result.hasAdverseMedia,
        match_details: result.matches,
        risk_score: result.riskScore,
        provider_response: result.rawResponse,
      })
      .select('id')
      .single();

    if (screeningError) {
      console.error('[screenSanctions] Database error:', screeningError);
      return { success: false, error: screeningError.message };
    }

    // Update onboarding case with screening results
    const { error: caseUpdateError } = await supabase
      .from('onboarding_cases')
      .update({
        ofac_screening_id: result.screeningId,
        ofac_match_found: result.isOnSanctionsList,
        pep_match_found: result.isPEP,
        sanctions_screened_at: new Date().toISOString(),
        sanctions_provider: 'sanctions.io',
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.caseId);

    if (caseUpdateError) {
      console.error('[screenSanctions] Case update error:', caseUpdateError);
    }

    // If sanctions match found, auto-reject the case
    if (result.isOnSanctionsList) {
      await supabase
        .from('onboarding_cases')
        .update({
          status: 'rejected',
          rejection_reason: 'Coincidencia encontrada en listas de sanciones internacionales',
        })
        .eq('id', input.caseId);
    }

    revalidatePath('/onboarding');

    // Generate user-facing message
    let message = '';
    if (result.isOnSanctionsList) {
      message =
        'Se encontró una coincidencia en listas de sanciones. Tu solicitud no puede ser procesada.';
    } else if (result.isPEP) {
      message =
        'Se identificó como Persona Políticamente Expuesta (PEP). Tu solicitud será revisada manualmente.';
    } else if (result.hasAdverseMedia) {
      message = 'Se encontró información en medios adversos. Tu solicitud será revisada.';
    } else if (result.matches.length > 0) {
      message = `Se encontraron ${result.matches.length} coincidencia(s) potencial(es). En revisión.`;
    } else {
      message = 'Sin coincidencias en listas de sanciones. Todo claro.';
    }

    return {
      success: true,
      isPEP: result.isPEP,
      isOnSanctionsList: result.isOnSanctionsList,
      riskScore: result.riskScore,
      matches: result.matches.length,
      recommendation: result.recommendation,
      message,
    };
  } catch (error) {
    console.error('[screenSanctions] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error al verificar listas de sanciones. Por favor intenta de nuevo.',
    };
  }
}
