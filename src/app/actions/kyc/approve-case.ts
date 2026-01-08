'use server';

/**
 * Approve KYC Case Action
 *
 * Approves an onboarding case and creates company + bank accounts.
 * Only accessible to users with role='owner' (admins).
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

export interface ApproveCaseInput {
  caseId: string;
  adminNotes?: string;
}

export interface ApproveCaseResult {
  success: boolean;
  error?: string;
  companyId?: string;
  accountsCreated?: number;
}

export async function approveCaseAction(input: ApproveCaseInput): Promise<ApproveCaseResult> {
  try {
    const { caseId, adminNotes } = input;
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

    // Verify admin role (only 'owner' can approve)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'owner') {
      return {
        success: false,
        error: 'No tienes permisos para aprobar casos KYC',
      };
    }

    // Get onboarding case
    const { data: onboardingCase, error: caseError } = await supabase
      .from('onboarding_cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (caseError || !onboardingCase) {
      console.error('[approve-case] Error fetching case:', caseError);
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

    const companyData = onboardingCase.company_data as any || {};
    const accountPreference = onboardingCase.account_preference;

    // Create or update company if needed
    let companyId = onboardingCase.company_id;

    if (!companyId) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyData.companyName,
          rnc: companyData.rnc,
          phone: companyData.phone,
          industry: companyData.industry,
          description: companyData.description,
          website: companyData.website,
          country: companyData.country || 'DO',
        })
        .select('id')
        .single();

      if (companyError || !newCompany) {
        console.error('[approve-case] Error creating company:', companyError);
        return {
          success: false,
          error: 'Error al crear empresa',
        };
      }

      companyId = newCompany.id;

      // Update onboarding case with company_id
      await supabase
        .from('onboarding_cases')
        .update({ company_id: companyId })
        .eq('id', caseId);
    }

    // Create bank accounts based on account_preference
    let accountsCreated = 0;
    const accountsToCreate: any[] = [];

    if (accountPreference === 'peso' || accountPreference === 'both') {
      accountsToCreate.push({
        company_id: companyId,
        account_number: generateAccountNumber(),
        account_type: 'checking',
        currency: 'DOP',
        balance: 0,
        status: 'active',
      });
    }

    if (accountPreference === 'dolar' || accountPreference === 'both') {
      accountsToCreate.push({
        company_id: companyId,
        account_number: generateAccountNumber(),
        account_type: 'checking',
        currency: 'USD',
        balance: 0,
        status: 'active',
      });
    }

    if (accountsToCreate.length > 0) {
      const { data: createdAccounts, error: accountsError } = await supabase
        .from('bank_accounts')
        .insert(accountsToCreate)
        .select('id');

      if (accountsError) {
        console.error('[approve-case] Error creating accounts:', accountsError);
        return {
          success: false,
          error: 'Error al crear cuentas bancarias',
        };
      }

      accountsCreated = createdAccounts?.length || 0;
    }

    // Update onboarding case status to 'approved'
    const { error: updateError } = await supabase
      .from('onboarding_cases')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        completed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      })
      .eq('id', caseId);

    if (updateError) {
      console.error('[approve-case] Error updating case:', updateError);
      return {
        success: false,
        error: 'Error al actualizar estado del caso',
      };
    }

    // TODO: Send approval email to user
    // await sendApprovalEmail(onboardingCase.user_id, companyData.companyName);

    console.log('[approve-case] Case approved successfully:', {
      caseId,
      companyId,
      accountsCreated,
    });

    return {
      success: true,
      companyId,
      accountsCreated,
    };
  } catch (error) {
    console.error('[approve-case] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error inesperado',
    };
  }
}

/**
 * Generate a unique account number
 * Format: 10 digits (e.g., 1234567890)
 */
function generateAccountNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, '0');
  return timestamp + random;
}
