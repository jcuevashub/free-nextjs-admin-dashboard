CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TIPOS ENUM
-- ============================================

CREATE TYPE account_type AS ENUM ('checking', 'savings');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'closed', 'pending_verification');
CREATE TYPE currency_code AS ENUM ('DOP', 'USD');
CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'transfer', 'fee', 'adjustment');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'reversed');
CREATE TYPE transfer_type AS ENUM ('internal', 'tef', 'ach', 'international');
CREATE TYPE card_type AS ENUM ('virtual', 'physical');
CREATE TYPE card_status AS ENUM ('active', 'frozen', 'cancelled', 'pending');
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE kyc_status AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'requires_update');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'accountant', 'employee', 'viewer');
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push', 'in_app');
CREATE TYPE ncf_type AS ENUM ('B01', 'B02', 'B14', 'B15', 'B16');

-- ============================================
-- TABLA: companies
-- ============================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rnc VARCHAR(11) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    company_email VARCHAR(255) NOT NULL,
    company_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'DO',
    industry VARCHAR(100),
    website VARCHAR(255),
    logo_url TEXT,
    status account_status DEFAULT 'pending_verification',
    kyc_status kyc_status DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT rnc_format CHECK (rnc ~ '^[0-9]{9,11}$')
);

CREATE INDEX idx_companies_rnc ON companies(rnc);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_kyc_status ON companies(kyc_status);

-- ============================================
-- TABLA: users
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    cedula VARCHAR(11),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    role user_role DEFAULT 'employee',
    permissions JSONB DEFAULT '{}',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    backup_codes TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT cedula_format CHECK (cedula IS NULL OR cedula ~ '^[0-9]{11}$')
);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_cedula ON users(cedula);

-- ============================================
-- TABLA: accounts
-- ============================================

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type account_type DEFAULT 'checking',
    currency currency_code DEFAULT 'DOP',
    account_name VARCHAR(255),
    balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    available_balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    pending_balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    daily_transfer_limit NUMERIC(15, 2),
    monthly_transfer_limit NUMERIC(15, 2),
    status account_status DEFAULT 'pending_verification',
    is_primary BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    CONSTRAINT balance_non_negative CHECK (balance >= 0),
    CONSTRAINT available_balance_non_negative CHECK (available_balance >= 0)
);

CREATE INDEX idx_accounts_company_id ON accounts(company_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_status ON accounts(status);
CREATE INDEX idx_accounts_currency ON accounts(currency);

-- ============================================
-- TABLA: transactions
-- ============================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_type transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency currency_code NOT NULL,
    balance_after NUMERIC(15, 2) NOT NULL,
    description TEXT,
    reference_number VARCHAR(100),
    external_id VARCHAR(100),
    counterparty_name VARCHAR(255),
    counterparty_account VARCHAR(50),
    counterparty_bank VARCHAR(100),
    status transaction_status DEFAULT 'pending',
    category VARCHAR(100),
    tags TEXT[],
    itbis_amount NUMERIC(15, 2) DEFAULT 0.00,
    itbis_rate NUMERIC(5, 2) DEFAULT 0.00,
    is_tax_deductible BOOLEAN DEFAULT FALSE,
    ncf VARCHAR(19),
    metadata JSONB DEFAULT '{}',
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    posted_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference_number);
CREATE INDEX idx_transactions_ncf ON transactions(ncf);

-- ============================================
-- TABLA: transfers
-- ============================================

CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_account_id UUID NOT NULL REFERENCES accounts(id),
    to_account_id UUID REFERENCES accounts(id),
    transfer_type transfer_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency currency_code NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_account VARCHAR(50) NOT NULL,
    recipient_bank VARCHAR(100),
    recipient_rnc_cedula VARCHAR(11),
    description TEXT,
    reference VARCHAR(100),
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_date DATE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB,
    status transaction_status DEFAULT 'pending',
    fee_amount NUMERIC(15, 2) DEFAULT 0.00,
    exchange_rate NUMERIC(10, 4),
    confirmation_number VARCHAR(100),
    external_reference VARCHAR(100),
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    initiated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    executed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transfers_from_account ON transfers(from_account_id);
CREATE INDEX idx_transfers_to_account ON transfers(to_account_id);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_scheduled_date ON transfers(scheduled_date) WHERE is_scheduled = TRUE;
CREATE INDEX idx_transfers_created_at ON transfers(created_at DESC);

-- ============================================
-- TABLA: recipients
-- ============================================

CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_type VARCHAR(50),
    rnc_cedula VARCHAR(11),
    email VARCHAR(255),
    phone VARCHAR(20),
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_type VARCHAR(50),
    swift_code VARCHAR(11),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verification_method VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    is_favorite BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

CREATE INDEX idx_recipients_company_id ON recipients(company_id);
CREATE INDEX idx_recipients_rnc_cedula ON recipients(rnc_cedula);
CREATE INDEX idx_recipients_is_active ON recipients(is_active);

-- ============================================
-- TABLA: cards
-- ============================================

CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    card_holder_id UUID NOT NULL REFERENCES users(id),
    card_number_encrypted TEXT NOT NULL,
    card_type card_type DEFAULT 'virtual',
    card_name VARCHAR(255),
    status card_status DEFAULT 'pending',
    daily_limit NUMERIC(15, 2),
    monthly_limit NUMERIC(15, 2),
    per_transaction_limit NUMERIC(15, 2),
    blocked_categories TEXT[],
    expiry_date DATE NOT NULL,
    cvv_encrypted TEXT NOT NULL,
    is_physical BOOLEAN DEFAULT FALSE,
    shipping_address TEXT,
    activated_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_cards_account_id ON cards(account_id);
CREATE INDEX idx_cards_holder_id ON cards(card_holder_id);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_cards_type ON cards(card_type);

-- ============================================
-- TABLA: card_transactions
-- ============================================

CREATE TABLE card_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    merchant_name VARCHAR(255),
    mcc_code VARCHAR(4),
    amount NUMERIC(15, 2) NOT NULL,
    currency currency_code NOT NULL,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    status transaction_status DEFAULT 'completed',
    location TEXT,
    category VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX idx_card_transactions_date ON card_transactions(transaction_date DESC);
CREATE INDEX idx_card_transactions_merchant ON card_transactions(merchant_name);

-- ============================================
-- TABLA: customers (clientes de la empresa)
-- ============================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    rnc_cedula VARCHAR(11),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(2) DEFAULT 'DO',
    payment_terms INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_customers_rnc_cedula ON customers(rnc_cedula);
CREATE INDEX idx_customers_status ON customers(status);

-- ============================================
-- TABLA: products
-- ============================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    unit_price NUMERIC(15, 2) NOT NULL,
    itbis_rate NUMERIC(5, 2) DEFAULT 18.00,
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_active ON products(is_active);

-- ============================================
-- TABLA: invoices
-- ============================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    ncf VARCHAR(19),
    ncf_type ncf_type,
    amount NUMERIC(15, 2) NOT NULL,
    itbis NUMERIC(15, 2) DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL,
    currency currency_code DEFAULT 'DOP',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    status invoice_status DEFAULT 'draft',
    payment_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    terms TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_ncf ON invoices(ncf);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ============================================
-- TABLA: invoice_items
-- ============================================

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(15, 2) NOT NULL,
    itbis_rate NUMERIC(5, 2) DEFAULT 18.00,
    itbis_amount NUMERIC(15, 2) DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product_id ON invoice_items(product_id);

-- ============================================
-- TABLA: ncf_records
-- ============================================

CREATE TABLE ncf_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    ncf VARCHAR(19) UNIQUE NOT NULL,
    ncf_type ncf_type NOT NULL,
    rnc_supplier VARCHAR(11),
    supplier_name VARCHAR(255),
    amount NUMERIC(15, 2) NOT NULL,
    itbis NUMERIC(15, 2) DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ncf_records_company_id ON ncf_records(company_id);
CREATE INDEX idx_ncf_records_ncf ON ncf_records(ncf);
CREATE INDEX idx_ncf_records_date ON ncf_records(transaction_date);

-- ============================================
-- TABLA: itbis_declarations
-- ============================================

CREATE TABLE itbis_declarations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL,
    total_purchases NUMERIC(15, 2) DEFAULT 0.00,
    total_sales NUMERIC(15, 2) DEFAULT 0.00,
    itbis_purchases NUMERIC(15, 2) DEFAULT 0.00,
    itbis_sales NUMERIC(15, 2) DEFAULT 0.00,
    itbis_to_pay NUMERIC(15, 2) DEFAULT 0.00,
    itbis_withheld NUMERIC(15, 2) DEFAULT 0.00,
    file_url TEXT,
    filed_at TIMESTAMPTZ,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_date DATE,
    payment_reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_period UNIQUE (company_id, period_year, period_month)
);

CREATE INDEX idx_itbis_declarations_company ON itbis_declarations(company_id);
CREATE INDEX idx_itbis_declarations_period ON itbis_declarations(period_year, period_month);

-- ============================================
-- TABLA: kyc_verifications
-- ============================================

CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL,
    verification_status kyc_status DEFAULT 'pending',
    rnc_validated BOOLEAN DEFAULT FALSE,
    legal_rep_verified BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    risk_score NUMERIC(5, 2),
    provider VARCHAR(50),
    provider_response JSONB,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_verifications_company ON kyc_verifications(company_id);
CREATE INDEX idx_kyc_verifications_status ON kyc_verifications(verification_status);

-- ============================================
-- TABLA: company_documents
-- ============================================

CREATE TABLE company_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_documents_company ON company_documents(company_id);
CREATE INDEX idx_company_documents_type ON company_documents(document_type);

-- ============================================
-- TABLA: notifications
-- ============================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel notification_channel DEFAULT 'in_app',
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- TABLA: notification_preferences
-- ============================================

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_channel_event UNIQUE (user_id, channel, event_type)
);

CREATE INDEX idx_notif_prefs_user ON notification_preferences(user_id);

-- ============================================
-- TABLA: audit_logs
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- TABLA: login_logs
-- ============================================

CREATE TABLE login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    two_fa_verified BOOLEAN DEFAULT FALSE,
    failure_reason TEXT
);

CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_login_at ON login_logs(login_at DESC);

-- ============================================
-- TRIGGERS: updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipients_updated_at BEFORE UPDATE ON recipients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON kyc_verifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Generar Account Number
-- ============================================

CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        new_number := 'ACC' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
        SELECT COUNT(*) INTO exists_check FROM accounts WHERE account_number = new_number;
        EXIT WHEN exists_check = 0;
    END LOOP;
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Calcular ITBIS (18%)
-- ============================================

CREATE OR REPLACE FUNCTION calculate_itbis(amount NUMERIC, rate NUMERIC DEFAULT 18.00)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(amount * (rate / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncf_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE itbis_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
```

### Archivo: `supabase/migrations/002_rls_policies.sql`

```sql
-- ============================================
-- RLS POLICIES: companies
-- ============================================
