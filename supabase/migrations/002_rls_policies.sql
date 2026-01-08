-- RLS POLICIES: companies
-- ============================================

CREATE POLICY "Users can view their own company"
ON companies FOR SELECT
USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own company"
ON companies FOR UPDATE
USING (id = (SELECT company_id FROM users WHERE id = auth.uid()))
WITH CHECK (id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- RLS POLICIES: users
-- ============================================

CREATE POLICY "Users can view users from their company"
ON users FOR SELECT
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can insert new users"
ON users FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
        AND company_id = users.company_id
    )
);

-- ============================================
-- RLS POLICIES: accounts
-- ============================================

CREATE POLICY "Users can view their company accounts"
ON accounts FOR SELECT
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can create accounts"
ON accounts FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
        AND company_id = accounts.company_id
    )
);

CREATE POLICY "Admins can update accounts"
ON accounts FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('owner', 'admin')
        AND u.company_id = accounts.company_id
    )
);

-- ============================================
-- RLS POLICIES: transactions
-- ============================================

CREATE POLICY "Users can view their company transactions"
ON transactions FOR SELECT
USING (
    account_id IN (
        SELECT id FROM accounts
        WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
);

-- Las transacciones solo se crean mediante triggers o funciones del sistema
-- No hay INSERT policy para usuarios directos

-- ============================================
-- RLS POLICIES: transfers
-- ============================================

CREATE POLICY "Users can view their company transfers"
ON transfers FOR SELECT
USING (
    from_account_id IN (
        SELECT id FROM accounts
        WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
);

CREATE POLICY "Users can create transfers"
ON transfers FOR INSERT
WITH CHECK (
    from_account_id IN (
        SELECT id FROM accounts
        WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
);

CREATE POLICY "Users can update their pending transfers"
ON transfers FOR UPDATE
USING (
    from_account_id IN (
        SELECT id FROM accounts
        WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
    AND status = 'pending'
);

-- ============================================
-- RLS POLICIES: recipients
-- ============================================

CREATE POLICY "Users can manage their company recipients"
ON recipients FOR ALL
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- RLS POLICIES: cards
-- ============================================

CREATE POLICY "Users can view their cards or all company cards (admins)"
ON cards FOR SELECT
USING (
    card_holder_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
        AND company_id = (SELECT company_id FROM accounts WHERE id = cards.account_id)
    )
);

CREATE POLICY "Admins can create cards"
ON cards FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users u
        JOIN accounts a ON u.company_id = a.company_id
        WHERE u.id = auth.uid()
        AND u.role IN ('owner', 'admin')
        AND a.id = cards.account_id
    )
);

CREATE POLICY "Admins and card holders can update cards"
ON cards FOR UPDATE
USING (
    card_holder_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM users u
        JOIN accounts a ON u.company_id = a.company_id
        WHERE u.id = auth.uid()
        AND u.role IN ('owner', 'admin')
        AND a.id = cards.account_id
    )
);

-- ============================================
-- RLS POLICIES: card_transactions
-- ============================================

CREATE POLICY "Users can view their card transactions"
ON card_transactions FOR SELECT
USING (
    card_id IN (
        SELECT id FROM cards
        WHERE card_holder_id = auth.uid()
        OR account_id IN (
            SELECT id FROM accounts
            WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        )
    )
);

-- ============================================
-- RLS POLICIES: customers, products, invoices
-- ============================================

CREATE POLICY "Users can manage their company customers"
ON customers FOR ALL
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company products"
ON products FOR ALL
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company invoices"
ON invoices FOR ALL
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view invoice items of their company invoices"
ON invoice_items FOR SELECT
USING (
    invoice_id IN (
        SELECT id FROM invoices
        WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
);

-- ============================================
-- RLS POLICIES: Tax tables
-- ============================================

CREATE POLICY "Users can manage their company NCF records"
ON ncf_records FOR ALL
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company ITBIS declarations"
ON itbis_declarations FOR ALL
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- RLS POLICIES: KYC and documents
-- ============================================

CREATE POLICY "Users can view their company KYC verifications"
ON kyc_verifications FOR SELECT
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can view their company documents"
ON company_documents FOR SELECT
USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can upload documents for their company"
ON company_documents FOR INSERT
WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- ============================================
-- RLS POLICIES: Notifications
-- ============================================

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their notification preferences"
ON notification_preferences FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================
-- RLS POLICIES: Audit logs
-- ============================================

CREATE POLICY "Admins can view their company audit logs"
ON audit_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role IN ('owner', 'admin')
        AND company_id = audit_logs.company_id
    )
);

-- Audit logs se crean mediante triggers, no directamente por usuarios

-- ============================================
-- RLS POLICIES: Login logs
-- ============================================

CREATE POLICY "Users can view their own login logs"
ON login_logs FOR SELECT
USING (user_id = auth.uid());
```

## Próximos Pasos

