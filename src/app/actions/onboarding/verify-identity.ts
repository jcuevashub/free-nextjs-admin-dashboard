'use server';

/**
 * Verify Identity Action
 *
 * Verifies user identity using Socure ID+ which combines:
 * - Document verification
 * - Selfie liveness detection
 * - Face matching
 * - Fraud detection (Sigma)
 */

import { createSupabaseServer } from '@/lib/supabaseServer';
import { verifySocureIdentity } from '@/lib/integrations/socure/id-plus';
import { evaluateFraudRisk } from '@/lib/integrations/socure/sigma';
import { revalidatePath } from 'next/cache';

interface VerifyIdentityInput {
  caseId: string;
  documentUuid: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  selfieBase64: string; // Base64 encoded selfie image
}

interface VerifyIdentityResult {
  success: boolean;
  decision?: 'accept' | 'reject' | 'review' | 'refer' | 'resubmit';
  livenessScore?: number;
  faceMatch?: boolean;
  fraudScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  message?: string;
  error?: string;
}

/**
 * Verify identity with Socure ID+
 *
 * Performs comprehensive identity verification including liveness,
 * face matching, and fraud detection.
 */
export async function verifyIdentityAction(
  input: VerifyIdentityInput
): Promise<VerifyIdentityResult> {
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

    // Call Socure ID+ API
    const result = await verifySocureIdentity({
      documentUuid: input.documentUuid,
      firstName: input.firstName,
      lastName: input.lastName,
      nationalId: input.nationalId,
      dateOfBirth: input.dateOfBirth,
      selfieImage: input.selfieBase64,
    });

    // Evaluate fraud risk
    const fraudEvaluation = evaluateFraudRisk(
      result.fraudSignals.sigmaScore,
      result.fraudSignals.reasons
    );

    // Save verification record to database
    const { data: verificationRecord, error: verifyError } = await supabase
      .from('identity_verifications')
      .insert({
        onboarding_case_id: input.caseId,
        user_id: user.id,
        verification_method: 'socure_id_plus',
        socure_reference_id: result.referenceId,
        document_type: result.documentVerification.documentType,
        document_number: input.nationalId,
        liveness_score: result.selfieVerification.livenessScore,
        verification_status: result.decision === 'accept' ? 'success' : result.decision === 'reject' ? 'failed' : 'review',
        decision: result.decision,
        confidence_score: result.selfieVerification.faceMatchScore,
        failure_reasons: result.fraudSignals.reasons,
        extracted_data: result.documentVerification.extractedData,
        provider_response: result.rawResponse,
      })
      .select('id')
      .single();

    if (verifyError) {
      console.error('[verifyIdentity] Database error:', verifyError);
      return { success: false, error: verifyError.message };
    }

    // Update onboarding case with verification results
    const { error: caseUpdateError } = await supabase
      .from('onboarding_cases')
      .update({
        socure_reference_id: result.referenceId,
        socure_fraud_score: result.fraudSignals.sigmaScore / 1000, // Normalize to 0-1
        socure_decision: result.decision,
        socure_reasons: result.fraudSignals.reasons,
        liveness_score: result.selfieVerification.livenessScore,
        liveness_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.caseId);

    if (caseUpdateError) {
      console.error('[verifyIdentity] Case update error:', caseUpdateError);
    }

    revalidatePath('/onboarding');

    // Determine user-facing message
    let message = '';
    if (result.decision === 'accept' && fraudEvaluation.decision === 'approve') {
      message = 'Identidad verificada exitosamente';
    } else if (result.decision === 'reject' || fraudEvaluation.decision === 'reject') {
      message = 'Verificación rechazada. Por favor contacta soporte.';
    } else {
      message = 'Verificación en revisión. Nos comunicaremos contigo pronto.';
    }

    return {
      success: true,
      decision: result.decision,
      livenessScore: result.selfieVerification.livenessScore,
      faceMatch: result.selfieVerification.faceMatch,
      fraudScore: result.fraudSignals.sigmaScore,
      riskLevel: fraudEvaluation.riskLevel,
      message,
    };
  } catch (error) {
    console.error('[verifyIdentity] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error al verificar identidad. Por favor intenta de nuevo.',
    };
  }
}
