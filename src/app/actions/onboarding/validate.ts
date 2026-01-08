'use server';

/**
 * Onboarding Validation Action
 *
 * Validates RNC and email uniqueness before proceeding with onboarding.
 * This prevents duplicate accounts and ensures data integrity.
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

interface ValidateResult {
  success: boolean;
  conflicts?: {
    rnc?: boolean;
    email?: boolean;
  };
  message?: string;
}

/**
 * Validate RNC and email uniqueness
 *
 * @param rnc - Company RNC (optional)
 * @param email - User email (optional)
 * @returns Validation result with any conflicts found
 */
export async function validateOnboardingAction(data: {
  rnc?: string;
  email?: string;
}): Promise<ValidateResult> {
  try {
    const supabase = await createSupabaseServer();
    const conflicts: { rnc?: boolean; email?: boolean } = {};

    // Check RNC uniqueness in companies table
    if (data.rnc) {
      const normalizedRNC = data.rnc.replace(/\D/g, ''); // Remove non-digits

      const { data: existingCompany, error } = await supabase
        .from('companies')
        .select('id')
        .eq('rnc', normalizedRNC)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found (which is good)
        console.error('[validateOnboarding] RNC check error:', error);
      }

      if (existingCompany) {
        conflicts.rnc = true;
      }
    }

    // Check email uniqueness in users table
    if (data.email) {
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[validateOnboarding] Email check error:', error);
      }

      if (existingUser) {
        conflicts.email = true;
      }
    }

    // Return result
    if (Object.keys(conflicts).length > 0) {
      return {
        success: false,
        conflicts,
        message: 'Ya existe una empresa o usuario con estos datos.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('[validateOnboarding] Unexpected error:', error);
    return {
      success: false,
      message: 'Error al validar datos. Por favor intenta de nuevo.',
    };
  }
}
