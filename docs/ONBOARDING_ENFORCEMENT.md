# Onboarding Enforcement - Documentación Técnica

Este documento explica cómo funciona el sistema de onboarding obligatorio y cómo el middleware controla el acceso a la plataforma.

## Resumen

El sistema obliga a todos los usuarios autenticados a completar el onboarding antes de acceder al dashboard principal. El middleware intercepta todas las requests y redirige automáticamente según el estado del onboarding.

## Estados de Onboarding

El sistema reconoce los siguientes estados en `onboarding_cases.status`:

| Status | Descripción | Acción del Middleware |
|--------|-------------|----------------------|
| `draft` | Onboarding iniciado pero no completado | Redirige al paso actual (`current_step`) |
| `in_progress` | Usuario está completando pasos | Redirige al paso actual |
| `requires_update` | Admin solicita correcciones | Redirige al paso que necesita actualización |
| `pending_review` | Esperando aprobación admin | Muestra página `/onboarding/complete` con status |
| `rejected` | Caso rechazado por admin | Muestra página `/onboarding/complete` con razón |
| `approved` | ✅ Onboarding aprobado | Permite acceso al dashboard |

## Flujo del Middleware

### 1. Usuarios No Autenticados

```javascript
if (!user && !isPublicPath) {
  redirect('/signin');
}
```

**Rutas públicas permitidas:**
- `/signin` - Login
- `/signup` - Registro
- `/onboarding/*` - Todas las páginas de onboarding
- `/error-404` - Error 404
- `/api/*` - APIs
- `/_next/*` - Assets de Next.js
- `/favicon.ico`, `/images/*` - Archivos estáticos

### 2. Usuarios Autenticados en Páginas de Auth

```javascript
if (user && (pathname.startsWith('/signin') || pathname.startsWith('/signup'))) {
  if (onboardingCase?.status === 'approved') {
    redirect('/'); // Dashboard
  } else {
    redirect('/onboarding/start'); // Iniciar onboarding
  }
}
```

**Previene:** Usuarios autenticados accediendo a signin/signup.

### 3. Excepción para Admins

```javascript
if (userRole === 'owner' && pathname.startsWith('/admin')) {
  // Allow access - admins can use admin dashboard without onboarding
  return;
}
```

**Permite:** Usuarios con `role='owner'` acceder a `/admin/kyc-review` incluso sin onboarding aprobado.

### 4. Enforcement de Onboarding (Core)

Para usuarios no en rutas de onboarding:

#### Caso 1: Onboarding Incompleto
```javascript
if (onboardingCase && ['draft', 'in_progress', 'requires_update'].includes(status)) {
  const resumePath = onboardingCase.current_step
    ? `/onboarding/${onboardingCase.current_step}`
    : '/onboarding/start';
  redirect(resumePath);
}
```

**Comportamiento:** Redirige al paso donde quedó (guardado en `current_step`).

#### Caso 2: Pendiente de Revisión
```javascript
if (onboardingCase?.status === 'pending_review') {
  redirect('/onboarding/complete');
}
```

**Comportamiento:** Muestra página de confirmación con mensaje "En revisión".

#### Caso 3: Caso Rechazado
```javascript
if (onboardingCase?.status === 'rejected') {
  redirect('/onboarding/complete');
}
```

**Comportamiento:** Muestra página con razón de rechazo y contacto de soporte.

#### Caso 4: Onboarding Aprobado ✅
```javascript
if (onboardingCase?.status === 'approved') {
  return; // Allow access
}
```

**Comportamiento:** Usuario tiene acceso completo al dashboard.

#### Caso 5: Usuario Nuevo (Sin Caso)
```javascript
if (!onboardingCase) {
  redirect('/onboarding/start');
}
```

**Comportamiento:** Primera vez - redirige a inicio del onboarding.

## Página Index de Onboarding

**Ruta:** `/onboarding/page.tsx`

Esta página actúa como un router inteligente que determina a dónde redirigir basado en el estado del caso:

```typescript
const result = await resumeCaseAction();

switch (result.status) {
  case 'approved':
    router.push('/'); // Dashboard
    break;

  case 'rejected':
  case 'pending_review':
    router.push('/onboarding/complete'); // Mostrar estado
    break;

  case 'requires_update':
  case 'in_progress':
  case 'draft':
    const nextStep = result.nextStep || 'start';
    router.push(`/onboarding/${nextStep}`); // Reanudar
    break;

  default:
    router.push('/onboarding/start'); // Fallback
}
```

## Optimizaciones Implementadas

### 1. Reducción de Queries
**Antes:** 3-4 queries separadas por request
**Ahora:** 2 queries (profile + onboarding_case)

```typescript
// Query 1: Get user role
const { data: profile } = await supabase
  .from('users')
  .select('role')
  .eq('id', user.id)
  .single();

// Query 2: Get onboarding case (single query con maybeSingle)
const { data: onboardingCase } = await supabase
  .from('onboarding_cases')
  .select('id, status, current_step')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle(); // Returns null if no case
```

### 2. Uso de `maybeSingle()`
- `.single()` → Error si no encuentra registro
- `.maybeSingle()` → Retorna `null` sin error

Esto previene errores innecesarios para usuarios nuevos.

### 3. Uso de `current_step`
En lugar de lógica compleja para determinar el siguiente paso, usamos el campo `current_step` guardado en cada paso del onboarding.

## Flujo Completo de Usuario

### Usuario Nuevo
```
1. Signup → Email confirmation
2. Login exitoso → Middleware intercepta
3. No tiene onboarding_case → Redirect to /onboarding/start
4. Completa paso 1 (start) → Crea caso con status='draft', current_step='account-selection'
5. Navega a dashboard → Middleware intercepta
6. Tiene caso draft → Redirect to /onboarding/account-selection (current_step)
7. Completa todos los pasos → submit-case cambia status a 'pending_review'
8. Navega a dashboard → Middleware intercepta
9. Tiene caso pending_review → Redirect to /onboarding/complete
10. Ve mensaje "En revisión"
11. Admin aprueba → status='approved'
12. Navega a dashboard → Middleware permite acceso ✅
```

### Usuario con Caso Rechazado
```
1. Login → Middleware verifica onboarding
2. Tiene caso rejected → Redirect to /onboarding/complete
3. Ve razón de rechazo + botón "Contactar Soporte"
4. No puede acceder al dashboard hasta resolver
```

### Usuario con Actualización Requerida
```
1. Login → Middleware verifica onboarding
2. Tiene caso requires_update → Redirect to current_step
3. Ve mensaje del admin con qué actualizar
4. Actualiza información
5. Submit nuevamente → status='pending_review'
6. Ciclo de revisión continúa
```

### Admin (role='owner')
```
1. Login → Middleware verifica role
2. role='owner' + pathname='/admin/...' → Permite acceso sin onboarding
3. Puede revisar casos KYC sin tener onboarding propio aprobado
```

## Casos Edge Manejados

### 1. Redirect Loop Prevention
Si por alguna razón el middleware no puede determinar el estado, el fallback es siempre `/onboarding/start`.

### 2. Race Conditions
El middleware usa el caso más reciente (`order by created_at DESC, limit 1`) en caso de múltiples casos.

### 3. Database Errors
Si la query de onboarding falla, el sistema asume que no hay caso y redirige a `/onboarding/start`.

### 4. Session Expiration
Si `getUser()` falla, el usuario es tratado como no autenticado y redirigido a `/signin`.

## Testing del Enforcement

### Test 1: Usuario Nuevo
```bash
1. Crear cuenta nueva
2. Verificar email
3. Login
Expected: Redirect a /onboarding/start
```

### Test 2: Usuario con Onboarding a Medias
```bash
1. Login con cuenta que completó hasta paso 4
2. Intentar navegar a /
Expected: Redirect a /onboarding/ownership (paso 5)
```

### Test 3: Usuario Pendiente de Revisión
```bash
1. Login con cuenta que submitió onboarding
2. Intentar navegar a /
Expected: Redirect a /onboarding/complete (status: pending_review)
```

### Test 4: Usuario Aprobado
```bash
1. Login con cuenta aprobada
2. Navegar a /
Expected: Acceso al dashboard ✅
```

### Test 5: Admin sin Onboarding
```bash
1. Login como admin (role='owner')
2. Navegar a /admin/kyc-review
Expected: Acceso permitido ✅
```

### Test 6: Prevenir Acceso a Auth Pages
```bash
1. Login con cuenta aprobada
2. Navegar a /signin
Expected: Redirect a / (dashboard)
```

## Diagrama de Flujo

```
┌─────────────────────┐
│ User Request        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Is Authenticated?   │
└──────────┬──────────┘
           │
      ┌────┴────┐
      │         │
     NO        YES
      │         │
      ▼         ▼
  ┌──────┐  ┌──────────────────┐
  │/signin  │Is /signin|/signup?│
  └──────┘  └────────┬─────────┘
                     │
                ┌────┴────┐
                │         │
               YES       NO
                │         │
                ▼         ▼
        ┌────────────┐ ┌──────────────┐
        │Has approved│ │Is /admin/*   │
        │onboarding? │ │& role=owner? │
        └─────┬──────┘ └──────┬───────┘
              │                │
         ┌────┴────┐      ┌────┴────┐
        YES       NO      YES       NO
         │         │       │         │
         ▼         ▼       ▼         ▼
     ┌─────┐  ┌────────┐ ┌────┐ ┌──────────────┐
     │  /  │  │/onb/st │ │Allow│ │Check onb case│
     └─────┘  └────────┘ └────┘ └──────┬───────┘
                                        │
                           ┌────────────┴───────────┐
                           │                        │
                    ┌──────▼──────┐        ┌───────▼────────┐
                    │ approved?   │        │draft/in_prog/  │
                    │             │        │requires_update?│
                    └──────┬──────┘        └───────┬────────┘
                           │                       │
                      ┌────┴────┐             ┌────┴────┐
                     YES       NO            YES       NO
                      │         │             │         │
                      ▼         ▼             ▼         ▼
                  ┌─────┐  ┌─────────┐  ┌─────────┐ ┌──────┐
                  │Allow│  │pending/ │  │/onb/step│ │No case│
                  └─────┘  │rejected?│  └─────────┘ └───┬───┘
                           └────┬────┘                   │
                                │                        │
                           ┌────┴────┐                   │
                          YES       NO                   │
                           │         │                   │
                           ▼         ▼                   ▼
                    ┌───────────┐ ┌────────────┐  ┌──────────┐
                    │/onb/compl │ │/onb/start  │  │/onb/start│
                    └───────────┘ └────────────┘  └──────────┘
```

## Configuración Requerida

### 1. Variables de Entorno
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Tabla `users` Debe Tener Campo `role`
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'employee';
```

### 3. Tabla `onboarding_cases` Debe Existir
Ejecutar migraciones:
```bash
supabase db push
```

## Troubleshooting

### Problema: Redirect Loop Infinito
**Causa:** La página `/onboarding` no redirige correctamente.
**Solución:** Verificar que `/onboarding/page.tsx` use `resumeCaseAction()` correctamente.

### Problema: Admin No Puede Acceder a `/admin`
**Causa:** Campo `role` no existe o no es 'owner'.
**Solución:**
```sql
UPDATE users SET role = 'owner' WHERE email = 'admin@ejemplo.com';
```

### Problema: Usuario Aprobado Sigue Siendo Redirigido
**Causa:** Query de onboarding_cases no encuentra el caso aprobado.
**Solución:** Verificar que existe un registro con `status='approved'` para ese `user_id`.

### Problema: Middleware No Ejecuta
**Causa:** Matcher config incorrecta.
**Solución:** Verificar que `config.matcher` en middleware.ts esté correctamente configurado.

---

**Última actualización:** 2026-01-08
