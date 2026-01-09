/**
 * TypeScript types for onboarding flow
 *
 * These types provide strong typing for the onboarding process,
 * ensuring type safety across components and actions.
 */

/**
 * Onboarding status enum
 */
export type OnboardingStatus =
  | 'draft'
  | 'in_progress'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'requires_update';

/**
 * Account preference type
 */
export type AccountPreference = 'peso' | 'dolar' | 'both';

/**
 * Onboarding step names
 */
export type OnboardingStep =
  | 'start'
  | 'account_selection'
  | 'company_info'
  | 'company_address'
  | 'ownership'
  | 'identity_verification'
  | 'documents'
  | 'expected_activity'
  | 'follow_up'
  | 'complete';

/**
 * Document types for upload
 */
export type DocumentType =
  | 'rnc'
  | 'constitutivo'
  | 'cedula_front'
  | 'cedula_back'
  | 'ubo'
  | 'address';

/**
 * Onboarding case from database
 */
export interface OnboardingCase {
  id: string;
  user_id: string;
  company_id: string | null;
  status: OnboardingStatus;
  current_step: string;
  completed_steps: string[];
  account_preference: AccountPreference | null;

  // Socure verification
  socure_document_uuid: string | null;
  socure_reference_id: string | null;
  socure_fraud_score: number | null;
  socure_decision: string | null;
  socure_reasons: string[] | null;
  liveness_score: number | null;
  liveness_verified_at: string | null;

  // OFAC/PEP screening
  ofac_screening_id: string | null;
  ofac_match_found: boolean;
  pep_match_found: boolean;
  sanctions_screened_at: string | null;
  sanctions_provider: string | null;

  // Step data
  company_data: Record<string, any>;
  address_data: Record<string, any>;
  ownership_data: Record<string, any>;
  activity_data: Record<string, any>;
  followup_data: Record<string, any>;

  // Documents
  documents_uploaded: number;
  documents_verified: number;

  // Admin review
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;

  // Metadata
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  completed_at: string | null;
}

/**
 * Identity verification record
 */
export interface IdentityVerification {
  id: string;
  onboarding_case_id: string;
  user_id: string;
  verification_method: 'socure_id_plus' | 'socure_docv' | 'manual';
  socure_reference_id: string | null;
  document_type: string | null;
  document_number: string | null;
  selfie_url: string | null;
  liveness_score: number | null;
  verification_status: 'success' | 'failed' | 'review';
  decision: string | null;
  confidence_score: number | null;
  failure_reasons: string[] | null;
  extracted_data: Record<string, any>;
  provider_response: Record<string, any> | null;
  created_at: string;
}

/**
 * Sanctions screening record
 */
export interface SanctionsScreening {
  id: string;
  onboarding_case_id: string;
  entity_type: 'company' | 'individual';
  entity_name: string;
  entity_identifier: string | null;
  entity_country: string | null;
  provider: string;
  screening_reference: string | null;
  ofac_match: boolean;
  pep_match: boolean;
  sanctions_match: boolean;
  adverse_media_match: boolean;
  match_details: any[];
  risk_score: number | null;
  screened_at: string;
  provider_response: Record<string, any> | null;
  created_at: string;
}

/**
 * Step configuration for navigation
 */
export interface StepConfig {
  id: OnboardingStep;
  title: string;
  path: string;
  order: number;
  required: boolean;
}

/**
 * Complete step configurations
 */
export const ONBOARDING_STEPS: StepConfig[] = [
    {
    id: 'start',
    title: 'Inicio',
    path: '/onboarding/start',
    order: 1,
    required: true,
  },
  {
    id: 'company_info',
    title: 'Información de la empresa',
    path: '/onboarding/company-info',
    order: 2,
    required: true,
  },
  {
    id: 'company_address',
    title: 'Dirección',
    path: '/onboarding/company-address',
    order: 3,
    required: true,
  },
  {
    id: 'ownership',
    title: 'Propietarios',
    path: '/onboarding/ownership',
    order: 4,
    required: true,
  },
  {
    id: 'identity_verification',
    title: 'Verificación de identidad',
    path: '/onboarding/identity-verification',
    order: 5,
    required: true,
  },
  {
    id: 'documents',
    title: 'Documentos',
    path: '/onboarding/documents',
    order: 6,
    required: true,
  },
  {
    id: 'expected_activity',
    title: 'Actividad esperada',
    path: '/onboarding/expected-activity',
    order: 7,
    required: true,
  },
  {
    id: 'follow_up',
    title: 'Preguntas adicionales',
    path: '/onboarding/follow-up',
    order: 8,
    required: true,
  },
  {
    id: 'complete',
    title: 'Completado',
    path: '/onboarding/complete',
    order: 9,
    required: false,
  },
];

/**
 * Helper function to get step by ID
 */
export function getStepById(id: OnboardingStep): StepConfig | undefined {
  return ONBOARDING_STEPS.find((step) => step.id === id);
}

/**
 * Helper function to get next step
 */
export function getNextStep(currentStep: OnboardingStep): StepConfig | null {
  const current = getStepById(currentStep);
  if (!current) return null;

  const nextStep = ONBOARDING_STEPS.find((step) => step.order === current.order + 1);
  return nextStep || null;
}

/**
 * Helper function to get previous step
 */
export function getPreviousStep(currentStep: OnboardingStep): StepConfig | null {
  const current = getStepById(currentStep);
  if (!current) return null;

  const prevStep = ONBOARDING_STEPS.find((step) => step.order === current.order - 1);
  return prevStep || null;
}

/**
 * Helper function to calculate progress percentage
 */
export function calculateProgress(completedSteps: string[]): number {
  const totalSteps = ONBOARDING_STEPS.filter((s) => s.required).length;
  const completed = completedSteps.filter((step) =>
    ONBOARDING_STEPS.find((s) => s.id === step && s.required)
  ).length;

  return Math.round((completed / totalSteps) * 100);
}
