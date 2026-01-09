'use server';

import { createSupabaseServer } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

interface ResumeCaseResult {
  success: boolean;
  caseId?: string;
  currentStep?: string;
  redirectUrl?: string;
  error?: string;
  status?: string;
  nextStep?: string;
}


export async function resumeOnboardingAction(): Promise<ResumeCaseResult> {
  try {
    const supabase = await createSupabaseServer();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect('/signin');
    }

    // Find incomplete onboarding case
    const { data: existingCase, error: caseError } = await supabase
      .from('onboarding_cases')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['draft', 'in_progress', 'requires_update'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (caseError && caseError.code !== 'PGRST116') {
      console.error('[resumeOnboarding] Error finding case:', caseError);
      return { success: false, error: 'Error al buscar caso de onboarding' };
    }

    // No incomplete case found - start fresh
    if (!existingCase) {
      return {
        success: true,
        redirectUrl: '/onboarding/company-info',
      };
    }

    // Determine which step to resume from
    const stepRoutes: Record<string, string> = {
      start: '/onboarding/start',
      company_info: '/onboarding/company-info',
      company_address: '/onboarding/company-address',
      ownership: '/onboarding/ownership',
      identity_verification: '/onboarding/identity-verification',
      documents: '/onboarding/documents',
      expected_activity: '/onboarding/expected-activity',
      follow_up: '/onboarding/follow-up',
    };

    const currentStep = existingCase.current_step || 'company-info';
    const resumeRoute = stepRoutes[currentStep] || '/onboarding/company-info';

    // Build URL with case data as query params
    const params = new URLSearchParams();
    params.set('caseId', existingCase.id);

    if (existingCase.company_id) {
      params.set('companyId', existingCase.company_id);
    }

    if (existingCase.account_preference) {
      params.set('accountPreference', existingCase.account_preference);
    }

    // Add data from previous steps to params for convenience
    if (existingCase.company_data) {
      const companyData = existingCase.company_data as Record<string, any>;
      if (companyData.companyName) params.set('companyName', companyData.companyName);
      if (companyData.rnc) params.set('rnc', companyData.rnc);
    }

    const redirectUrl = `${resumeRoute}?${params.toString()}`;

    return {
      success: true,
      caseId: existingCase.id,
      currentStep,
      redirectUrl,
    };
  } catch (error) {
    console.error('[resumeOnboarding] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error al reanudar onboarding',
    };
  }
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Check if user has an approved onboarding case
    const { data: approvedCase } = await supabase
      .from('onboarding_cases')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .single();

    return !!approvedCase;
  } catch {
    return false;
  }
}
