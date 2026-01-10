'use server';

/**
 * Approve KYC Case Action
 *
 * Approves an onboarding case and creates company + bank accounts.
 * Only accessible to users with role='owner' (admins).
 */

import { createSupabaseServer } from '@/lib/supabaseServer';
import { sendEmail } from '@/lib/email/client';
import { generateWelcomeEmail } from '@/lib/email/templates/welcome';

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
        error: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
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

    // Update user with company_id
    await supabase
      .from('users')
      .update({ company_id: companyId })
      .eq('id', onboardingCase.user_id);

    // Create company_settings for tracking setup progress
    const { error: settingsError } = await supabase
      .from('company_settings')
      .insert({
        company_id: companyId,
        timezone: 'America/Santo_Domingo',
        language: 'es',
        default_currency: accountPreference === 'dolar' ? 'USD' : 'DOP',
        setup_completed: {
          profile_completed: false,
          team_invited: false,
          payment_methods_added: false,
          first_transaction: false,
          ncf_configured: false,
        },
        welcome_email_sent: false,
        welcome_page_shown: false,
        tour_completed: false,
      });

    if (settingsError) {
      console.error('[approve-case] Error creating company settings:', settingsError);
      // Non-critical error, continue with approval
    }

    // Get created accounts for email
    const { data: createdAccountsData } = await supabase
      .from('bank_accounts')
      .select('account_number, currency')
      .eq('company_id', companyId);

    // Send welcome email
    try {
      const emailHtml = generateWelcomeEmail({
        userName: `${onboardingCase.applicant_first_name} ${onboardingCase.applicant_last_name}`,
        companyName: companyData.companyName,
        rnc: companyData.rnc,
        accounts: createdAccountsData || [],
        loginUrl: process.env.NEXT_PUBLIC_SITE_URL
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/signin`
          : 'https://fintechrd.com/signin',
      });

      const emailResult = await sendEmail({
        to: companyData.email || onboardingCase.user_email,
        subject: '¡Tu cuenta de Fintech RD ha sido aprobada! 🎉',
        html: emailHtml,
        onboardingCaseId: caseId,
        emailType: 'approved',
      });

      if (emailResult.success) {
        // Mark email as sent in company_settings
        await supabase
          .from('company_settings')
          .update({ welcome_email_sent: true })
          .eq('company_id', companyId);
      }
    } catch (emailError) {
      console.error('[approve-case] Error sending welcome email:', emailError);
      // Non-critical error, continue with approval
    }

    // Create in-app notification
    try {
      await supabase.from('notifications').insert({
        user_id: onboardingCase.user_id,
        type: 'onboarding_approved',
        title: '¡Cuenta aprobada!',
        message: `Tu cuenta empresarial para ${companyData.companyName} ha sido aprobada. Ya puedes acceder a todas las funcionalidades de Fintech RD.`,
        action_url: '/',
        read: false,
      });
    } catch (notifError) {
      console.error('[approve-case] Error creating notification:', notifError);
      // Non-critical error, continue with approval
    }

    // Create audit log
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id, // Admin who approved
        company_id: companyId,
        action: 'ONBOARDING_APPROVED',
        entity_type: 'onboarding_case',
        entity_id: caseId,
        metadata: {
          approved_by_email: user.email,
          accounts_created: accountsCreated,
          account_preference: accountPreference,
          admin_notes: adminNotes,
        },
      });
    } catch (auditError) {
      console.error('[approve-case] Error creating audit log:', auditError);
      // Non-critical error, continue with approval
    }

    console.log('[approve-case] Case approved successfully:', {
      caseId,
      companyId,
      accountsCreated,
      emailSent: true,
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
