-- =====================================================
-- Migration 005: Company Settings
-- Description: Tabla para configuración de empresa y tracking de setup
-- Dependencies: 001_initial_schema.sql
-- =====================================================

-- =====================================================
-- Tabla: company_settings
-- =====================================================

CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Configuración general
  timezone VARCHAR(50) DEFAULT 'America/Santo_Domingo',
  language VARCHAR(5) DEFAULT 'es',
  default_currency currency_code DEFAULT 'DOP',

  -- Configuración fiscal
  fiscal_year_end VARCHAR(5) DEFAULT '12-31', -- Format: MM-DD
  tax_id VARCHAR(50), -- Adicional al RNC si aplica

  -- Setup checklist (JSON object)
  setup_completed JSONB DEFAULT '{
    "profile_completed": false,
    "team_invited": false,
    "payment_methods_added": false,
    "first_transaction": false,
    "ncf_configured": false
  }'::jsonb,

  -- Onboarding tracking
  first_login_at TIMESTAMPTZ,
  tour_completed BOOLEAN DEFAULT FALSE,
  welcome_email_sent BOOLEAN DEFAULT FALSE,
  welcome_page_shown BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_company_settings UNIQUE(company_id)
);

-- Índices
CREATE INDEX idx_company_settings_company_id ON company_settings(company_id);
CREATE INDEX idx_company_settings_first_login ON company_settings(first_login_at);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_company_settings_updated_at();

-- =====================================================
-- RLS Policies
-- =====================================================

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Users can view their own company settings
DROP POLICY IF EXISTS "Users can view their company settings" ON company_settings;
CREATE POLICY "Users can view their company settings"
ON company_settings FOR SELECT
USING (
  company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- Users can update their own company settings
DROP POLICY IF EXISTS "Users can update their company settings" ON company_settings;
CREATE POLICY "Users can update their company settings"
ON company_settings FOR UPDATE
USING (
  company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
)
WITH CHECK (
  company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  )
);

-- Admins/owners can insert company settings
DROP POLICY IF EXISTS "Admins can insert company settings" ON company_settings;
CREATE POLICY "Admins can insert company settings"
ON company_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE company_settings IS 'Configuración y preferencias de empresa, incluyendo tracking de setup inicial';
COMMENT ON COLUMN company_settings.setup_completed IS 'JSON object tracking completion of initial setup steps';
COMMENT ON COLUMN company_settings.first_login_at IS 'Timestamp del primer login después de aprobación de onboarding';
COMMENT ON COLUMN company_settings.tour_completed IS 'Indica si el usuario completó el tour guiado del dashboard';
