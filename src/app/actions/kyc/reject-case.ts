'use server';

/**
 * Reject KYC Case Action
 *
 * Rejects an onboarding case with reason.
 * Only accessible to users with role='owner' (admins).
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

export interface RejectCaseInput {
  caseId: string;
  reason: string;
  requiresUpdate?: boolean; // If true, sets status to 'requires_update' instead of 'rejected'
}

export interface RejectCaseResult {
  success: boolean;
  error?: string;
}

export async function rejectCaseAction(input: RejectCaseInput): Promise<RejectCaseResult> {
  try {
    const { caseId, reason, requiresUpdate = false } = input;
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

    // Verify admin role (only 'owner' can reject)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'owner') {
      return {
        success: false,
        error: 'No tienes permisos para rechazar casos KYC',
      };
    }

    // Validate reason is provided
    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        error: 'Debes proporcionar una razón detallada (mínimo 10 caracteres)',
      };
    }

    // Get onboarding case
    const { data: onboardingCase, error: caseError } = await supabase
      .from('onboarding_cases')
      .select('id, status, user_id, company_data')
      .eq('id', caseId)
      .single();

    if (caseError || !onboardingCase) {
      console.error('[reject-case] Error fetching case:', caseError);
      return {
        success: false,
        error: 'Caso de onboarding no encontrado',
      };
    }

    // Verify case is in pending_review status
    if (onboardingCase.status !== 'pending_review') {
      return {
        success: false,
        error: `El caso no está en revisión (status actual: ${onboardingCase.status})`,
      };
    }

    // Determine new status
    const newStatus = requiresUpdate ? 'requires_update' : 'rejected';

    // Update onboarding case status
    const { error: updateError } = await supabase
      .from('onboarding_cases')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        admin_notes: reason,
      })
      .eq('id', caseId);

    if (updateError) {
      console.error('[reject-case] Error updating case:', updateError);
      return {
        success: false,
        error: 'Error al actualizar estado del caso',
      };
    }

    // TODO: Send rejection/update-required email to user
    // const companyData = onboardingCase.company_data as any || {};
    // if (requiresUpdate) {
    //   await sendUpdateRequiredEmail(onboardingCase.user_id, reason);
    // } else {
    //   await sendRejectionEmail(onboardingCase.user_id, reason, companyData.companyName);
    // }

    console.log('[reject-case] Case updated successfully:', {
      caseId,
      newStatus,
      reason: reason.substring(0, 50) + '...',
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('[reject-case] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}
