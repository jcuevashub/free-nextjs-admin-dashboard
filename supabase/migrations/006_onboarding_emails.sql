-- =====================================================
-- Migration 006: Onboarding Emails Tracking
-- Description: Tabla para tracking de emails enviados durante onboarding
-- Dependencies: 003_onboarding_schema.sql
-- =====================================================

-- =====================================================
-- Tipo ENUM: email_status
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_status') THEN
        CREATE TYPE email_status AS ENUM ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed');
    END IF;
END $$;

-- =====================================================
-- Tabla: onboarding_emails
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_case_id UUID NOT NULL REFERENCES onboarding_cases(id) ON DELETE CASCADE,

  -- Información del email
  email_type VARCHAR(50) NOT NULL, -- 'welcome', 'approved', 'rejected', 'requires_update', 'reminder'
  sent_to VARCHAR(255) NOT NULL,
  subject VARCHAR(500),

  -- Tracking
  status email_status DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Metadata y detalles
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,

  -- Provider tracking (Resend, SendGrid, etc.)
  provider VARCHAR(50), -- 'resend', 'sendgrid', 'ses'
  provider_message_id VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_onboarding_emails_case_id ON onboarding_emails(onboarding_case_id);
CREATE INDEX idx_onboarding_emails_type ON onboarding_emails(email_type);
CREATE INDEX idx_onboarding_emails_status ON onboarding_emails(status);
CREATE INDEX idx_onboarding_emails_sent_to ON onboarding_emails(sent_to);
CREATE INDEX idx_onboarding_emails_sent_at ON onboarding_emails(sent_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_onboarding_emails_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_onboarding_emails_updated_at
  BEFORE UPDATE ON onboarding_emails
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_emails_updated_at();

-- =====================================================
-- Actualizar tabla onboarding_cases
-- =====================================================

-- Agregar campos para tracking de welcome
ALTER TABLE onboarding_cases
ADD COLUMN IF NOT EXISTS first_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS welcome_shown BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_onboarding_cases_first_login ON onboarding_cases(first_login_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_cases_welcome_shown ON onboarding_cases(welcome_shown);

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE onboarding_emails ENABLE ROW LEVEL SECURITY;

-- Admins can view all onboarding emails
DROP POLICY IF EXISTS "Admins can view all onboarding emails" ON onboarding_emails;
CREATE POLICY "Admins can view all onboarding emails"
ON onboarding_emails FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Users can view emails sent to their own cases
DROP POLICY IF EXISTS "Users can view their own onboarding emails" ON onboarding_emails;
CREATE POLICY "Users can view their own onboarding emails"
ON onboarding_emails FOR SELECT
USING (
  onboarding_case_id IN (
    SELECT id FROM onboarding_cases
    WHERE user_id = auth.uid()
  )
);

-- System/admins can insert emails
DROP POLICY IF EXISTS "System can insert onboarding emails" ON onboarding_emails;
CREATE POLICY "System can insert onboarding emails"
ON onboarding_emails FOR INSERT
WITH CHECK (true); -- Permitir inserción desde server actions

-- System can update email status
DROP POLICY IF EXISTS "System can update onboarding emails" ON onboarding_emails;
CREATE POLICY "System can update onboarding emails"
ON onboarding_emails FOR UPDATE
USING (true);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Función para obtener último email enviado por tipo
CREATE OR REPLACE FUNCTION get_latest_onboarding_email(
  case_id UUID,
  email_type_filter VARCHAR(50)
)
RETURNS TABLE (
  id UUID,
  email_type VARCHAR(50),
  sent_to VARCHAR(255),
  status email_status,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oe.id,
    oe.email_type,
    oe.sent_to,
    oe.status,
    oe.sent_at,
    oe.opened_at
  FROM onboarding_emails oe
  WHERE oe.onboarding_case_id = case_id
    AND oe.email_type = email_type_filter
  ORDER BY oe.sent_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE onboarding_emails IS 'Tracking de emails enviados durante proceso de onboarding';
COMMENT ON COLUMN onboarding_emails.email_type IS 'Tipo de email: welcome, approved, rejected, requires_update, reminder';
COMMENT ON COLUMN onboarding_emails.status IS 'Estado del email: queued, sent, delivered, opened, clicked, bounced, failed';
COMMENT ON COLUMN onboarding_emails.metadata IS 'Información adicional del email en formato JSON';
COMMENT ON COLUMN onboarding_emails.provider_message_id IS 'ID del mensaje del proveedor de email (Resend, SendGrid, etc.)';

COMMENT ON COLUMN onboarding_cases.first_login_at IS 'Timestamp del primer login después de aprobación';
COMMENT ON COLUMN onboarding_cases.welcome_shown IS 'Indica si se mostró la página de bienvenida al usuario';
