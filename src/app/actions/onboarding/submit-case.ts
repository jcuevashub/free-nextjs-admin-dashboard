'use server';

/**
 * Submit Onboarding Case Action
 *
 * Finalizes onboarding and submits case for admin review.
 * Validates that all required steps are complete.
 */

import { createSupabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

interface SubmitCaseInput {
  caseId: string;
}

interface SubmitCaseResult {
  success: boolean;
  status?: 'pending_review' | 'approved' | 'rejected';
  message?: string;
  error?: string;
}

/**
 * Submit onboarding case for review
 *
 * Validates completion and updates status to pending_review.
 * Auto-approves low-risk cases, auto-rejects high-risk cases.
 */
export async function submitCaseAction(
  input: SubmitCaseInput
): Promise<SubmitCaseResult> {
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

    // Get onboarding case
    const { data: onboardingCase, error: caseError } = await supabase
      .from('onboarding_cases')
      .select('*')
      .eq('id', input.caseId)
      .eq('user_id', user.id)
      .single();

    if (caseError || !onboardingCase) {
      return { success: false, error: 'Caso de onboarding no encontrado' };
    }

    // Validate required steps are completed
    const requiredSteps = [
      'company_info',
      'ownership',
      'documents',
      'expected_activity',
      'follow_up',
    ];

    const completedSteps = onboardingCase.completed_steps || [];
    const missingSteps = requiredSteps.filter((step) => !completedSteps.includes(step));

    if (missingSteps.length > 0) {
      return {
        success: false,
        error: `Faltan pasos por completar: ${missingSteps.join(', ')}`,
      };
    }

    // Validate documents uploaded
    if ((onboardingCase.documents_uploaded || 0) < 4) {
      return {
        success: false,
        error: 'Debes subir los 4 documentos requeridos',
      };
    }

    // Determine auto-decision based on risk factors
    let finalStatus: 'pending_review' | 'approved' | 'rejected' = 'pending_review';
    let rejectionReason: string | null = null;

    // Auto-reject if sanctions match
    if (onboardingCase.ofac_match_found) {
      finalStatus = 'rejected';
      rejectionReason = 'Coincidencia encontrada en listas de sanciones';
    }
    // Auto-reject if high fraud score (>750)
    else if (onboardingCase.socure_fraud_score && onboardingCase.socure_fraud_score > 0.75) {
      finalStatus = 'rejected';
      rejectionReason = 'Alto riesgo de fraude detectado';
    }
    // Auto-reject if Socure decision is reject
    else if (onboardingCase.socure_decision === 'reject') {
      finalStatus = 'rejected';
      rejectionReason = 'Verificación de identidad rechazada';
    }
    // Auto-approve if low risk (low fraud, no PEP, documents verified, good liveness)
    else if (
      (onboardingCase.socure_fraud_score || 0) <= 0.2 &&
      !onboardingCase.pep_match_found &&
      (onboardingCase.documents_verified || 0) >= 3 &&
      (onboardingCase.liveness_score || 0) >= 0.8
    ) {
      finalStatus = 'approved';
    }

    // Update onboarding case status
    const { error: updateError } = await supabase
      .from('onboarding_cases')
      .update({
        status: finalStatus,
        submitted_at: new Date().toISOString(),
        completed_at: finalStatus === 'approved' ? new Date().toISOString() : null,
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.caseId);

    if (updateError) {
      console.error('[submitCase] Update error:', updateError);
      return { success: false, error: updateError.message };
    }

    // If auto-approved, create bank accounts
    if (finalStatus === 'approved' && onboardingCase.company_id) {
      await createBankAccounts(
        supabase,
        onboardingCase.company_id,
        onboardingCase.account_preference
      );

      // Update company status
      await supabase
        .from('companies')
        .update({
          status: 'active',
          kyc_status: 'approved',
          is_verified: true,
        })
        .eq('id', onboardingCase.company_id);
    }

    revalidatePath('/onboarding');

    // Generate message
    let message = '';
    if (finalStatus === 'approved') {
      message =
        '¡Felicidades! Tu solicitud ha sido aprobada. Ya puedes acceder a tu dashboard.';
    } else if (finalStatus === 'rejected') {
      message = `Tu solicitud ha sido rechazada: ${rejectionReason}`;
    } else {
      message =
        'Tu solicitud ha sido enviada y está en revisión. Te notificaremos cuando sea aprobada.';
    }

    return {
      success: true,
      status: finalStatus,
      message,
    };
  } catch (error) {
    console.error('[submitCase] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error al enviar solicitud. Por favor intenta de nuevo.',
    };
  }
}

/**
 * Helper function to create bank accounts based on preference
 */
async function createBankAccounts(
  supabase: any,
  companyId: string,
  accountPreference: 'peso' | 'dolar' | 'both' | null
) {
  const accountsToCreate = [];

  if (accountPreference === 'peso' || accountPreference === 'both') {
    accountsToCreate.push({
      company_id: companyId,
      account_type: 'checking',
      currency: 'DOP',
      account_name: 'Cuenta Corriente en Pesos',
      status: 'active',
      is_primary: accountPreference === 'peso',
    });
  }

  if (accountPreference === 'dolar' || accountPreference === 'both') {
    accountsToCreate.push({
      company_id: companyId,
      account_type: 'checking',
      currency: 'USD',
      account_name: 'Cuenta Corriente en Dólares',
      status: 'active',
      is_primary: accountPreference === 'dolar',
    });
  }

  if (accountsToCreate.length > 0) {
    const { error } = await supabase.from('accounts').insert(accountsToCreate);

    if (error) {
      console.error('[createBankAccounts] Error:', error);
    }
  }
}
