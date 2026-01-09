'use server';

/**
 * Save Onboarding Step Action
 *
 * Saves progress for each onboarding step to the database.
 * This allows users to resume onboarding if they leave mid-flow.
 */

import { createSupabaseServer } from '@/lib/supabaseServer';
import { revalidatePath } from 'next/cache';

type OnboardingStep =
  | 'start'
  | 'company_info'
  | 'ownership'
  | 'documents'
  | 'expected_activity'
  | 'follow_up';

interface SaveStepInput {
  step: OnboardingStep;
  caseId?: string;
  data: Record<string, any>;
}

interface SaveStepResult {
  success: boolean;
  caseId?: string;
  companyId?: string;
  personId?: string;
  error?: string;
}

/**
 * Save onboarding step data
 *
 * Creates or updates onboarding case with step data.
 * Handles creation of company record for company_info step.
 */
export async function saveStepAction(input: SaveStepInput): Promise<SaveStepResult> {
  try {
    const supabase = await createSupabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    const { step, caseId, data } = input;

    // Map step to database field
    const stepFieldMap: Record<OnboardingStep, Record<string, any>> = {
      start: {  },
      company_info: { company_data: data },
      ownership: { ownership_data: data },
      documents: {},
      expected_activity: { activity_data: data },
      follow_up: { followup_data: data },
    };

    let currentCaseId = caseId;
    let companyId: string | undefined;
    let personId: string | undefined;

    // Create or update onboarding case
    if (!currentCaseId) {
      // Create new case
      const { data: newCase, error } = await supabase
        .from('onboarding_cases')
        .insert({
          user_id: user.id,
          status: 'in_progress',
          current_step: step,
          completed_steps: [step],
          ip_address: null, // Can be added from headers if needed
          user_agent: null,
          ...stepFieldMap[step],
        })
        .select('id')
        .single();

      if (error) {
        console.error('[saveStep] Error creating case:', error);
        return { success: false, error: error.message };
      }

      currentCaseId = newCase.id;
    } else {
      // Update existing case - add step to completed_steps array
      const { data: existingCase } = await supabase
        .from('onboarding_cases')
        .select('completed_steps')
        .eq('id', currentCaseId)
        .single();

      const completedSteps = existingCase?.completed_steps || [];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }

      const { error } = await supabase
        .from('onboarding_cases')
        .update({
          current_step: step,
          completed_steps: completedSteps,
          updated_at: new Date().toISOString(),
          ...stepFieldMap[step],
        })
        .eq('id', currentCaseId);

      if (error) {
        console.error('[saveStep] Error updating case:', error);
        return { success: false, error: error.message };
      }
    }

    // Special handling: Create company for company_info step
    if (step === 'company_info' && data.companyName && data.rnc) {
      const normalizedRNC = data.rnc.replace(/\D/g, '');

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          rnc: normalizedRNC,
          company_name: data.companyName,
          legal_name: data.companyName,
          company_email: user.email!,
          company_phone: data.phone,
          industry: data.industry,
          country: data.country || 'DO',
          status: 'pending_verification',
          kyc_status: 'pending',
          is_verified: false,
        })
        .select('id')
        .single();

      if (companyError) {
        console.error('[saveStep] Error creating company:', companyError);
        return { success: false, error: companyError.message };
      }

      companyId = company.id;

      const { data: caseData } = await supabase
        .from('onboarding_cases')
        .select('company_id')
        .eq('id', currentCaseId)
        .single();

      if (caseData?.company_id) {
        await supabase
          .from('companies')
          .update({
            address: data.address,
            city: data.city,
            country: data.country || 'DO',
          })
          .eq('id', companyId);
      }

      // Link company to onboarding case
      await supabase
        .from('onboarding_cases')
        .update({ company_id: companyId })
        .eq('id', currentCaseId);

      // Create user record in users table (linked to auth.users)
      const { error: userError } = await supabase.from('users').upsert(
        {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || data.companyName,
          company_id: companyId,
          role: 'owner',
          is_active: true,
        },
        { onConflict: 'id' }
      );

      if (userError) {
        console.error('[saveStep] Error creating user:', userError);
      }
    }

    // Special handling: Update company address for company_address step
    // if (step === 'company_address') {
    //   const { data: caseData } = await supabase
    //     .from('onboarding_cases')
    //     .select('company_id')
    //     .eq('id', currentCaseId)
    //     .single();

    //   if (caseData?.company_id) {
    //     await supabase
    //       .from('companies')
    //       .update({
    //         address: data.address,
    //         city: data.city,
    //         country: data.country || 'DO',
    //       })
    //       .eq('id', caseData.company_id);
    //   }
    // }

    revalidatePath('/onboarding');

    return {
      success: true,
      caseId: currentCaseId,
      companyId,
      personId,
    };
  } catch (error) {
    console.error('[saveStep] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
