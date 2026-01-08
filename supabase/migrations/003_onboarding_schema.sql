-- =====================================================
-- Migration 003: Onboarding Schema
-- Description: Creates tables for onboarding process with KYC/KYB verification
-- Dependencies: 001_initial_schema.sql, 002_rls_policies.sql
-- =====================================================

-- Create ENUM types for onboarding workflow
CREATE TYPE onboarding_status AS ENUM (
  'draft',              -- User started but hasn't submitted
  'in_progress',        -- Actively completing steps
  'pending_review',     -- All steps complete, awaiting admin review
  'approved',           -- KYC approved, ready for account creation
  'rejected',           -- KYC rejected
  'requires_update'     -- Needs user to update information
);

CREATE TYPE account_preference AS ENUM ('peso', 'dolar', 'both');

CREATE TYPE verification_method AS ENUM ('socure_id_plus', 'socure_docv', 'manual');

-- =====================================================
-- Table: onboarding_cases
-- Description: Main table for tracking onboarding progress and KYC/KYB data
-- =====================================================
CREATE TABLE onboarding_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    -- Onboarding progress
    status onboarding_status DEFAULT 'draft' NOT NULL,
    current_step VARCHAR(50) DEFAULT 'start',
    completed_steps TEXT[] DEFAULT '{}',

    -- Account preferences (NEW REQUIREMENT)
    account_preference account_preference,

    -- Identity verification (Socure ID+)
    socure_document_uuid VARCHAR(255),      -- Socure DocV reference
    socure_reference_id VARCHAR(255),       -- Socure ID+ reference
    socure_fraud_score NUMERIC(5, 4),       -- Sigma fraud score (0-1)
    socure_decision VARCHAR(50),            -- accept/reject/review/refer
    socure_reasons TEXT[],                  -- Failure reasons if any
    liveness_score NUMERIC(5, 4),           -- Selfie liveness score
    liveness_verified_at TIMESTAMPTZ,

    -- OFAC/PEP validation
    ofac_screening_id VARCHAR(255),         -- External screening reference
    ofac_match_found BOOLEAN DEFAULT FALSE,
    pep_match_found BOOLEAN DEFAULT FALSE,
    sanctions_screened_at TIMESTAMPTZ,
    sanctions_provider VARCHAR(50),         -- e.g., 'sanctions.io'

    -- Onboarding data (JSON for flexibility)
    company_data JSONB DEFAULT '{}',        -- company_info step
    address_data JSONB DEFAULT '{}',        -- company_address step
    ownership_data JSONB DEFAULT '{}',      -- ownership step
    activity_data JSONB DEFAULT '{}',       -- expected_activity step
    followup_data JSONB DEFAULT '{}',       -- follow_up step

    -- Document tracking
    documents_uploaded INTEGER DEFAULT 0,
    documents_verified INTEGER DEFAULT 0,

    -- Admin review
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    rejection_reason TEXT,

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT valid_fraud_score CHECK (socure_fraud_score IS NULL OR (socure_fraud_score >= 0 AND socure_fraud_score <= 1)),
    CONSTRAINT valid_liveness_score CHECK (liveness_score IS NULL OR (liveness_score >= 0 AND liveness_score <= 1))
);

-- Indexes for onboarding_cases
CREATE INDEX idx_onboarding_cases_user_id ON onboarding_cases(user_id);
CREATE INDEX idx_onboarding_cases_status ON onboarding_cases(status);
CREATE INDEX idx_onboarding_cases_company_id ON onboarding_cases(company_id);
CREATE INDEX idx_onboarding_cases_created_at ON onboarding_cases(created_at DESC);
CREATE INDEX idx_onboarding_cases_reviewed_by ON onboarding_cases(reviewed_by) WHERE reviewed_by IS NOT NULL;

-- =====================================================
-- Table: identity_verifications
-- Description: Track Socure ID+ verification attempts (selfie + liveness)
-- =====================================================
CREATE TABLE identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_case_id UUID NOT NULL REFERENCES onboarding_cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    verification_method verification_method NOT NULL,

    -- Socure ID+ specific
    socure_reference_id VARCHAR(255),
    document_type VARCHAR(50),              -- 'cedula', 'passport'
    document_number VARCHAR(100),
    selfie_url TEXT,
    liveness_score NUMERIC(5, 4),

    -- Results
    verification_status VARCHAR(50),        -- 'success', 'failed', 'review'
    decision VARCHAR(50),                   -- Socure decision
    confidence_score NUMERIC(5, 4),
    failure_reasons TEXT[],

    -- OCR extracted data
    extracted_data JSONB DEFAULT '{}',

    provider_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_liveness CHECK (liveness_score IS NULL OR (liveness_score >= 0 AND liveness_score <= 1)),
    CONSTRAINT valid_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1))
);

-- Indexes for identity_verifications
CREATE INDEX idx_identity_verifications_case_id ON identity_verifications(onboarding_case_id);
CREATE INDEX idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_created_at ON identity_verifications(created_at DESC);

-- =====================================================
-- Table: sanctions_screenings
-- Description: Track OFAC/PEP screening results
-- =====================================================
CREATE TABLE sanctions_screenings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    onboarding_case_id UUID NOT NULL REFERENCES onboarding_cases(id) ON DELETE CASCADE,

    -- Screened entity
    entity_type VARCHAR(50) NOT NULL,       -- 'company', 'individual'
    entity_name VARCHAR(255) NOT NULL,
    entity_identifier VARCHAR(100),         -- RNC or cédula
    entity_country VARCHAR(2),

    -- Provider info
    provider VARCHAR(50) NOT NULL,          -- 'sanctions.io', 'ofac-api'
    screening_reference VARCHAR(255),

    -- Results
    ofac_match BOOLEAN DEFAULT FALSE,
    pep_match BOOLEAN DEFAULT FALSE,
    sanctions_match BOOLEAN DEFAULT FALSE,
    adverse_media_match BOOLEAN DEFAULT FALSE,

    match_details JSONB DEFAULT '[]',       -- Array of matches with scores
    risk_score NUMERIC(5, 2),               -- 0-100

    screened_at TIMESTAMPTZ DEFAULT NOW(),
    provider_response JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_risk_score CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100)),
    CONSTRAINT valid_entity_type CHECK (entity_type IN ('company', 'individual'))
);

-- Indexes for sanctions_screenings
CREATE INDEX idx_sanctions_screenings_case_id ON sanctions_screenings(onboarding_case_id);
CREATE INDEX idx_sanctions_screenings_entity_name ON sanctions_screenings(entity_name);
CREATE INDEX idx_sanctions_screenings_created_at ON sanctions_screenings(created_at DESC);
CREATE INDEX idx_sanctions_screenings_matches ON sanctions_screenings(ofac_match, pep_match, sanctions_match);

-- =====================================================
-- Update: company_documents table
-- Description: Add Socure DocV verification fields
-- =====================================================
ALTER TABLE company_documents
  ADD COLUMN IF NOT EXISTS socure_document_uuid VARCHAR(255),
  ADD COLUMN IF NOT EXISTS socure_verification_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ocr_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS extraction_confidence NUMERIC(5, 4),
  ADD COLUMN IF NOT EXISTS document_side VARCHAR(20); -- 'front', 'back'

-- Indexes for company_documents
CREATE INDEX IF NOT EXISTS idx_company_documents_type ON company_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_company_documents_socure_uuid ON company_documents(socure_document_uuid) WHERE socure_document_uuid IS NOT NULL;

-- Add constraint for extraction confidence
ALTER TABLE company_documents
  ADD CONSTRAINT valid_extraction_confidence
  CHECK (extraction_confidence IS NULL OR (extraction_confidence >= 0 AND extraction_confidence <= 1));

-- =====================================================
-- Functions
-- =====================================================

-- Function to increment documents uploaded count
CREATE OR REPLACE FUNCTION increment_documents_uploaded(case_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE onboarding_cases
  SET
    documents_uploaded = documents_uploaded + 1,
    updated_at = NOW()
  WHERE id = case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update onboarding case timestamp
CREATE OR REPLACE FUNCTION update_onboarding_case_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for onboarding_cases updated_at
CREATE TRIGGER trigger_onboarding_cases_updated_at
  BEFORE UPDATE ON onboarding_cases
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_case_timestamp();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE onboarding_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanctions_screenings ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_cases
CREATE POLICY "Users can view their own onboarding cases"
  ON onboarding_cases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding cases"
  ON onboarding_cases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding cases"
  ON onboarding_cases FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policies for onboarding_cases (assuming is_admin flag in users table)
CREATE POLICY "Admins can view all onboarding cases"
  ON onboarding_cases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner' -- Or create is_admin boolean field
    )
  );

CREATE POLICY "Admins can update all onboarding cases"
  ON onboarding_cases FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
  );

-- Policies for identity_verifications
CREATE POLICY "Users can view their own identity verifications"
  ON identity_verifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own identity verifications"
  ON identity_verifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all identity verifications"
  ON identity_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
  );

-- Policies for sanctions_screenings
CREATE POLICY "Users can view sanctions screenings for their cases"
  ON sanctions_screenings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM onboarding_cases
      WHERE onboarding_cases.id = sanctions_screenings.onboarding_case_id
      AND onboarding_cases.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all sanctions screenings"
  ON sanctions_screenings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'owner'
    )
  );

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE onboarding_cases IS 'Main table for tracking business onboarding applications with KYC/KYB data';
COMMENT ON TABLE identity_verifications IS 'Identity verification attempts using Socure ID+ or other methods';
COMMENT ON TABLE sanctions_screenings IS 'OFAC, PEP, and sanctions list screening results';

COMMENT ON COLUMN onboarding_cases.status IS 'Current status of the onboarding case';
COMMENT ON COLUMN onboarding_cases.account_preference IS 'User selected account currency: peso, dolar, or both';
COMMENT ON COLUMN onboarding_cases.socure_fraud_score IS 'Socure Sigma fraud detection score (0-1, higher is more fraudulent)';
COMMENT ON COLUMN onboarding_cases.liveness_score IS 'Liveness detection score from selfie verification (0-1)';
COMMENT ON COLUMN onboarding_cases.ofac_match_found IS 'Whether entity was found on OFAC sanctions list';
COMMENT ON COLUMN onboarding_cases.pep_match_found IS 'Whether entity is a Politically Exposed Person';

-- =====================================================
-- End of Migration 003
-- =====================================================
