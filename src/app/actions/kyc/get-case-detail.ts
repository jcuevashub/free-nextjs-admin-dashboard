'use server';

/**
 * Get KYC Case Detail Action
 *
 * Retrieves complete details of a single onboarding case for admin review.
 * Only accessible to users with role='owner' (admins).
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

export interface CaseDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  socureDocumentUuid: string | null;
  socureVerificationStatus: string | null;
  ocrData: any;
  extractionConfidence: number | null;
}

export interface SanctionsScreening {
  id: string;
  entityName: string;
  entityType: string;
  ofacMatch: boolean;
  pepMatch: boolean;
  riskScore: number | null;
  matchDetails: any;
  screenedAt: string;
}

export interface IdentityVerification {
  id: string;
  socureReferenceId: string | null;
  decision: string | null;
  livenessScore: number | null;
  faceMatchScore: number | null;
  fraudScore: number | null;
  verifiedAt: string;
}

export interface CaseDetail {
  // Basic info
  id: string;
  userId: string;
  status: string;
  currentStep: string | null;
  accountPreference: string | null;
  // Timestamps
  createdAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  completedAt: string | null;
  // All step data
  companyData: any;
  addressData: any;
  ownershipData: any;
  expectedActivityData: any;
  followUpData: any;
  // Verification scores
  livenessScore: number | null;
  socureFraudScore: number | null;
  ofacMatchFound: boolean;
  pepMatchFound: boolean;
  // Document counts
  documentsUploaded: number;
  documentsVerified: number;
  // Admin fields
  adminNotes: string | null;
  reviewedBy: string | null;
  // Related data
  documents: CaseDocument[];
  sanctionsScreenings: SanctionsScreening[];
  identityVerifications: IdentityVerification[];
}

export interface GetCaseDetailResult {
  success: boolean;
  error?: string;
  case?: CaseDetail;
}

export async function getCaseDetailAction(caseId: string): Promise<GetCaseDetailResult> {
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
        error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      };
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'owner') {
      return {
        success: false,
        error: 'No tienes permisos para ver detalles de casos KYC',
      };
    }

    // Fetch onboarding case
    const { data: onboardingCase, error: caseError } = await supabase
      .from('onboarding_cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (caseError || !onboardingCase) {
      console.error('[get-case-detail] Error fetching case:', caseError);
      return {
        success: false,
        error: 'Caso no encontrado',
      };
    }

    // Fetch related documents
    const { data: documents } = await supabase
      .from('company_documents')
      .select(
        `
        id,
        document_type,
        file_name,
        file_url,
        uploaded_at,
        socure_document_uuid,
        socure_verification_status,
        ocr_data,
        extraction_confidence
      `
      )
      .eq('company_id', onboardingCase.company_id)
      .order('uploaded_at', { ascending: false });

    // Fetch sanctions screenings
    const { data: screenings } = await supabase
      .from('sanctions_screenings')
      .select(
        `
        id,
        entity_name,
        entity_type,
        ofac_match,
        pep_match,
        risk_score,
        match_details,
        screened_at
      `
      )
      .eq('case_id', caseId)
      .order('screened_at', { ascending: false });

    // Fetch identity verifications
    const { data: identityVerifications } = await supabase
      .from('identity_verifications')
      .select(
        `
        id,
        socure_reference_id,
        decision,
        liveness_score,
        face_match_score,
        fraud_score,
        verified_at
      `
      )
      .eq('case_id', caseId)
      .order('verified_at', { ascending: false });

    // Transform data
    const caseDetail: CaseDetail = {
      // Basic info
      id: onboardingCase.id,
      userId: onboardingCase.user_id,
      status: onboardingCase.status,
      currentStep: onboardingCase.current_step,
      accountPreference: onboardingCase.account_preference,
      // Timestamps
      createdAt: onboardingCase.created_at,
      submittedAt: onboardingCase.submitted_at,
      reviewedAt: onboardingCase.reviewed_at,
      completedAt: onboardingCase.completed_at,
      // All step data
      companyData: onboardingCase.company_data,
      addressData: onboardingCase.address_data,
      ownershipData: onboardingCase.ownership_data,
      expectedActivityData: onboardingCase.expected_activity_data,
      followUpData: onboardingCase.follow_up_data,
      // Verification scores
      livenessScore: onboardingCase.liveness_score,
      socureFraudScore: onboardingCase.socure_fraud_score,
      ofacMatchFound: onboardingCase.ofac_match_found || false,
      pepMatchFound: onboardingCase.pep_match_found || false,
      // Document counts
      documentsUploaded: onboardingCase.documents_uploaded || 0,
      documentsVerified: onboardingCase.documents_verified || 0,
      // Admin fields
      adminNotes: onboardingCase.admin_notes,
      reviewedBy: onboardingCase.reviewed_by,
      // Related data
      documents:
        documents?.map((d) => ({
          id: d.id,
          documentType: d.document_type,
          fileName: d.file_name,
          fileUrl: d.file_url,
          uploadedAt: d.uploaded_at,
          socureDocumentUuid: d.socure_document_uuid,
          socureVerificationStatus: d.socure_verification_status,
          ocrData: d.ocr_data,
          extractionConfidence: d.extraction_confidence,
        })) || [],
      sanctionsScreenings:
        screenings?.map((s) => ({
          id: s.id,
          entityName: s.entity_name,
          entityType: s.entity_type,
          ofacMatch: s.ofac_match || false,
          pepMatch: s.pep_match || false,
          riskScore: s.risk_score,
          matchDetails: s.match_details,
          screenedAt: s.screened_at,
        })) || [],
      identityVerifications:
        identityVerifications?.map((i) => ({
          id: i.id,
          socureReferenceId: i.socure_reference_id,
          decision: i.decision,
          livenessScore: i.liveness_score,
          faceMatchScore: i.face_match_score,
          fraudScore: i.fraud_score,
          verifiedAt: i.verified_at,
        })) || [],
    };

    return {
      success: true,
      case: caseDetail,
    };
  } catch (error) {
    console.error('[get-case-detail] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}
