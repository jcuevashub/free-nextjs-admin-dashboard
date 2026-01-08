# Módulos para Banca Empresarial Digital - República Dominicana
## Inspirado en Mercury.com - Adaptado al Mercado Dominicano

---

## RESUMEN EJECUTIVO

Este documento detalla todos los módulos necesarios para crear una plataforma de banca empresarial digital inspirada en Mercury.com, adaptada específicamente para el mercado de la República Dominicana. El proyecto se basa en la estructura actual del dashboard Next.js existente y expande sus capacidades para incluir funcionalidades bancarias completas, cumplimiento regulatorio dominicano, y características modernas de fintech.

---

## ESTADO ACTUAL DEL PROYECTO

### Tecnologías Base
- **Framework**: Next.js 16.0.10 (App Router) + React 19.2.0 + TypeScript 5.9.3
- **UI/Estilos**: Tailwind CSS 4.1.17
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth con SSR
- **Gráficos**: ApexCharts 4.7.0
- **Calendario**: FullCalendar 6.1.19

### Funcionalidades Existentes
✅ Sistema de autenticación (login/signup)
✅ Dashboard con métricas y KPIs
✅ Gestión de transacciones (UI)
✅ Gestión de pagos y beneficiarios (UI)
✅ Gestión de tarjetas (UI)
✅ Gestión de cuentas (UI)
✅ Sistema de facturas y catálogo (UI)
✅ Perfil de usuario y empresa (UI)
✅ Calendario interactivo
✅ Reembolsos (UI)
✅ Sistema de temas (light/dark)
✅ Navegación responsive

**NOTA**: La mayoría de las funcionalidades actuales son solo UI. Requieren implementación de lógica de negocio, integración con APIs bancarias reales, y base de datos completa.

---

## MÓDULOS PRINCIPALES

### 1. MÓDULO DE CUENTAS BANCARIAS

#### 1.1 Cuentas de Cheques (Checking Accounts)
**Prioridad**: ALTA

**Funcionalidades**:
- Apertura de cuenta empresarial 100% digital
- Soporte multi-cuenta (cuenta principal + sub-cuentas)
- Cuentas en DOP (Pesos Dominicanos) y USD
- Sin saldo mínimo, sin cuotas mensuales
- Dashboard de balance en tiempo real
- Historial de transacciones con filtros avanzados
- Estados de cuenta mensuales automatizados
- Alertas de movimientos y balance bajo
- Bloqueo/desbloqueo temporal de cuenta

**Integraciones Necesarias**:
- Banco corresponsal dominicano (ej: Banco Popular, BHD, Banreservas)
- API de la Superintendencia de Bancos de República Dominicana
- Sistema de verificación KYC/AML local

**Tablas de Base de Datos**:
```sql
- accounts (id, company_id, account_number, account_type, currency, status, balance, created_at)
- account_holders (account_id, user_id, role, permissions)
- account_statements (account_id, period, file_url, generated_at)
- account_alerts (account_id, alert_type, threshold, enabled)
```

---

#### 1.2 Cuentas de Ahorro (Savings Accounts)
**Prioridad**: MEDIA

**Funcionalidades**:
- Cuentas de ahorro de alto rendimiento (yield)
- Tasa de interés competitiva (ej: hasta 8-12% anual en DOP)
- Liquidez alta - retiro en 24-48 horas
- Calculadora de intereses proyectados
- Transferencias automáticas de checking a savings
- Objetivos de ahorro personalizables
- Reportes de rendimiento mensual/anual

**Integraciones Necesarias**:
- Sistema de cálculo de intereses
- Integración con Banco Central de la República Dominicana para tasas de referencia

**Tablas de Base de Datos**:
```sql
- savings_accounts (id, checking_account_id, interest_rate, yield_balance, last_interest_date)
- savings_goals (id, savings_account_id, goal_name, target_amount, target_date, auto_transfer_amount)
- interest_transactions (id, savings_account_id, amount, rate, calculated_at)
```

---

#### 1.3 Seguro de Depósitos
**Prioridad**: ALTA

**Funcionalidades**:
- Cobertura de hasta DOP 500,000 por titular (según regulación local)
- Integración con FOGADE (Fondo de Garantía de Depósitos)
- Dashboard de cobertura de seguro
- Información educativa sobre protección de depósitos
- Certificados de cobertura descargables

**Integraciones Necesarias**:
- FOGADE API (si disponible)
- Sistema de reporte regulatorio

---

### 2. MÓDULO DE PAGOS Y TRANSFERENCIAS

#### 2.1 Transferencias Locales
**Prioridad**: ALTA

**Funcionalidades**:
- Transferencias interbancarias vía TEF (Transferencia Electrónica de Fondos)
- Transferencias ACH locales sin comisión
- Transferencias instantáneas entre cuentas de la plataforma
- Programación de pagos recurrentes
- Plantillas de beneficiarios guardadas
- Límites de transferencia configurables
- Verificación de cuenta bancaria (micro-depósitos)
- Notificaciones push/email de confirmación

**Integraciones Necesarias**:
- Red TEF de República Dominicana
- Sistema ACH local (Cámara de Compensación Electrónica)
- APIs de bancos locales para verificación de cuentas

**Tablas de Base de Datos**:
```sql
- transfers (id, from_account_id, to_account_id, amount, currency, reference, status, scheduled_date, executed_at)
- recipients (id, company_id, recipient_name, bank_name, account_number, account_type, verified)
- transfer_templates (id, company_id, template_name, recipient_id, amount, frequency)
- transfer_limits (account_id, daily_limit, monthly_limit, per_transaction_limit)
```

---

#### 2.2 Pagos de Facturas (Bill Pay)
**Prioridad**: ALTA

**Funcionalidades**:
- Pago automatizado de facturas de proveedores
- Lectura automática de facturas con IA (OCR)
- Extracción de datos: monto, beneficiario, fecha de vencimiento
- Recordatorio de facturas pendientes
- Programación de pagos recurrentes (ej: electricidad, internet, nómina)
- Integración con códigos QR de facturación dominicana
- Historial de pagos con archivos adjuntos

**Integraciones Necesarias**:
- API de OCR (ej: Google Cloud Vision, AWS Textract)
- Sistema de facturación electrónica de DGII
- Empresas de servicios públicos (EDENORTE, EDESUR, EDEESTE, CDEEE, INAPA, Claro, Altice)

**Tablas de Base de Datos**:
```sql
- bills (id, company_id, vendor_name, bill_number, amount, due_date, status, file_url, ocr_data)
- bill_payments (id, bill_id, account_id, payment_date, amount, confirmation_number)
- recurring_bills (id, company_id, vendor_name, amount, frequency, next_payment_date, auto_pay)
```

---

#### 2.3 Transferencias Internacionales
**Prioridad**: MEDIA-ALTA

**Funcionalidades**:
- Envío de remesas/pagos internacionales
- Soporte para USD, EUR, CAD, otras monedas principales
- Tipos de cambio competitivos en tiempo real
- Transferencias SWIFT
- Cálculo de comisiones transparente
- Tracking de transferencias internacionales
- Límites según regulaciones del Banco Central

**Integraciones Necesarias**:
- Proveedor de transferencias internacionales (ej: Wise API, Payoneer, TransferMate)
- API del Banco Central para tipos de cambio oficiales
- Sistema SWIFT para transferencias bancarias

**Tablas de Base de Datos**:
```sql
- international_transfers (id, account_id, recipient_name, recipient_bank, swift_code, amount, source_currency, target_currency, exchange_rate, fee, status, tracking_number)
- exchange_rates (currency_pair, rate, timestamp, source)
```

---

#### 2.4 Autorizaciones ACH
**Prioridad**: MEDIA

**Funcionalidades**:
- Gestión de autorizaciones ACH de débito/crédito
- Revocación de autorizaciones
- Límites por autorización
- Historial de transacciones ACH
- Notificaciones de cargos ACH pendientes

**Tablas de Base de Datos**:
```sql
- ach_authorizations (id, account_id, merchant_name, authorization_type, max_amount, status, authorized_at, revoked_at)
- ach_transactions (id, authorization_id, amount, description, transaction_date, status)
```

---

### 3. MÓDULO DE TARJETAS

#### 3.1 Tarjetas de Débito Empresariales
**Prioridad**: ALTA

**Funcionalidades**:
- Emisión de tarjetas virtuales instantáneas
- Emisión de tarjetas físicas (envío en 5-7 días)
- Tarjetas ilimitadas por empresa
- Configuración de límites por tarjeta (diario, mensual, por transacción)
- Categorías de gasto bloqueables (ej: bloquear compras de alcohol, entretenimiento)
- Tarjetas de un solo uso para seguridad
- Congelamiento/descongelamiento instantáneo
- Reemplazo de tarjetas perdidas/robadas
- Apple Pay / Google Pay compatible

**Integraciones Necesarias**:
- Procesador de tarjetas (ej: Marqeta, Stripe Issuing, o procesador local CardNET)
- Red de tarjetas (Visa o Mastercard)
- Proveedor de tarjetas físicas

**Tablas de Base de Datos**:
```sql
- cards (id, account_id, card_holder_id, card_number_encrypted, card_type, status, spending_limits, blocked_categories, expiry_date, cvv_encrypted, is_virtual)
- card_transactions (id, card_id, merchant_name, mcc_code, amount, currency, transaction_date, status, location)
- card_limits (card_id, daily_limit, monthly_limit, per_transaction_limit)
```

---

#### 3.2 Tarjetas de Crédito Empresariales
**Prioridad**: MEDIA

**Funcionalidades**:
- Línea de crédito empresarial
- Cashback del 1-3% en todas las compras
- Límite de crédito según historial de la empresa
- Estado de cuenta mensual
- Pago mínimo o pago total
- Puntos de recompensa
- Sin cuota anual (promoción)
- Tarjetas adicionales para empleados

**Integraciones Necesarias**:
- Sistema de scoring crediticio
- Buró de crédito dominicano (DataCrédito, TransUnion RD)
- Procesador de tarjetas de crédito

**Tablas de Base de Datos**:
```sql
- credit_cards (id, company_id, credit_limit, available_credit, balance, minimum_payment, due_date, apr, cashback_rate)
- credit_transactions (id, credit_card_id, amount, transaction_type, merchant_name, transaction_date, posted_date)
- credit_payments (id, credit_card_id, payment_amount, payment_date, payment_method)
- cashback_earnings (id, credit_card_id, transaction_id, cashback_amount, earned_date, redeemed)
```

---

### 4. MÓDULO DE GESTIÓN DE GASTOS

#### 4.1 Control de Gastos por Equipo
**Prioridad**: ALTA

**Funcionalidades**:
- Tarjetas virtuales asignadas a empleados/departamentos
- Límites de gasto por empleado/equipo/proyecto
- Categorización automática de gastos
- Aprobaciones de gastos multi-nivel
- Reportes de gastos por departamento
- Alertas de gastos excesivos
- Integración con políticas de la empresa

**Tablas de Base de Datos**:
```sql
- teams (id, company_id, team_name, budget, period)
- team_members (id, team_id, user_id, role)
- team_cards (id, team_id, card_id, assigned_to_user_id)
- expense_policies (id, company_id, policy_name, rules_json)
- expense_approvals (id, transaction_id, approver_id, status, requested_at, approved_at)
```

---

#### 4.2 Categorización Inteligente de Gastos
**Prioridad**: MEDIA

**Funcionalidades**:
- Categorización automática con IA/ML
- Categorías personalizables
- Etiquetas (tags) para proyectos/clientes
- Búsqueda avanzada de gastos
- Exportación de gastos por categoría
- Reglas de categorización automática

**Tablas de Base de Datos**:
```sql
- expense_categories (id, company_id, category_name, parent_category_id, color)
- expense_tags (id, company_id, tag_name, color)
- transaction_categories (transaction_id, category_id, confidence_score, auto_categorized)
- transaction_tags (transaction_id, tag_id)
- categorization_rules (id, company_id, merchant_pattern, category_id, tag_ids)
```

---

#### 4.3 Reembolsos de Empleados
**Prioridad**: MEDIA

**Funcionalidades**:
- Solicitud de reembolso con recibos adjuntos
- Flujo de aprobación configurable
- Pago directo a cuenta del empleado
- Tracking de solicitudes
- Recordatorios automáticos
- Integración con política de gastos

**Tablas de Base de Datos**:
```sql
- reimbursement_requests (id, employee_id, amount, description, receipt_urls, status, submitted_at, approved_at, paid_at)
- reimbursement_approvals (id, request_id, approver_id, status, comments, action_at)
```

---

### 5. MÓDULO DE CONTABILIDAD E IMPUESTOS

#### 5.1 Integración Contable
**Prioridad**: ALTA

**Funcionalidades**:
- Sincronización con QuickBooks, Xero, Zoho Books
- Exportación automática de transacciones
- Categorización según plan de cuentas
- Reconciliación bancaria automática
- Sincronización bidireccional
- Reportes contables pre-formateados

**Integraciones Necesarias**:
- QuickBooks API
- Xero API
- Zoho Books API
- Software contable local dominicano (ej: ContaFácil, Aspel)

**Tablas de Base de Datos**:
```sql
- accounting_integrations (id, company_id, provider, credentials_encrypted, sync_frequency, last_sync)
- chart_of_accounts (id, company_id, account_code, account_name, account_type, category_mapping)
- sync_logs (id, integration_id, sync_date, records_synced, errors)
```

---

#### 5.2 Gestión de ITBIS (Impuesto al Valor Agregado)
**Prioridad**: ALTA

**Funcionalidades**:
- Cálculo automático de ITBIS (18%) en transacciones
- Separación de compras con/sin ITBIS
- Retenciones de ITBIS automáticas (cuando aplique)
- Generación de declaración jurada IT-1 (ITBIS)
- Archivo de comprobantes fiscales (NCF)
- Calendario de vencimientos fiscales
- Alertas de fechas límite de pago (20 de cada mes)
- Reportes de ITBIS retenido y pagado

**Integraciones Necesarias**:
- API de la DGII (Dirección General de Impuestos Internos)
- Sistema de facturación electrónica
- Validador de NCF (Números de Comprobantes Fiscales)

**Tablas de Base de Datos**:
```sql
- tax_transactions (id, transaction_id, itbis_amount, itbis_rate, ncf, is_deductible, fiscal_period)
- itbis_declarations (id, company_id, period, total_purchases, total_sales, itbis_to_pay, itbis_withheld, file_url, filed_at, payment_status)
- ncf_records (id, company_id, ncf_number, ncf_type, rnc_supplier, amount, itbis, transaction_date, validated)
```

---

#### 5.3 Impuesto sobre la Renta (ISR)
**Prioridad**: MEDIA

**Funcionalidades**:
- Retenciones de ISR en pagos a proveedores
- Cálculo de retenciones según tipo (10%, 27%, 2%)
- Certificación de retenciones (formato 606/607)
- Generación de formularios IR-17 (anticipos mensuales)
- Declaración jurada IR-2 (anual)
- Estimación de impuestos proyectados
- Calendario fiscal del ISR

**Integraciones Necesarias**:
- DGII API para presentación de formularios
- Sistema de generación de reportes 606/607/608

**Tablas de Base de Datos**:
```sql
- isr_withholdings (id, payment_id, withholding_rate, amount_withheld, recipient_rnc, certificate_number, period)
- isr_declarations (id, company_id, fiscal_year, total_income, deductible_expenses, taxable_income, tax_calculated, tax_paid, file_url)
- tax_calendar (id, tax_type, due_date, description, company_id)
```

---

#### 5.4 Otros Impuestos Dominicanos
**Prioridad**: BAJA-MEDIA

**Funcionalidades**:
- Gestión de impuestos de activos
- Impuestos municipales
- TSS (Seguridad Social) para nómina
- ARS (Seguro de Salud)
- AFP (Pensiones)

**Tablas de Base de Datos**:
```sql
- other_taxes (id, company_id, tax_type, period, amount, due_date, paid_date, file_url)
```

---

### 6. MÓDULO DE FACTURACIÓN

#### 6.1 Emisión de Facturas
**Prioridad**: ALTA

**Funcionalidades**:
- Creación de facturas profesionales
- NCF asignados automáticamente según tipo
- Cumplimiento con normativa DGII
- Plantillas personalizables
- Facturación recurrente
- Multi-moneda (DOP, USD)
- Envío automático por email
- Portal de pago para clientes
- Recordatorios de pago automáticos

**Integraciones Necesarias**:
- Sistema de NCF de la DGII
- Pasarela de pagos (Azul, CardNET, tPago)
- Servicio de emails transaccionales (Resend, SendGrid)

**Tablas de Base de Datos**:
```sql
- invoices (id, company_id, customer_id, invoice_number, ncf, amount, itbis, total, due_date, status, issued_at, paid_at)
- invoice_items (id, invoice_id, description, quantity, unit_price, itbis_rate, total)
- invoice_templates (id, company_id, template_name, logo_url, custom_fields, footer_text)
- recurring_invoices (id, company_id, customer_id, template_id, frequency, next_issue_date, auto_send)
```

---

#### 6.2 Gestión de Clientes
**Prioridad**: MEDIA

**Funcionalidades**:
- Base de datos de clientes empresariales
- Información fiscal (RNC/Cédula)
- Historial de transacciones por cliente
- Facturación multi-cliente
- Segmentación de clientes
- Notas y recordatorios
- Exportación de datos

**Tablas de Base de Datos**:
```sql
- customers (id, company_id, customer_name, rnc_cedula, email, phone, address, payment_terms, status)
- customer_contacts (id, customer_id, contact_name, email, phone, role)
- customer_notes (id, customer_id, note, created_by, created_at)
```

---

#### 6.3 Catálogo de Productos/Servicios
**Prioridad**: BAJA-MEDIA

**Funcionalidades**:
- Catálogo de productos/servicios facturables
- Precios con/sin ITBIS
- SKUs y códigos internos
- Categorización
- Importación/exportación CSV
- Imágenes de productos
- Variantes y opciones

**Tablas de Base de Datos**:
```sql
- products (id, company_id, sku, product_name, description, unit_price, itbis_rate, category_id, image_url, status)
- product_categories (id, company_id, category_name, parent_id)
```

---

### 7. MÓDULO DE NÓMINA

#### 7.1 Gestión de Empleados
**Prioridad**: MEDIA

**Funcionalidades**:
- Base de datos de empleados
- Contratos y documentos
- Estructura organizacional
- Departamentos y roles
- Gestión de permisos de acceso

**Tablas de Base de Datos**:
```sql
- employees (id, company_id, employee_number, full_name, cedula, email, department_id, position, hire_date, salary, status)
- departments (id, company_id, department_name, manager_id)
- employee_documents (id, employee_id, document_type, file_url, uploaded_at)
```

---

#### 7.2 Procesamiento de Nómina
**Prioridad**: ALTA

**Funcionalidades**:
- Cálculo automático de salarios
- Descuentos obligatorios (TSS: 7.09% AFP, 3.04% SFS, 0.13% SRL)
- Retención de ISR según tramo
- Bonificaciones y comisiones
- Horas extras
- Préstamos a empleados
- Pago directo a cuentas bancarias
- Recibos de nómina digitales

**Integraciones Necesarias**:
- TSS (Tesorería de la Seguridad Social)
- ARS (Administradoras de Riesgos de Salud)
- AFP (Administradoras de Fondos de Pensiones)

**Tablas de Base de Datos**:
```sql
- payroll_periods (id, company_id, period_start, period_end, pay_date, status)
- payroll_items (id, payroll_period_id, employee_id, gross_salary, deductions_json, bonuses, net_salary, paid_at)
- payroll_deductions (id, payroll_item_id, deduction_type, amount)
- employee_loans (id, employee_id, loan_amount, installment_amount, remaining_balance, status)
```

---

#### 7.3 Reportes Laborales
**Prioridad**: MEDIA

**Funcionalidades**:
- Planilla TSS (TSS-1)
- Certificación de ingresos
- Liquidación de prestaciones laborales
- Reportes de vacaciones y permisos
- Historial salarial

**Tablas de Base de Datos**:
```sql
- tss_submissions (id, company_id, period, employees_count, total_salary, total_contributions, file_url, submitted_at)
- employee_time_off (id, employee_id, time_off_type, start_date, end_date, days, status, approved_by)
```

---

### 8. MÓDULO DE REPORTES Y ANALÍTICA

#### 8.1 Dashboard Financiero
**Prioridad**: ALTA

**Funcionalidades**:
- KPIs principales (ingresos, gastos, flujo de caja, balance)
- Gráficos de tendencias (ventas, gastos, márgenes)
- Cash flow projection (proyección de flujo de efectivo)
- Métricas personalizables
- Comparación período a período (MoM, YoY)
- Exportación de datos

**Componentes** (ya existen en el proyecto):
- `EcommerceMetrics.tsx` (adaptar para banca)
- `MonthlySalesChart.tsx` (adaptar para ingresos/gastos)
- `StatisticsChart.tsx` (usar para análisis financiero)

---

#### 8.2 Reportes Financieros
**Prioridad**: ALTA

**Funcionalidades**:
- Estado de resultados (P&L)
- Balance general
- Flujo de caja
- Reportes de gastos detallados
- Análisis de rentabilidad
- Reportes personalizados
- Exportación PDF/Excel
- Programación de reportes automáticos

**Tablas de Base de Datos**:
```sql
- financial_reports (id, company_id, report_type, period_start, period_end, data_json, generated_at, file_url)
- custom_reports (id, company_id, report_name, query_config_json, schedule, last_run)
```

---

#### 8.3 Analítica Avanzada
**Prioridad**: BAJA

**Funcionalidades**:
- Análisis de patrones de gasto
- Detección de anomalías
- Predicción de flujo de caja con ML
- Benchmarking con industria
- Insights automáticos con IA

**Integraciones Necesarias**:
- Servicio de ML (ej: AWS SageMaker, Google Cloud AI)
- API de datos de industria

---

### 9. MÓDULO DE SEGURIDAD Y CUMPLIMIENTO

#### 9.1 KYC/AML (Know Your Customer / Anti Money Laundering)
**Prioridad**: ALTA

**Funcionalidades**:
- Verificación de identidad empresarial
- Validación de RNC con DGII
- Verificación de representantes legales
- Screening contra listas de sancionados (OFAC, ONU)
- Due diligence mejorada para empresas de alto riesgo
- Monitoreo continuo
- Reporte de actividades sospechosas

**Integraciones Necesarias**:
- Proveedor KYC (ej: Onfido, Jumio, Persona)
- API de DGII para validación de RNC
- Base de datos de PEP (Personas Políticamente Expuestas)
- Listas de sanciones internacionales

**Tablas de Base de Datos**:
```sql
- kyc_verifications (id, company_id, verification_status, rnc_validated, legal_rep_verified, risk_score, verified_at, reviewed_by)
- aml_screenings (id, company_id, screening_date, lists_checked, matches_found, status, reviewed_by)
- suspicious_activity_reports (id, company_id, activity_description, reported_to, reported_at, status)
```

---

#### 9.2 Autenticación y Autorización
**Prioridad**: ALTA

**Funcionalidades**:
- Autenticación de dos factores (2FA) obligatoria
- Biometría (Face ID, Touch ID)
- Roles y permisos granulares
- SSO empresarial (SAML, OAuth)
- Sesiones seguras con expiración
- Logs de acceso detallados
- Detección de accesos sospechosos
- IP whitelisting

**Integraciones Necesarias**:
- Proveedor 2FA (ej: Authy, Twilio Verify)
- Servicio de autenticación SSO (ej: Auth0, Okta)

**Tablas de Base de Datos**:
```sql
- users (id, email, password_hash, role, company_id, 2fa_enabled, 2fa_secret, status, last_login)
- user_roles (id, company_id, role_name, permissions_json)
- user_permissions (user_id, resource, actions)
- login_logs (id, user_id, ip_address, user_agent, login_at, status, 2fa_verified)
- trusted_ips (id, company_id, ip_address, description, added_by, added_at)
```

---

#### 9.3 Auditoría y Logs
**Prioridad**: MEDIA

**Funcionalidades**:
- Registro completo de todas las acciones
- Logs inmutables
- Búsqueda y filtrado de logs
- Exportación para auditorías
- Retención según regulaciones (mínimo 5 años)
- Alertas de acciones críticas

**Tablas de Base de Datos**:
```sql
- audit_logs (id, user_id, action, resource_type, resource_id, changes_json, ip_address, user_agent, timestamp)
- critical_actions_log (id, user_id, action_type, description, approved_by, timestamp)
```

---

#### 9.4 Encriptación y Protección de Datos
**Prioridad**: ALTA

**Funcionalidades**:
- Encriptación de datos en reposo (AES-256)
- Encriptación en tránsito (TLS 1.3)
- Tokenización de datos sensibles (PAN de tarjetas)
- Key management system (KMS)
- Cumplimiento con regulaciones de protección de datos
- Políticas de retención de datos

**Integraciones Necesarias**:
- AWS KMS, Google Cloud KMS, o Azure Key Vault
- Solución de encriptación a nivel de base de datos

---

### 10. MÓDULO DE ONBOARDING Y VERIFICACIÓN

#### 10.1 Registro de Empresa
**Prioridad**: ALTA

**Funcionalidades**:
- Formulario de registro paso a paso
- Validación de RNC en tiempo real
- Carga de documentos corporativos (Registro Mercantil, estatutos)
- Verificación de representantes legales
- Firma digital de términos y condiciones
- Proceso 100% digital
- Tiempo estimado: 24-48 horas

**Documentos Requeridos**:
- RNC de la empresa
- Registro Mercantil
- Estatutos sociales
- Cédula del representante legal
- Comprobante de dirección

**Tablas de Base de Datos**:
```sql
- company_applications (id, company_name, rnc, legal_rep_name, legal_rep_cedula, email, phone, status, submitted_at, approved_at)
- company_documents (id, application_id, document_type, file_url, verified, uploaded_at)
- onboarding_steps (application_id, step_name, status, completed_at)
```

---

#### 10.2 Verificación de Identidad
**Prioridad**: ALTA

**Funcionalidades**:
- Verificación de cédula dominicana con JCE (Junta Central Electoral)
- Selfie con liveness detection
- Verificación de documentos de identidad
- Firma electrónica certificada

**Integraciones Necesarias**:
- API de JCE para validación de cédula
- Proveedor de verificación de identidad (ej: Onfido, Jumio)

**Tablas de Base de Datos**:
```sql
- identity_verifications (id, user_id, cedula, full_name, birth_date, selfie_url, document_url, liveness_passed, jce_validated, verified_at)
```

---

### 11. MÓDULO DE API Y AUTOMATIZACIÓN

#### 11.1 API Pública
**Prioridad**: MEDIA-ALTA

**Funcionalidades**:
- RESTful API completa
- Autenticación con API keys
- Rate limiting
- Webhooks para eventos
- Documentación interactiva (OpenAPI/Swagger)
- SDKs en múltiples lenguajes
- Sandbox para pruebas

**Endpoints Principales**:
```
GET /accounts
GET /transactions
POST /transfers
POST /bill-payments
GET /cards
POST /cards/virtual
GET /invoices
POST /invoices
GET /recipients
```

**Tablas de Base de Datos**:
```sql
- api_keys (id, company_id, key_name, key_hash, permissions_json, created_at, last_used, expires_at)
- api_logs (id, api_key_id, endpoint, method, status_code, response_time, timestamp)
- webhooks (id, company_id, event_type, url, secret, enabled, created_at)
- webhook_deliveries (id, webhook_id, event_data, response_status, delivered_at, retries)
```

---

#### 11.2 Automatizaciones
**Prioridad**: MEDIA

**Funcionalidades**:
- Reglas de automatización personalizables
- Transferencias programadas
- Pagos recurrentes automáticos
- Categorización automática
- Alertas personalizadas
- Reconciliación automática

**Ejemplos de Automatizaciones**:
- "Si el balance baja de X, transferir Y de savings a checking"
- "Cada 1ro del mes, pagar factura de internet"
- "Si una transacción supera X, enviar alerta al CFO"

**Tablas de Base de Datos**:
```sql
- automation_rules (id, company_id, rule_name, trigger_type, trigger_config_json, action_type, action_config_json, enabled)
- automation_executions (id, rule_id, executed_at, success, output_data)
```

---

### 12. MÓDULO DE NOTIFICACIONES

#### 12.1 Notificaciones en Tiempo Real
**Prioridad**: ALTA

**Funcionalidades**:
- Push notifications (móvil y web)
- Email notifications
- SMS notifications (para eventos críticos)
- Notificaciones en la app
- Centro de notificaciones
- Configuración de preferencias
- Modo "No molestar"

**Eventos que Disparan Notificaciones**:
- Transferencia recibida/enviada
- Pago procesado
- Tarjeta usada
- Balance bajo
- Factura vencida
- Login desde nuevo dispositivo
- Cambio de contraseña
- Transacción sospechosa

**Integraciones Necesarias**:
- Firebase Cloud Messaging (FCM)
- Servicio de email (Resend, SendGrid)
- Servicio de SMS (Twilio, MessageBird)

**Tablas de Base de Datos**:
```sql
- notifications (id, user_id, type, title, message, data_json, read, created_at)
- notification_preferences (user_id, channel, event_type, enabled)
- push_tokens (id, user_id, device_type, token, created_at)
```

---

### 13. MÓDULO DE SOPORTE Y AYUDA

#### 13.1 Centro de Ayuda
**Prioridad**: MEDIA

**Funcionalidades**:
- Base de conocimientos (KB)
- FAQs categorizadas
- Guías paso a paso
- Videos tutoriales
- Búsqueda de artículos
- Artículos sugeridos según contexto

**Categorías**:
- Primeros pasos
- Cuentas y tarjetas
- Pagos y transferencias
- Facturación
- Impuestos y contabilidad
- Seguridad
- API y automatización

---

#### 13.2 Sistema de Tickets
**Prioridad**: MEDIA

**Funcionalidades**:
- Creación de tickets de soporte
- Categorización de problemas
- Asignación automática
- Priorización
- Historial de conversaciones
- Attachments
- SLA tracking
- Encuestas de satisfacción

**Tablas de Base de Datos**:
```sql
- support_tickets (id, company_id, user_id, subject, category, priority, status, assigned_to, created_at, resolved_at)
- ticket_messages (id, ticket_id, sender_id, message, attachments, sent_at)
- ticket_satisfaction (ticket_id, rating, feedback, submitted_at)
```

---

#### 13.3 Chat en Vivo
**Prioridad**: BAJA-MEDIA

**Funcionalidades**:
- Chat en tiempo real con soporte
- Chatbot con IA para preguntas comunes
- Transferencia a agente humano
- Horarios de atención
- Chat history

**Integraciones Necesarias**:
- Plataforma de chat (ej: Intercom, Zendesk Chat, Crisp)
- AI chatbot (ej: OpenAI, Anthropic Claude)

---

### 14. MÓDULO DE CRÉDITO Y FINANCIAMIENTO

#### 14.1 Líneas de Crédito
**Prioridad**: MEDIA

**Funcionalidades**:
- Solicitud de línea de crédito empresarial
- Evaluación crediticia automatizada
- Aprobación rápida (24-48 horas)
- Líneas desde DOP 100,000 hasta DOP 10,000,000
- Tasas competitivas
- Pago flexible
- Dashboard de crédito utilizado vs disponible

**Integraciones Necesarias**:
- Buró de crédito (DataCrédito RD, TransUnion)
- Sistema de scoring interno
- API de entidades financieras

**Tablas de Base de Datos**:
```sql
- credit_applications (id, company_id, requested_amount, purpose, status, submitted_at, approved_at)
- credit_lines (id, company_id, credit_limit, available_credit, interest_rate, maturity_date, status)
- credit_draws (id, credit_line_id, amount, purpose, drawn_at, repayment_schedule_json)
- credit_payments (id, credit_draw_id, payment_amount, principal, interest, payment_date)
```

---

#### 14.2 Préstamos a Corto Plazo
**Prioridad**: BAJA

**Funcionalidades**:
- Préstamos de capital de trabajo
- Préstamos para inventario
- Financiamiento de facturas (invoice financing)
- Aprobación rápida
- Términos de 3-12 meses

---

### 15. MÓDULO DE INVERSIONES

#### 15.1 Fondos de Inversión
**Prioridad**: BAJA

**Funcionalidades**:
- Inversión en fondos de renta fija
- Fondos de renta variable
- Fondos mixtos
- Portafolios personalizados según riesgo
- Rendimientos proyectados
- Reporte de performance

**Integraciones Necesarias**:
- Puestos de bolsa dominicanos
- API de mercado de valores

---

### 16. MÓDULO MÓVIL

#### 16.1 Aplicación iOS
**Prioridad**: ALTA

**Funcionalidades**:
- Todas las funcionalidades principales
- Touch ID / Face ID
- Notificaciones push
- Escaneo de cheques
- Depósito móvil (si regulación lo permite)
- Congelamiento rápido de tarjetas

**Tecnologías**:
- React Native o Swift nativo
- Biometría nativa

---

#### 16.2 Aplicación Android
**Prioridad**: ALTA

**Funcionalidades**:
- Paridad con iOS
- Fingerprint / Face unlock
- Google Pay integration

**Tecnologías**:
- React Native o Kotlin nativo

---

### 17. MÓDULO DE COMPLIANCE REGULATORIO

#### 17.1 Reportes Regulatorios
**Prioridad**: ALTA

**Funcionalidades**:
- Reportes automáticos a Superintendencia de Bancos
- Reportes de transacciones sospechosas a UAF (Unidad de Análisis Financiero)
- Cumplimiento con Ley 155-17 contra Lavado de Activos
- Reportes de transacciones en efectivo mayores a USD 10,000
- Archivos FATCA (si aplica)

**Integraciones Necesarias**:
- API de Superintendencia de Bancos
- API de UAF (Unidad de Análisis Financiero)

---

#### 17.2 Prevención de Fraude
**Prioridad**: ALTA

**Funcionalidades**:
- Detección de transacciones sospechosas con ML
- Reglas de fraude configurables
- Bloqueo automático de transacciones riesgosas
- Verificación de transacciones (step-up authentication)
- Monitoreo 24/7
- Alertas en tiempo real

**Integraciones Necesarias**:
- Servicio de detección de fraude (ej: Sift, Stripe Radar)

**Tablas de Base de Datos**:
```sql
- fraud_rules (id, rule_name, conditions_json, action, enabled)
- fraud_alerts (id, transaction_id, rule_triggered, risk_score, status, reviewed_by, reviewed_at)
- blocked_transactions (id, transaction_id, reason, blocked_at, unblocked_at)
```

---

### 18. MÓDULO DE TESORERÍA

#### 18.1 Cash Management
**Prioridad**: MEDIA

**Funcionalidades**:
- Proyección de flujo de caja
- Optimización de liquidez
- Sweeping automático entre cuentas
- Alertas de posición de caja
- Reportes de tesorería

---

#### 18.2 Gestión de Tipos de Cambio
**Prioridad**: MEDIA

**Funcionalidades**:
- Compra/venta de divisas
- Forward contracts
- Hedging de riesgo cambiario
- Alertas de tipos de cambio

**Integraciones Necesarias**:
- Banco Central de la República Dominicana API
- Proveedores de FX

---

## ARQUITECTURA TÉCNICA PROPUESTA

### Stack Tecnológico Completo

#### Frontend
- **Framework**: Next.js 16 con App Router
- **UI**: Tailwind CSS 4 + Headless UI
- **Charts**: ApexCharts
- **State Management**: Zustand o Redux Toolkit
- **Forms**: React Hook Form + Zod
- **Data Fetching**: React Query / SWR

#### Backend
- **API**: Next.js API Routes (serverless)
- **Alternative**: NestJS + Express (para mayor escalabilidad)
- **Authentication**: Supabase Auth + JWT
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Queue**: BullMQ + Redis
- **Cron Jobs**: node-cron o GitHub Actions

#### Infraestructura
- **Hosting**: Vercel (frontend) + AWS/DigitalOcean (backend)
- **Database**: Supabase o AWS RDS
- **File Storage**: AWS S3 o Supabase Storage
- **CDN**: Cloudflare
- **Monitoring**: Sentry + Datadog
- **Analytics**: PostHog o Mixpanel

#### Seguridad
- **WAF**: Cloudflare
- **DDoS Protection**: Cloudflare
- **Secrets Management**: AWS Secrets Manager / Doppler
- **Encryption**: AWS KMS
- **SSL/TLS**: Let's Encrypt (auto-renew)

---

## INTEGRACIONES EXTERNAS NECESARIAS

### Servicios Financieros Dominicanos

1. **Bancos Corresponsales**
   - Banco Popular Dominicano
   - BHD León
   - Banco de Reservas
   - Banco Santa Cruz
   - Banesco

2. **Redes de Pagos**
   - Red TEF
   - ACH República Dominicana
   - Cámara de Compensación Electrónica

3. **Procesadores de Tarjetas**
   - CardNET (principal en RD)
   - Azul (Banco Popular)
   - VisaNet

4. **Pasarelas de Pago**
   - Azul Payment Gateway
   - CardNET Gateway
   - tPago
   - UepaPay

### Servicios Gubernamentales

1. **DGII (Dirección General de Impuestos Internos)**
   - API de validación de RNC
   - API de NCF
   - Sistema de facturación electrónica
   - Portal de presentación de declaraciones

2. **JCE (Junta Central Electoral)**
   - API de validación de cédulas

3. **TSS (Tesorería de la Seguridad Social)**
   - API de reportes de nómina

4. **Superintendencia de Bancos**
   - Reportes regulatorios

5. **UAF (Unidad de Análisis Financiero)**
   - Reportes de transacciones sospechosas

### Servicios de Terceros

1. **KYC/AML**
   - Onfido, Jumio, o Persona
   - ComplyAdvantage (screening)

2. **Detección de Fraude**
   - Sift Science
   - Stripe Radar

3. **Emails Transaccionales**
   - Resend (ya configurado)
   - SendGrid (alternativa)

4. **SMS**
   - Twilio
   - MessageBird
   - Proveedor local (Claro, Altice)

5. **Contabilidad**
   - QuickBooks Online API
   - Xero API
   - Zoho Books API

6. **OCR**
   - Google Cloud Vision
   - AWS Textract

7. **Firma Electrónica**
   - DocuSign
   - HelloSign / Dropbox Sign

---

## ROADMAP DE IMPLEMENTACIÓN SUGERIDO

### FASE 1: MVP (Mínimo Producto Viable) - 3-4 meses

**Prioridad ALTA - Core Banking**

✅ Módulos Esenciales:
1. Módulo de Onboarding y Verificación
   - Registro de empresas
   - KYC/AML básico

2. Módulo de Cuentas Bancarias
   - Cuentas de cheques en DOP
   - Dashboard de balance
   - Historial de transacciones

3. Módulo de Pagos
   - Transferencias locales básicas
   - Gestión de beneficiarios

4. Módulo de Autenticación y Seguridad
   - 2FA obligatorio
   - Roles básicos
   - Auditoría

5. Módulo de Notificaciones
   - Email notifications
   - In-app notifications

**Entregables Fase 1**:
- Plataforma web funcional
- Apertura de cuentas 100% digital
- Transferencias bancarias
- Sistema de seguridad robusto

---

### FASE 2: Expansión de Funcionalidades - 2-3 meses

**Prioridad MEDIA-ALTA**

✅ Módulos:
1. Módulo de Tarjetas
   - Tarjetas virtuales
   - Control de gastos básico

2. Módulo de Facturación
   - Emisión de facturas con NCF
   - Gestión de clientes

3. Módulo de Impuestos (ITBIS)
   - Cálculo automático
   - Declaraciones IT-1

4. Módulo de Pagos Avanzado
   - Bill Pay con OCR
   - Pagos recurrentes

5. Módulo de Reportes
   - Dashboard financiero completo
   - Reportes básicos (P&L, Cash Flow)

**Entregables Fase 2**:
- Tarjetas virtuales operativas
- Sistema de facturación completo
- Cumplimiento fiscal ITBIS
- Reportes financieros

---

### FASE 3: Características Avanzadas - 2-3 meses

**Prioridad MEDIA**

✅ Módulos:
1. Módulo de Contabilidad
   - Integración QuickBooks/Xero
   - Reconciliación automática

2. Módulo de Nómina
   - Procesamiento de nómina
   - Integración TSS

3. Módulo de Tarjetas Físicas
   - Emisión de tarjetas físicas
   - Cashback

4. Módulo de API Pública
   - RESTful API
   - Webhooks
   - Documentación

5. Módulo de Ahorro
   - Cuentas de ahorro con yield
   - Objetivos de ahorro

**Entregables Fase 3**:
- Integración contable completa
- Sistema de nómina
- API pública para desarrolladores
- Cuentas de ahorro

---

### FASE 4: Mobile y Optimización - 2 meses

**Prioridad MEDIA-ALTA**

✅ Módulos:
1. Aplicación Móvil iOS
2. Aplicación Móvil Android
3. Optimización de Performance
4. Mejoras de UX basadas en feedback

**Entregables Fase 4**:
- Apps móviles nativas
- Performance optimizado
- UX mejorado

---

### FASE 5: Fintech Avanzado - 3-4 meses

**Prioridad BAJA-MEDIA**

✅ Módulos:
1. Módulo de Crédito
   - Líneas de crédito
   - Scoring crediticio

2. Módulo de Transferencias Internacionales
   - Wire transfers
   - Remesas

3. Módulo de Inversiones
   - Fondos de inversión

4. Módulo de Tesorería Avanzada
   - FX trading
   - Cash management

5. IA y Automatización
   - Chatbot inteligente
   - Detección de fraude con ML
   - Insights automáticos

**Entregables Fase 5**:
- Productos de crédito
- Transferencias internacionales
- Capacidades de inversión
- IA integrada

---

## ESTIMACIÓN DE RECURSOS

### Equipo Mínimo para MVP (Fase 1)

1. **Product Manager** - 1
2. **Tech Lead / Arquitecto** - 1
3. **Full-Stack Developers** - 3-4
4. **Frontend Developer** - 2
5. **Backend Developer** - 2
6. **DevOps Engineer** - 1
7. **QA Engineer** - 1-2
8. **UI/UX Designer** - 1
9. **Compliance Officer** - 1
10. **Security Engineer** - 1 (consultoría)

**Total**: ~13-15 personas

---

### Costos Estimados Mensuales (Fase 1)

#### Personal (RD)
- Tech Lead: USD 5,000 - 7,000
- Senior Developer: USD 3,500 - 5,000 x4 = USD 14,000 - 20,000
- Mid Developer: USD 2,500 - 3,500 x3 = USD 7,500 - 10,500
- DevOps: USD 4,000 - 6,000
- QA: USD 2,500 - 3,500 x2 = USD 5,000 - 7,000
- Designer: USD 2,500 - 3,500
- PM: USD 4,000 - 6,000
- Compliance: USD 3,000 - 5,000

**Subtotal Personal**: ~USD 45,000 - 65,000/mes

#### Infraestructura y Servicios
- Hosting (Vercel + AWS): USD 500 - 2,000
- Supabase: USD 25 - 500
- APIs externas (KYC, OCR, etc.): USD 1,000 - 3,000
- Monitoring y Analytics: USD 200 - 500
- Email/SMS: USD 100 - 500
- Licencias de software: USD 500 - 1,000

**Subtotal Infraestructura**: ~USD 2,325 - 7,500/mes

#### Otros
- Legal y Compliance: USD 5,000 - 10,000
- Seguros: USD 1,000 - 3,000
- Contingencia: USD 5,000

**Subtotal Otros**: ~USD 11,000 - 18,000/mes

**TOTAL ESTIMADO MENSUAL**: USD 58,325 - 90,500

**TOTAL FASE 1 (4 meses)**: USD 233,300 - 362,000

---

## CONSIDERACIONES ESPECIALES PARA REPÚBLICA DOMINICANA

### 1. Regulaciones Financieras
- Obtener licencia de entidad financiera o asociarse con banco corresponsal
- Cumplimiento con Ley Monetaria y Financiera 183-02
- Ley 155-17 contra Lavado de Activos
- Regulaciones de la Superintendencia de Bancos

### 2. Fiscalidad
- ITBIS (18%) en servicios aplicables
- ISR corporativo (27%)
- Retenciones según tabla
- Impuesto de activos (1%)
- TSS para empleados

### 3. Infraestructura Local
- Servidores en RD o latencia optimizada
- Cumplimiento con Ley 172-13 de Protección de Datos
- Backup y disaster recovery

### 4. Particularidades del Mercado
- Preferencia por transacciones en efectivo (cultura a cambiar)
- Adopción creciente de pagos digitales
- WhatsApp Business muy popular (considerar integración)
- Mobile-first approach (alto uso de smartphones)

### 5. Competencia
- Bancos tradicionales digitalizándose
- Nuevas fintechs emergentes (Pronto, Mango, otros)
- Diferenciar con UX superior y sin comisiones

---

## MÉTRICAS DE ÉXITO (KPIs)

### Métricas de Producto
- **Tiempo de onboarding**: < 48 horas
- **Tiempo de apertura de cuenta**: < 10 minutos (usuario)
- **Uptime**: > 99.9%
- **Tiempo de procesamiento de transferencias**: < 5 segundos

### Métricas de Negocio
- **Empresas activas**: Meta 1,000 empresas en año 1
- **Volumen de transacciones**: Meta USD 10M/mes en año 1
- **Ingresos por empresa**: USD 50-100/mes (promedio)
- **CAC (Costo de Adquisición de Cliente)**: < USD 500
- **LTV (Lifetime Value)**: > USD 3,000
- **Churn mensual**: < 3%

### Métricas de Usuario
- **NPS (Net Promoter Score)**: > 50
- **Satisfacción de soporte**: > 4.5/5
- **Tiempo de respuesta de soporte**: < 2 horas

---

## RIESGOS Y MITIGACIÓN

### Riesgos Técnicos
1. **Integración con bancos locales lenta**
   - Mitigación: Tener 2-3 bancos backup, negociar SLAs

2. **Scalabilidad de infraestructura**
   - Mitigación: Arquitectura cloud-native, auto-scaling

3. **Seguridad y fraude**
   - Mitigación: Múltiples capas de seguridad, auditorías regulares

### Riesgos de Negocio
1. **Cambios regulatorios**
   - Mitigación: Equipo legal dedicado, monitoreo constante

2. **Competencia de bancos tradicionales**
   - Mitigación: Diferenciación en UX y precios, innovación rápida

3. **Adopción lenta del mercado**
   - Mitigación: Marketing educativo, programa de embajadores

### Riesgos Operacionales
1. **Retención de talento**
   - Mitigación: Compensación competitiva, equity, cultura

2. **Costos operativos mayores a lo esperado**
   - Mitigación: Budget con contingencia 20%, optimización continua

---

## CONCLUSIÓN

Este documento detalla **18 módulos principales** con **50+ sub-módulos** necesarios para crear una plataforma de banca empresarial digital completa inspirada en Mercury.com pero adaptada a la República Dominicana.

### Módulos Prioritarios para MVP:
1. ✅ Onboarding y Verificación
2. ✅ Cuentas Bancarias (Checking)
3. ✅ Pagos y Transferencias
4. ✅ Seguridad y Autenticación
5. ✅ Notificaciones

### Diferenciadores Clave vs Mercury:
- ✅ Cumplimiento total con regulaciones dominicanas (ITBIS, ISR, TSS)
- ✅ Integración con ecosistema de pagos local (Azul, CardNET, tPago)
- ✅ Soporte multi-moneda (DOP/USD)
- ✅ Facturación electrónica con NCF
- ✅ Nómina con TSS integrado
- ✅ Culturalmente adaptado (WhatsApp, español, soporte local)

### Próximos Pasos:
1. **Validación de mercado**: Entrevistas con 50-100 empresas objetivo
2. **Alianzas estratégicas**: Negociar con banco corresponsal
3. **Compliance legal**: Consultar con abogados especializados en fintech
4. **Fundraising**: Levantar USD 500K - 1M para MVP
5. **Reclutamiento**: Formar equipo core
6. **Desarrollo**: Iniciar Fase 1

---

## FUENTES Y REFERENCIAS

### Mercury.com Features
- [Mercury - Online Business Banking](https://mercury.com)
- [Partnering with Mercury - Sequoia Capital](https://sequoiacap.com/article/partnering-with-mercury-the-business-banking-platform-of-the-future/)
- [Mercury Banking Review 2026 - Startup Savant](https://startupsavant.com/service-reviews/mercury-bank)
- [Mercury Bank Review - Wise](https://wise.com/us/blog/mercury-bank-reviews)

### República Dominicana - Impuestos y Regulaciones
- [ITBIS - DGII](https://dgii.gov.do/cicloContribuyente/obligacionesTributarias/principalesImpuestos/Paginas/Itbis.aspx)
- [El ITBIS en la República Dominicana - PHLaw](https://phlaw.com/post/the-itbis-in-the-dominican-republic-a-complete-guide-for-businesses-and-professionals/)
- [Retención de impuestos en RD - PHLaw](https://phlaw.com/post/tax-withholding-in-the-dominican-republic-a-complete-guide-by-tax-type-for-businesses-and-professionals/)
- [Dominican Republic Corporate Taxes - PWC](https://taxsummaries.pwc.com/dominican-republic/corporate/other-taxes)

### Pasarelas de Pago RD
- [Pasarelas de Pago en República Dominicana 2025 - Nexux](https://nexux.do/pasarelas-de-pago-republica-dominicana-2025/)
- [Ecollect - Pasarelas de Pagos](https://www.ecollect.co/republica-dominicana)
- [CardNET - Pasarelas de Pagos](https://www.pasarelasdepagos.com/plataformas/cardnet/)
- [Medios de pagos electrónicos en RD - Inába](https://www.inabaweb.com/medios-de-pagos-electronicos-en-republica-dominicana/)

---

**Documento creado**: 2026-01-08
**Versión**: 1.0
**Autor**: Claude Code (Anthropic)
**Proyecto**: free-nextjs-admin-dashboard → Banca Empresarial RD

---

_Este documento es un plan vivo y debe actualizarse según evolucionen los requisitos del proyecto, regulaciones, y feedback del mercado._
