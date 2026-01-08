# Plan Post-Aprobación de Onboarding

**Versión:** 1.0
**Fecha:** 2026-01-08
**Estado:** Planificación

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Flujo Automático Post-Aprobación](#flujo-automático-post-aprobación)
3. [Primera Experiencia del Usuario](#primera-experiencia-del-usuario)
4. [Configuración Inicial Recomendada](#configuración-inicial-recomendada)
5. [Arquitectura Técnica](#arquitectura-técnica)
6. [Implementación por Fases](#implementación-por-fases)
7. [Métricas de Éxito](#métricas-de-éxito)

---

## Resumen Ejecutivo

Este documento define el flujo completo que ocurre después de que un administrador **aprueba** un caso de onboarding empresarial. El objetivo es proporcionar una experiencia fluida desde la aprobación hasta que la empresa esté completamente operativa en la plataforma.

### Objetivos

1. ✅ Crear automáticamente la empresa y cuentas bancarias
2. ✅ Notificar al usuario de la aprobación
3. ✅ Guiar al usuario en la configuración inicial
4. ✅ Asegurar que el usuario entienda todas las funcionalidades disponibles
5. ✅ Reducir tiempo hasta la primera transacción (Time to First Transaction - TTFT)

### KPIs Clave

- **TTFT (Time to First Transaction):** < 24 horas desde aprobación
- **Tasa de activación:** > 90% de empresas aprobadas realizan al menos 1 transacción en 7 días
- **Tasa de configuración completa:** > 80% completan todos los pasos de setup inicial
- **NPS (Net Promoter Score):** > 50 en primera semana

---

## Flujo Automático Post-Aprobación

### 1. Admin Aprueba el Caso KYC

**Acción:** Admin hace clic en "Aprobar" en `/admin/kyc-review/[caseId]`

**Server Action:** `approveCaseAction()` en `/src/app/actions/kyc/approve-case.ts`

**Proceso Actual (Ya Implementado):**

```typescript
// 1. Verificar role de admin
if (profile.role !== 'owner') {
  return { error: 'No autorizado' };
}

// 2. Crear empresa si no existe
const { data: company } = await supabase
  .from('companies')
  .insert({
    rnc: onboardingCase.company_data.rnc,
    company_name: onboardingCase.company_data.companyName,
    legal_name: onboardingCase.company_data.legalName,
    company_email: onboardingCase.company_data.email,
    company_phone: onboardingCase.company_data.phone,
    industry: onboardingCase.company_data.industry,
    status: 'active', // ← Empresa activa inmediatamente
  })
  .select()
  .single();

// 3. Actualizar usuario con company_id
await supabase
  .from('users')
  .update({ company_id: company.id })
  .eq('id', onboardingCase.user_id);

// 4. Crear cuentas bancarias según account_preference
const accountsToCreate = [];

if (accountPreference === 'peso' || accountPreference === 'both') {
  accountsToCreate.push({
    company_id: company.id,
    currency: 'DOP',
    account_type: 'checking',
    balance: 0,
    status: 'active',
    account_number: generateAccountNumber(),
  });
}

if (accountPreference === 'dolar' || accountPreference === 'both') {
  accountsToCreate.push({
    company_id: company.id,
    currency: 'USD',
    account_type: 'checking',
    balance: 0,
    status: 'active',
    account_number: generateAccountNumber(),
  });
}

await supabase.from('accounts').insert(accountsToCreate);

// 5. Actualizar estado del onboarding case
await supabase
  .from('onboarding_cases')
  .update({
    status: 'approved',
    reviewed_at: new Date().toISOString(),
    reviewed_by: admin.id,
    completed_at: new Date().toISOString(),
  })
  .eq('id', caseId);
```

### 2. Acciones Adicionales Post-Aprobación (A Implementar)

#### 2.1 Enviar Email de Bienvenida

**Trigger:** Inmediatamente después de aprobar caso

**Template Email:**
```
Asunto: ¡Tu cuenta de Fintech RD ha sido aprobada! 🎉

Hola [Nombre],

¡Excelentes noticias! Tu solicitud de apertura de cuenta empresarial ha sido aprobada.

✅ Empresa: [Nombre de Empresa]
✅ RNC: [RNC]
✅ Cuentas creadas:
   - Cuenta en Pesos (DOP): [Número de cuenta]
   - Cuenta en Dólares (USD): [Número de cuenta] (si aplica)

Próximos pasos:
1. Inicia sesión en tu cuenta: https://fintechrd.com/signin
2. Completa la configuración inicial
3. Realiza tu primera transacción

¿Necesitas ayuda? Contáctanos en soporte@fintechrd.com

¡Bienvenido a Fintech RD!

---
El equipo de Fintech RD
```

**Implementación:**
```typescript
// En approve-case.ts, después de actualizar el caso

import { sendWelcomeEmail } from '@/lib/email/templates';

await sendWelcomeEmail({
  to: onboardingCase.company_data.email,
  userName: `${onboardingCase.applicant_first_name} ${onboardingCase.applicant_last_name}`,
  companyName: company.company_name,
  accounts: accountsCreated,
});
```

#### 2.2 Crear Notificación In-App

**Trigger:** Inmediatamente después de aprobar

**Implementación:**
```typescript
await supabase.from('notifications').insert({
  user_id: onboardingCase.user_id,
  type: 'onboarding_approved',
  title: '¡Cuenta aprobada!',
  message: `Tu cuenta empresarial ha sido aprobada. Ya puedes acceder a todas las funcionalidades de Fintech RD.`,
  action_url: '/dashboard',
  read: false,
});
```

#### 2.3 Crear Registro de Auditoría

**Tabla:** `audit_logs`

```typescript
await supabase.from('audit_logs').insert({
  user_id: admin.id,
  company_id: company.id,
  action: 'ONBOARDING_APPROVED',
  entity_type: 'onboarding_case',
  entity_id: caseId,
  metadata: {
    approved_by: admin.email,
    accounts_created: accountsCreated.length,
    account_preference: accountPreference,
  },
});
```

#### 2.4 Inicializar Configuración Default

**Crear registros en:**

1. **`notification_preferences`** (Preferencias de notificaciones)
```typescript
await supabase.from('notification_preferences').insert({
  user_id: onboardingCase.user_id,
  channel: 'email',
  transaction_alerts: true,
  kyc_updates: true,
  product_updates: false,
});
```

2. **`company_settings`** (Nueva tabla sugerida)
```typescript
await supabase.from('company_settings').insert({
  company_id: company.id,
  timezone: 'America/Santo_Domingo',
  currency: accountPreference === 'both' ? 'DOP' : accountPreference === 'peso' ? 'DOP' : 'USD',
  language: 'es',
  fiscal_year_end: '12-31',
});
```

---

## Primera Experiencia del Usuario

### 3. Usuario Inicia Sesión Post-Aprobación

#### 3.1 Middleware Detecta Aprobación

**Archivo:** `/middleware.ts`

**Flujo actual:**
```typescript
// Usuario tiene caso con status='approved'
if (onboardingCase?.status === 'approved') {
  return res; // Permite acceso al dashboard
}
```

**Nuevo flujo con flag de "primera vez":**
```typescript
if (onboardingCase?.status === 'approved') {
  // Verificar si es la primera vez que accede después de aprobación
  const isFirstLogin = !onboardingCase.first_login_at;

  if (isFirstLogin && pathname === '/') {
    // Redirigir a página de bienvenida
    return NextResponse.redirect(new URL('/welcome', req.url));
  }

  return res; // Acceso normal al dashboard
}
```

#### 3.2 Página de Bienvenida (`/welcome`)

**Ruta:** `/src/app/(onboarding)/welcome/page.tsx`

**Diseño:**

```tsx
export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header con confetti animation */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <CheckCircleIcon className="w-20 h-20 text-success-500 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            ¡Bienvenido a Fintech RD! 🎉
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Tu cuenta empresarial ha sido aprobada y está lista para usar.
          </p>
        </div>

        {/* Información de cuentas creadas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Tus Cuentas</h2>

          <div className="space-y-4">
            {accounts.map(account => (
              <div key={account.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    Cuenta {account.currency}
                  </p>
                  <p className="text-sm text-gray-500">
                    {account.account_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  <span className="text-xs text-success-500 bg-success-50 dark:bg-success-900/20 px-2 py-1 rounded">
                    Activa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Próximos Pasos</h2>

          <div className="space-y-4">
            <StepCard
              number={1}
              title="Completa tu perfil empresarial"
              description="Agrega logo, información de facturación, y preferencias"
              action="Ir a perfil"
              href="/company-profile"
              icon={BuildingIcon}
            />

            <StepCard
              number={2}
              title="Invita a tu equipo"
              description="Agrega empleados y asigna roles (admin, contador, etc.)"
              action="Invitar equipo"
              href="/settings/team"
              icon={UsersIcon}
            />

            <StepCard
              number={3}
              title="Configura métodos de pago"
              description="Agrega tarjetas y cuentas bancarias para transferencias"
              action="Configurar"
              href="/settings/payment-methods"
              icon={CreditCardIcon}
            />

            <StepCard
              number={4}
              title="Realiza tu primera transacción"
              description="Prueba enviar una transferencia o crear una factura"
              action="Ver opciones"
              href="/dashboard"
              icon={ArrowRightIcon}
              isPrimary
            />
          </div>
        </div>

        {/* CTA Principal */}
        <div className="text-center">
          <button
            onClick={handleStartTour}
            className="btn btn-primary btn-lg mr-4"
          >
            Hacer un tour guiado
          </button>
          <button
            onClick={handleSkipToMandDashboard}
            className="btn btn-outline btn-lg"
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 3.3 Tour Guiado Interactivo

**Biblioteca:** [Shepherd.js](https://shepherdjs.dev/) o [Intro.js](https://introjs.com/)

**Pasos del Tour:**

```typescript
const tourSteps = [
  {
    id: 'dashboard-overview',
    title: 'Tu Dashboard',
    text: 'Aquí verás un resumen de tus cuentas, transacciones recientes y métricas clave.',
    attachTo: { element: '.dashboard-overview', on: 'bottom' },
  },
  {
    id: 'accounts-sidebar',
    title: 'Navegación',
    text: 'Usa el menú lateral para navegar entre cuentas, transacciones, tarjetas y más.',
    attachTo: { element: '.sidebar-nav', on: 'right' },
  },
  {
    id: 'quick-actions',
    title: 'Acciones Rápidas',
    text: 'Accede rápidamente a transferencias, pagos y facturación desde aquí.',
    attachTo: { element: '.quick-actions', on: 'bottom' },
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    text: 'Mantente al tanto de transacciones, alertas y mensajes importantes.',
    attachTo: { element: '.notifications-bell', on: 'bottom' },
  },
  {
    id: 'company-settings',
    title: 'Configuración',
    text: 'Personaliza tu perfil empresarial, equipo y preferencias desde aquí.',
    attachTo: { element: '.settings-menu', on: 'left' },
  },
];
```

**Implementación:**
```tsx
'use client';

import { useEffect } from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export function useDashboardTour() {
  useEffect(() => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        classes: 'shepherd-theme-custom',
        scrollTo: { behavior: 'smooth', block: 'center' },
      },
    });

    tourSteps.forEach(step => {
      tour.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: step.attachTo,
        buttons: [
          {
            text: 'Anterior',
            action: tour.back,
            secondary: true,
          },
          {
            text: step.id === 'company-settings' ? 'Finalizar' : 'Siguiente',
            action: tour.next,
          },
        ],
      });
    });

    return tour;
  }, []);
}
```

---

## Configuración Inicial Recomendada

### 4. Checklist de Setup Empresarial

**Componente:** `/src/components/dashboard/SetupChecklist.tsx`

**Estado guardado en:** `company_settings.setup_completed` (JSON)

```typescript
interface SetupChecklist {
  profile_completed: boolean;      // Logo, descripción, industria
  team_invited: boolean;           // Al menos 1 miembro adicional
  payment_methods_added: boolean;  // Al menos 1 método de pago
  first_transaction: boolean;      // Primera transferencia o factura
  ncf_configured: boolean;         // Configurar secuencias NCF (DGII)
}
```

**UI:**

```tsx
export function SetupChecklist() {
  const [setup, setSetup] = useState<SetupChecklist>({
    profile_completed: false,
    team_invited: false,
    payment_methods_added: false,
    first_transaction: false,
    ncf_configured: false,
  });

  const completionPercentage =
    (Object.values(setup).filter(Boolean).length / 5) * 100;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Configuración Inicial</h2>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Progreso</span>
            <span className="text-sm font-semibold">{completionPercentage}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={completionPercentage}
            max="100"
          />
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
          <ChecklistItem
            completed={setup.profile_completed}
            title="Completa tu perfil empresarial"
            description="Agrega logo, descripción e información de contacto"
            href="/company-profile"
          />

          <ChecklistItem
            completed={setup.team_invited}
            title="Invita a tu equipo"
            description="Agrega miembros y asigna roles"
            href="/settings/team"
          />

          <ChecklistItem
            completed={setup.payment_methods_added}
            title="Configura métodos de pago"
            description="Agrega tarjetas o cuentas bancarias"
            href="/settings/payment-methods"
          />

          <ChecklistItem
            completed={setup.ncf_configured}
            title="Configura NCF (DGII)"
            description="Obligatorio para facturación electrónica"
            href="/settings/ncf"
            badge="Requerido"
          />

          <ChecklistItem
            completed={setup.first_transaction}
            title="Realiza tu primera transacción"
            description="Prueba transferir o crear una factura"
            href="/transfers/new"
            isPrimary
          />
        </div>

        {completionPercentage === 100 && (
          <div className="alert alert-success mt-4">
            <CheckCircleIcon className="w-6 h-6" />
            <span>¡Configuración completa! Tu cuenta está lista para operar.</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 5. Widget de "Primeros Pasos" en Dashboard

**Ubicación:** Dashboard principal, arriba del fold

**Mostrar solo si:** `setup_completed !== true`

```tsx
<div className="mb-6">
  {!setupCompleted && <SetupChecklist />}
</div>
```

**Auto-ocultar cuando:** Usuario completa todos los pasos

---

## Arquitectura Técnica

### 6. Nuevas Tablas de Base de Datos

#### 6.1 `company_settings`

```sql
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Configuración general
  timezone VARCHAR(50) DEFAULT 'America/Santo_Domingo',
  language VARCHAR(5) DEFAULT 'es',
  currency currency_code DEFAULT 'DOP',

  -- Configuración fiscal
  fiscal_year_end DATE DEFAULT '12-31',
  tax_id VARCHAR(50), -- Adicional al RNC

  -- Setup checklist
  setup_completed JSONB DEFAULT '{
    "profile_completed": false,
    "team_invited": false,
    "payment_methods_added": false,
    "first_transaction": false,
    "ncf_configured": false
  }',

  -- Onboarding
  first_login_at TIMESTAMPTZ,
  tour_completed BOOLEAN DEFAULT FALSE,
  welcome_email_sent BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id)
);

CREATE INDEX idx_company_settings_company_id ON company_settings(company_id);
```

#### 6.2 Actualizar `onboarding_cases`

```sql
ALTER TABLE onboarding_cases
ADD COLUMN first_login_at TIMESTAMPTZ,
ADD COLUMN welcome_shown BOOLEAN DEFAULT FALSE;
```

#### 6.3 `onboarding_emails` (Log de emails enviados)

```sql
CREATE TABLE onboarding_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onboarding_case_id UUID NOT NULL REFERENCES onboarding_cases(id),
  email_type VARCHAR(50) NOT NULL, -- 'welcome', 'approved', 'rejected', etc.
  sent_to VARCHAR(255) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced'
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_emails_case_id ON onboarding_emails(onboarding_case_id);
CREATE INDEX idx_onboarding_emails_type ON onboarding_emails(email_type);
```

### 7. Server Actions Nuevos

#### 7.1 `/src/app/actions/onboarding/mark-welcome-shown.ts`

```typescript
'use server';

import { createSupabaseServer } from '@/lib/supabaseServer';

export async function markWelcomeShownAction() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticado' };

  // Actualizar onboarding_case
  await supabase
    .from('onboarding_cases')
    .update({
      welcome_shown: true,
      first_login_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('status', 'approved');

  return { success: true };
}
```

#### 7.2 `/src/app/actions/onboarding/complete-tour.ts`

```typescript
'use server';

import { createSupabaseServer } from '@/lib/supabaseServer';

export async function completeTourAction() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticado' };

  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    return { error: 'No company found' };
  }

  await supabase
    .from('company_settings')
    .update({ tour_completed: true })
    .eq('company_id', profile.company_id);

  return { success: true };
}
```

#### 7.3 `/src/app/actions/setup/update-checklist.ts`

```typescript
'use server';

import { createSupabaseServer } from '@/lib/supabaseServer';

interface UpdateChecklistInput {
  key: keyof SetupChecklist;
  completed: boolean;
}

export async function updateSetupChecklistAction(input: UpdateChecklistInput) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'No autenticado' };

  const { data: profile } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single();

  if (!profile?.company_id) {
    return { error: 'No company found' };
  }

  // Get current checklist
  const { data: settings } = await supabase
    .from('company_settings')
    .select('setup_completed')
    .eq('company_id', profile.company_id)
    .single();

  const currentChecklist = settings?.setup_completed || {};
  const updatedChecklist = {
    ...currentChecklist,
    [input.key]: input.completed,
  };

  // Update
  await supabase
    .from('company_settings')
    .update({
      setup_completed: updatedChecklist,
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', profile.company_id);

  return { success: true, checklist: updatedChecklist };
}
```

### 8. Email Service Integration

**Biblioteca:** [Resend](https://resend.com/) o [SendGrid](https://sendgrid.com/)

#### 8.1 `/src/lib/email/client.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Fintech RD <noreply@fintechrd.com>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
```

#### 8.2 `/src/lib/email/templates/welcome.tsx`

```tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components';

interface WelcomeEmailProps {
  userName: string;
  companyName: string;
  accounts: Array<{
    currency: string;
    account_number: string;
  }>;
}

export function WelcomeEmail({ userName, companyName, accounts }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Bienvenido a Fintech RD! 🎉</Heading>

          <Text style={text}>
            Hola {userName},
          </Text>

          <Text style={text}>
            ¡Excelentes noticias! Tu solicitud de apertura de cuenta empresarial para{' '}
            <strong>{companyName}</strong> ha sido aprobada.
          </Text>

          <div style={accountsBox}>
            <Heading style={h2}>Tus Cuentas</Heading>
            {accounts.map((account, i) => (
              <div key={i} style={accountItem}>
                <Text style={accountCurrency}>Cuenta {account.currency}</Text>
                <Text style={accountNumber}>{account.account_number}</Text>
              </div>
            ))}
          </div>

          <Heading style={h2}>Próximos Pasos</Heading>

          <ol style={list}>
            <li>Inicia sesión en tu cuenta</li>
            <li>Completa la configuración inicial</li>
            <li>Invita a tu equipo</li>
            <li>Realiza tu primera transacción</li>
          </ol>

          <Button
            style={button}
            href="https://fintechrd.com/signin"
          >
            Iniciar Sesión
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a href="mailto:soporte@fintechrd.com">soporte@fintechrd.com</a>
          </Text>

          <Text style={footer}>
            © 2026 Fintech RD. Todos los derechos reservados.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = { backgroundColor: '#f6f9fc', fontFamily: 'system-ui, sans-serif' };
const container = { margin: '0 auto', padding: '40px 20px', maxWidth: '600px' };
const h1 = { fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' };
const h2 = { fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' };
// ... más estilos
```

---

## Implementación por Fases

### Fase 1: Core Post-Aprobación (Semana 1-2)

**Prioridad:** Alta
**Esfuerzo:** 3-5 días

**Tareas:**

- [x] ✅ Ya implementado: `approveCaseAction` crea empresa y cuentas
- [ ] Crear tabla `company_settings`
- [ ] Crear tabla `onboarding_emails`
- [ ] Actualizar tabla `onboarding_cases` con campos adicionales
- [ ] Implementar email service (Resend/SendGrid)
- [ ] Crear template de email de bienvenida
- [ ] Actualizar `approveCaseAction` para enviar email
- [ ] Crear notificación in-app de aprobación
- [ ] Testing end-to-end del flujo

**Entregable:** Email automático + notificación cuando admin aprueba caso

### Fase 2: Página de Bienvenida (Semana 2-3)

**Prioridad:** Alta
**Esfuerzo:** 5-7 días

**Tareas:**

- [ ] Crear `/src/app/(onboarding)/welcome/page.tsx`
- [ ] Diseñar UI de bienvenida (confetti, cards de cuentas, próximos pasos)
- [ ] Implementar `markWelcomeShownAction`
- [ ] Actualizar middleware para redirigir a `/welcome` en primer login
- [ ] Crear componentes:
  - `WelcomeHeader` (con animación)
  - `AccountsDisplay` (mostrar cuentas creadas)
  - `NextStepsGuide` (cards con acciones)
- [ ] Testing UX

**Entregable:** Experiencia de bienvenida visual al primer login post-aprobación

### Fase 3: Setup Checklist (Semana 3-4)

**Prioridad:** Media
**Esfuerzo:** 5-7 días

**Tareas:**

- [ ] Crear componente `SetupChecklist.tsx`
- [ ] Implementar `updateSetupChecklistAction`
- [ ] Crear lógica de auto-detección de completitud:
  - Profile completed: verificar si tiene logo + descripción
  - Team invited: count de users > 1
  - Payment methods: count de payment_methods > 0
  - First transaction: count de transactions > 0
  - NCF configured: verificar ncf_records
- [ ] Integrar checklist en dashboard principal
- [ ] Crear widget dismissible (puede ocultar pero reaparece hasta completar)
- [ ] Analytics: trackear tiempo de completitud por empresa

**Entregable:** Checklist interactivo que guía configuración inicial

### Fase 4: Tour Guiado (Semana 4-5)

**Prioridad:** Media-Baja
**Esfuerzo:** 3-5 días

**Tareas:**

- [ ] Instalar Shepherd.js: `npm install shepherd.js`
- [ ] Crear hook `useDashboardTour()`
- [ ] Definir pasos del tour (5-7 pasos clave)
- [ ] Implementar `completeTourAction`
- [ ] Agregar botón "Hacer tour" en dashboard header
- [ ] Permitir re-tomar tour desde settings
- [ ] Analytics: % de usuarios que completan tour

**Entregable:** Tour interactivo opcional del dashboard

### Fase 5: Configuraciones Específicas (Semana 5-6)

**Prioridad:** Media
**Esfuerzo:** 7-10 días

**Tareas:**

#### 5.1 Configuración de NCF (DGII)
- [ ] Crear `/src/app/(admin)/settings/ncf/page.tsx`
- [ ] Form para agregar secuencias de NCF (B01, B02, B14, B15, B16)
- [ ] Validación con API de DGII (si existe)
- [ ] Guardar en tabla `ncf_records`

#### 5.2 Invitación de Equipo
- [ ] Crear `/src/app/(admin)/settings/team/page.tsx`
- [ ] Form de invitación por email
- [ ] Asignación de roles (owner, admin, accountant, employee)
- [ ] Email de invitación con link de activación
- [ ] Aceptación de invitación flow

#### 5.3 Métodos de Pago
- [ ] Crear `/src/app/(admin)/settings/payment-methods/page.tsx`
- [ ] Integrar con procesador de pagos (Stripe, etc.)
- [ ] Agregar tarjetas de crédito/débito
- [ ] Vincular cuentas bancarias externas (ACH)

**Entregable:** Páginas de configuración funcionales con forms y validación

### Fase 6: Analytics y Optimización (Semana 6-7)

**Prioridad:** Baja
**Esfuerzo:** 3-5 días

**Tareas:**

- [ ] Integrar analytics (Mixpanel, PostHog, o custom)
- [ ] Eventos a trackear:
  - `onboarding_approved`
  - `welcome_page_viewed`
  - `tour_started`
  - `tour_completed`
  - `setup_step_completed`
  - `first_transaction_created`
- [ ] Dashboard de métricas para admins:
  - Tiempo promedio de setup
  - % de usuarios que completan tour
  - TTFT (Time to First Transaction)
  - Tasa de activación por semana
- [ ] A/B testing de variantes de welcome page

**Entregable:** Dashboard de métricas de onboarding y activación

---

## Métricas de Éxito

### KPIs Primarios

| Métrica | Target | Actual | Método de Medición |
|---------|--------|--------|-------------------|
| **TTFT** (Time to First Transaction) | < 24h | TBD | Timestamp de aprobación → primera transacción |
| **Tasa de Activación (7 días)** | > 90% | TBD | % de empresas aprobadas que hacen ≥1 transacción en 7 días |
| **Setup Completion Rate** | > 80% | TBD | % que completan 5/5 pasos del checklist |
| **Tour Completion Rate** | > 60% | TBD | % que completan tour guiado |
| **Email Open Rate** | > 40% | TBD | % de emails de bienvenida abiertos |

### KPIs Secundarios

- **Tiempo promedio de setup:** < 30 minutos
- **NPS en primera semana:** > 50
- **% de usuarios que invitan equipo:** > 50%
- **% de usuarios que configuran NCF:** 100% (obligatorio)
- **Tickets de soporte por setup:** < 5% de usuarios

### Dashboard de Métricas

**Ruta:** `/src/app/(admin)/analytics/onboarding/page.tsx`

**Visualizaciones:**

1. **Funnel de Activación**
   ```
   Aprobados (100%)
     ↓ 95%
   Welcome Viewed (95%)
     ↓ 85%
   Setup Started (80%)
     ↓ 75%
   Setup Completed (75%)
     ↓ 90%
   First Transaction (67.5%)
   ```

2. **Tiempo Promedio por Fase**
   - Aprobación → Primer login: X horas
   - Primer login → Setup completo: Y horas
   - Setup completo → Primera transacción: Z horas

3. **Distribución de TTFT**
   - < 1 hora: X%
   - 1-6 horas: Y%
   - 6-24 horas: Z%
   - > 24 horas: W%

---

## Checklist de Implementación

### Pre-requisitos

- [x] ✅ `approveCaseAction` implementado
- [x] ✅ Middleware detecta status de onboarding
- [x] ✅ Estructura de base de datos básica (companies, accounts, users)
- [ ] Email service configurado (Resend API key)
- [ ] Analytics configurado (Mixpanel/PostHog)

### Fase 1: Core (Crítico)

- [ ] Migración 005: Crear tabla `company_settings`
- [ ] Migración 006: Crear tabla `onboarding_emails`
- [ ] Migración 007: Actualizar `onboarding_cases` (first_login_at, welcome_shown)
- [ ] Implementar `/src/lib/email/client.ts`
- [ ] Crear template `/src/lib/email/templates/welcome.tsx`
- [ ] Actualizar `approveCaseAction` para enviar email
- [ ] Crear server action `markWelcomeShownAction`
- [ ] Testing: Aprobar caso → verificar email recibido

### Fase 2: Welcome Page (Alta Prioridad)

- [ ] Crear `/src/app/(onboarding)/welcome/page.tsx`
- [ ] Diseñar componentes:
  - `WelcomeHeader`
  - `AccountsDisplay`
  - `NextStepsCards`
- [ ] Actualizar middleware para redirect a `/welcome` si `!welcome_shown`
- [ ] Implementar botones "Hacer tour" y "Ir al dashboard"
- [ ] Testing: Primer login post-aprobación → ver welcome page

### Fase 3: Setup Checklist (Media Prioridad)

- [ ] Crear componente `SetupChecklist.tsx`
- [ ] Implementar `updateSetupChecklistAction`
- [ ] Lógica de auto-detección de completitud
- [ ] Integrar en dashboard principal
- [ ] Testing: Completar pasos → verificar checklist updates

### Fase 4: Tour Guiado (Media-Baja Prioridad)

- [ ] Instalar `npm install shepherd.js @types/shepherd.js`
- [ ] Crear hook `useDashboardTour()`
- [ ] Definir pasos del tour
- [ ] Implementar `completeTourAction`
- [ ] Testing: Tour completo → flag guardado en DB

### Fase 5: Configuraciones (Variable)

- [ ] NCF settings page
- [ ] Team invitation flow
- [ ] Payment methods page
- [ ] Testing de cada configuración

### Fase 6: Analytics (Opcional)

- [ ] Configurar tracking de eventos
- [ ] Crear dashboard de métricas
- [ ] A/B testing setup

---

## Anexos

### A. Variables de Entorno Requeridas

```bash
# Email Service (Resend)
RESEND_API_KEY=re_xxx

# Analytics (opcional)
MIXPANEL_TOKEN=xxx
POSTHOG_API_KEY=xxx

# Feature Flags (opcional)
NEXT_PUBLIC_ENABLE_TOUR=true
NEXT_PUBLIC_ENABLE_SETUP_CHECKLIST=true
```

### B. Estructura de Carpetas

```
src/
├── app/
│   ├── (onboarding)/
│   │   └── welcome/
│   │       └── page.tsx          # Página de bienvenida
│   ├── (admin)/
│   │   ├── settings/
│   │   │   ├── ncf/
│   │   │   ├── team/
│   │   │   └── payment-methods/
│   │   └── analytics/
│   │       └── onboarding/
│   │           └── page.tsx      # Dashboard de métricas
│   └── actions/
│       ├── onboarding/
│       │   ├── mark-welcome-shown.ts
│       │   └── complete-tour.ts
│       └── setup/
│           └── update-checklist.ts
├── components/
│   ├── dashboard/
│   │   ├── SetupChecklist.tsx
│   │   └── WelcomeHeader.tsx
│   └── tours/
│       └── DashboardTour.tsx
└── lib/
    ├── email/
    │   ├── client.ts
    │   └── templates/
    │       └── welcome.tsx
    └── analytics/
        └── track.ts
```

### C. Ejemplos de Queries

**Obtener empresas pendientes de setup:**
```sql
SELECT
  c.id,
  c.company_name,
  c.created_at,
  cs.setup_completed,
  (cs.setup_completed->>'profile_completed')::boolean as profile_done,
  (cs.setup_completed->>'first_transaction')::boolean as first_tx_done
FROM companies c
LEFT JOIN company_settings cs ON c.id = cs.company_id
WHERE c.status = 'active'
  AND cs.setup_completed->>'first_transaction' = 'false'
ORDER BY c.created_at DESC;
```

**Calcular TTFT por empresa:**
```sql
SELECT
  c.company_name,
  oc.completed_at as approved_at,
  MIN(t.created_at) as first_transaction_at,
  EXTRACT(EPOCH FROM (MIN(t.created_at) - oc.completed_at)) / 3600 as ttft_hours
FROM companies c
JOIN onboarding_cases oc ON oc.company_id = c.id
JOIN transactions t ON t.company_id = c.id
WHERE oc.status = 'approved'
GROUP BY c.id, c.company_name, oc.completed_at
ORDER BY ttft_hours ASC;
```

---

**Última actualización:** 2026-01-08
**Próxima revisión:** Después de Fase 1
**Responsable:** Equipo de Producto
