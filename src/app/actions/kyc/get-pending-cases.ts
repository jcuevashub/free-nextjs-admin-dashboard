'use server';

/**
 * Get Pending KYC Cases Action
 *
 * Retrieves all onboarding cases pending review for admin dashboard.
 * Only accessible to users with role='owner' (admins).
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

export interface PendingCase {
  id: string;
  status: string;
  submittedAt: string | null;
  // Company info
  companyName: string | null;
  rnc: string | null;
  industry: string | null;
  // Owner info
  ownerName: string | null;
  ownerId: string | null;
  // Verification scores
  livenessScore: number | null;
  socureFraudScore: number | null;
  ofacMatchFound: boolean;
  pepMatchFound: boolean;
  // Document counts
  documentsUploaded: number;
  documentsVerified: number;
  // Account preference
  accountPreference: string | null;
}

export interface GetPendingCasesResult {
  success: boolean;
  error?: string;
  cases?: PendingCase[];
  totalCount?: number;
}

export async function getPendingCasesAction(): Promise<GetPendingCasesResult> {
  try {
    const supabase = await createSupabaseServer();

    // Get current admin user
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

    // Verify admin role (only 'owner' can view KYC dashboard)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'owner') {
      return {
        success: false,
        error: 'No tienes permisos para acceder al dashboard KYC',
      };
    }

    // Fetch all pending review cases
    const { data: cases, error: casesError } = await supabase
      .from('onboarding_cases')
      .select(
        `
        id,
        status,
        submitted_at,
        company_data,
        ownership_data,
        liveness_score,
        socure_fraud_score,
        ofac_match_found,
        pep_match_found,
        documents_uploaded,
        documents_verified,
        account_preference
      `
      )
      .eq('status', 'pending_review')
      .order('submitted_at', { ascending: true }); // Oldest first

    if (casesError) {
      console.error('[get-pending-cases] Error fetching cases:', casesError);
      return {
        success: false,
        error: 'Error al obtener casos pendientes',
      };
    }

    // Transform data
    const pendingCases: PendingCase[] = (cases || []).map((c) => {
      const companyData = (c.company_data as any) || {};
      const ownershipData = (c.ownership_data as any) || {};

      return {
        id: c.id,
        status: c.status,
        submittedAt: c.submitted_at,
        // Company info
        companyName: companyData.companyName || null,
        rnc: companyData.rnc || null,
        industry: companyData.industry || null,
        // Owner info
        ownerName: ownershipData.ownerName || null,
        ownerId: ownershipData.ownerId || null,
        // Verification scores
        livenessScore: c.liveness_score,
        socureFraudScore: c.socure_fraud_score,
        ofacMatchFound: c.ofac_match_found || false,
        pepMatchFound: c.pep_match_found || false,
        // Document counts
        documentsUploaded: c.documents_uploaded || 0,
        documentsVerified: c.documents_verified || 0,
        // Account preference
        accountPreference: c.account_preference,
      };
    });

    return {
      success: true,
      cases: pendingCases,
      totalCount: pendingCases.length,
    };
  } catch (error) {
    console.error('[get-pending-cases] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}
