'use server';

/**
 * Get Onboarding Case Action
 *
 * Fetches the complete onboarding case for the current user,
 * including verification results, document status, and scores.
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

export interface GetCaseResult {
  success: boolean;
  error?: string;
  case?: {
    id: string;
    status: string;
    accountPreference: string | null;
    currentStep: string | null;
    // Company data
    companyName: string | null;
    rnc: string | null;
    phone: string | null;
    industry: string | null;
    // Address data
    addressLine1: string | null;
    city: string | null;
    province: string | null;
    // Owner data
    ownerName: string | null;
    ownerId: string | null;
    ownershipPct: number | null;
    position: string | null;
    // Verification scores
    livenessScore: number | null;
    socureFraudScore: number | null;
    ofacMatchFound: boolean;
    pepMatchFound: boolean;
    // Counts
    documentsUploaded: number;
    documentsVerified: number;
    // Timestamps
    submittedAt: string | null;
    reviewedAt: string | null;
    completedAt: string | null;
    // Admin notes
    adminNotes: string | null;
  };
  company?: {
    id: string;
    name: string;
  } | null;
}

export async function getCaseAction(): Promise<GetCaseResult> {
  try {
    const supabase = await createSupabaseServer();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: 'No autenticado',
      };
    }

    // Fetch onboarding case
    const { data: onboardingCase, error: caseError } = await supabase
      .from('onboarding_cases')
      .select(
        `
        id,
        status,
        account_preference,
        current_step,
        company_data,
        address_data,
        ownership_data,
        liveness_score,
        socure_fraud_score,
        ofac_match_found,
        pep_match_found,
        documents_uploaded,
        documents_verified,
        submitted_at,
        reviewed_at,
        completed_at,
        admin_notes,
        company_id
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (caseError) {
      console.error('[get-case] Error fetching case:', caseError);
      return {
        success: false,
        error: 'No se encontró caso de onboarding',
      };
    }

    if (!onboardingCase) {
      return {
        success: false,
        error: 'No se encontró caso de onboarding',
      };
    }

    // Parse JSON fields
    const companyData = onboardingCase.company_data as any || {};
    const addressData = onboardingCase.address_data as any || {};
    const ownershipData = onboardingCase.ownership_data as any || {};

    // Fetch company if exists
    let company = null;
    if (onboardingCase.company_id) {
      const { data: companyRecord } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', onboardingCase.company_id)
        .single();

      if (companyRecord) {
        company = {
          id: companyRecord.id,
          name: companyRecord.name,
        };
      }
    }

    return {
      success: true,
      case: {
        id: onboardingCase.id,
        status: onboardingCase.status,
        accountPreference: onboardingCase.account_preference,
        currentStep: onboardingCase.current_step,
        // Company data
        companyName: companyData.companyName || null,
        rnc: companyData.rnc || null,
        phone: companyData.phone || null,
        industry: companyData.industry || null,
        // Address data
        addressLine1: addressData.addressLine1 || null,
        city: addressData.city || null,
        province: addressData.province || null,
        // Owner data
        ownerName: ownershipData.ownerName || null,
        ownerId: ownershipData.ownerId || null,
        ownershipPct: ownershipData.ownershipPct || null,
        position: ownershipData.position || null,
        // Verification scores
        livenessScore: onboardingCase.liveness_score,
        socureFraudScore: onboardingCase.socure_fraud_score,
        ofacMatchFound: onboardingCase.ofac_match_found || false,
        pepMatchFound: onboardingCase.pep_match_found || false,
        // Counts
        documentsUploaded: onboardingCase.documents_uploaded || 0,
        documentsVerified: onboardingCase.documents_verified || 0,
        // Timestamps
        submittedAt: onboardingCase.submitted_at,
        reviewedAt: onboardingCase.reviewed_at,
        completedAt: onboardingCase.completed_at,
        // Admin notes
        adminNotes: onboardingCase.admin_notes,
      },
      company,
    };
  } catch (error) {
    console.error('[get-case] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}
