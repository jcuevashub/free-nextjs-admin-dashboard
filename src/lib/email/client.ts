/**
 * Email Service Client
 *
 * Wrapper para envío de emails usando Resend
 * Incluye tracking y logging automático en base de datos
 */

import { createSupabaseServer } from '@/lib/supabaseServer';

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  onboardingCaseId?: string;
  emailType?: 'welcome' | 'approved' | 'rejected' | 'requires_update' | 'reminder';
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Resend
 *
 * @param params - Email parameters
 * @returns Email result with success status and message ID
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResult> {
  const { to, subject, html, onboardingCaseId, emailType } = params;

  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not configured. Email will be logged but not sent.');

      // Log to database even if email service is not configured
      if (onboardingCaseId && emailType) {
        await logEmailToDatabase({
          onboardingCaseId,
          emailType,
          sentTo: Array.isArray(to) ? to[0] : to,
          subject,
          status: 'failed',
          errorMessage: 'Email service not configured (RESEND_API_KEY missing)',
        });
      }

      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    // For now, we'll simulate sending until Resend is fully set up
    // In production, uncomment the Resend integration below

    /*
    // Import Resend dynamically to avoid errors if not installed
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Fintech RD <noreply@fintechrd.com>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error('❌ Error sending email:', error);

      // Log failed email to database
      if (onboardingCaseId && emailType) {
        await logEmailToDatabase({
          onboardingCaseId,
          emailType,
          sentTo: Array.isArray(to) ? to[0] : to,
          subject,
          status: 'failed',
          errorMessage: error.message || 'Unknown error',
        });
      }

      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }

    // Log successful email to database
    if (onboardingCaseId && emailType) {
      await logEmailToDatabase({
        onboardingCaseId,
        emailType,
        sentTo: Array.isArray(to) ? to[0] : to,
        subject,
        status: 'sent',
        providerMessageId: data?.id,
      });
    }

    console.log('✅ Email sent successfully:', data?.id);

    return {
      success: true,
      messageId: data?.id,
    };
    */

    // TEMPORARY: Log to console and database only (until Resend is set up)
    console.log('📧 [SIMULATED EMAIL SEND]');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Type:', emailType);

    // Log to database
    if (onboardingCaseId && emailType) {
      await logEmailToDatabase({
        onboardingCaseId,
        emailType,
        sentTo: Array.isArray(to) ? to[0] : to,
        subject,
        status: 'sent', // Mark as sent even in simulation mode
        metadata: { simulated: true },
      });
    }

    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
    };

  } catch (error) {
    console.error('❌ Unexpected error sending email:', error);

    // Log error to database
    if (onboardingCaseId && emailType) {
      await logEmailToDatabase({
        onboardingCaseId,
        emailType,
        sentTo: Array.isArray(to) ? to[0] : to,
        subject,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Log email to database for tracking
 */
async function logEmailToDatabase(params: {
  onboardingCaseId: string;
  emailType: string;
  sentTo: string;
  subject: string;
  status: 'queued' | 'sent' | 'failed';
  providerMessageId?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const supabase = await createSupabaseServer();

    const emailRecord = {
      onboarding_case_id: params.onboardingCaseId,
      email_type: params.emailType,
      sent_to: params.sentTo,
      subject: params.subject,
      status: params.status,
      provider: 'resend',
      provider_message_id: params.providerMessageId || null,
      error_message: params.errorMessage || null,
      metadata: params.metadata || {},
      sent_at: params.status === 'sent' ? new Date().toISOString() : null,
      failed_at: params.status === 'failed' ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from('onboarding_emails')
      .insert(emailRecord);

    if (error) {
      console.error('❌ Error logging email to database:', error);
    } else {
      console.log('✅ Email logged to database');
    }
  } catch (error) {
    console.error('❌ Unexpected error logging email:', error);
  }
}

/**
 * Update email status (for webhook callbacks from Resend)
 */
export async function updateEmailStatus(params: {
  providerMessageId: string;
  status: 'delivered' | 'opened' | 'clicked' | 'bounced';
  timestamp?: string;
}) {
  try {
    const supabase = await createSupabaseServer();

    const updateData: Record<string, any> = {
      status: params.status,
    };

    // Set appropriate timestamp field
    switch (params.status) {
      case 'delivered':
        updateData.delivered_at = params.timestamp || new Date().toISOString();
        break;
      case 'opened':
        updateData.opened_at = params.timestamp || new Date().toISOString();
        break;
      case 'clicked':
        updateData.clicked_at = params.timestamp || new Date().toISOString();
        break;
      case 'bounced':
        updateData.bounced_at = params.timestamp || new Date().toISOString();
        break;
    }

    const { error } = await supabase
      .from('onboarding_emails')
      .update(updateData)
      .eq('provider_message_id', params.providerMessageId);

    if (error) {
      console.error('❌ Error updating email status:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email status updated to ${params.status}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Unexpected error updating email status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
