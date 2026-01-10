'use server';

/**
 * Mark Welcome Shown Action
 *
 * Marca que el usuario ya vio la página de bienvenida
 * y registra el timestamp del primer login post-aprobación
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

export interface MarkWelcomeShownResult {
  success: boolean;
  error?: string;
}

export async function markWelcomeShownAction(): Promise<MarkWelcomeShownResult> {
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

    const now = new Date().toISOString();

    // Update onboarding_cases
    const { error: caseError } = await supabase
      .from('onboarding_cases')
      .update({
        welcome_shown: true,
        first_login_at: now,
      })
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .is('first_login_at', null); // Only update if not already set

    if (caseError) {
      console.error('[mark-welcome-shown] Error updating onboarding case:', caseError);
      // Non-critical, continue
    }

    // Update company_settings
    const { data: profile } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profile?.company_id) {
      const { error: settingsError } = await supabase
        .from('company_settings')
        .update({
          welcome_page_shown: true,
          first_login_at: now,
        })
        .eq('company_id', profile.company_id)
        .is('first_login_at', null); // Only update if not already set

      if (settingsError) {
        console.error('[mark-welcome-shown] Error updating company settings:', settingsError);
        // Non-critical, continue
      }
    }

    console.log('[mark-welcome-shown] Welcome shown marked for user:', user.id);

    return { success: true };
  } catch (error) {
    console.error('[mark-welcome-shown] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}
