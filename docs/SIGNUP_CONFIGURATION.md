# Configuración de Signup sin Confirmación de Email

## Resumen

El signup ahora está configurado para crear usuarios sin requerir confirmación de email, permitiendo que accedan inmediatamente al onboarding.

## Configuración en Supabase Dashboard

Para que el signup funcione sin confirmación de email, debes configurar lo siguiente en tu proyecto de Supabase:

### 1. Deshabilitar Confirmación de Email

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication** → **Settings**
3. En la sección **Email Auth**, busca **Enable email confirmations**
4. **Desmarca** esta opción
5. Guarda los cambios

### 2. Configuración de Email Templates (Opcional)

Si decides mantener la confirmación de email en el futuro, puedes configurar los templates en:
- **Authentication** → **Email Templates**

## Flujo de Signup Actual

### 1. Usuario Completa Formulario
- Nombre
- Apellido
- Email
- Contraseña

### 2. Server Action (`signUpAction`)

```typescript
// 1. Crea usuario en Supabase Auth
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      first_name: firstName,
      last_name: lastName,
    },
  },
});

// 2. Inmediatamente hace signin para crear sesión
await supabase.auth.signInWithPassword({
  email,
  password,
});

// 3. Crea perfil en tabla users
await supabase.from('users').upsert({
  id: user.id,
  email: user.email,
  full_name: `${firstName} ${lastName}`,
});

// 4. Redirige a /onboarding
redirect('/onboarding');
```

### 3. Middleware Intercepta

El middleware detecta que:
- Usuario está autenticado ✅
- No tiene `onboarding_case` → Redirige a `/onboarding/start`

### 4. Usuario Completa Onboarding

El usuario puede ahora completar todos los pasos del onboarding sin interrupciones.

## Beneficios

✅ **UX mejorada**: Sin fricción de confirmar email
✅ **Conversión mayor**: Usuario no abandona el proceso
✅ **Sesión inmediata**: Cookie de autenticación se guarda automáticamente
✅ **Onboarding fluido**: Usuario completa todo el proceso en una sola sesión

## Consideraciones de Seguridad

### Riesgos

⚠️ **Cuentas falsas**: Usuarios pueden crear cuentas con emails no verificados
⚠️ **Spam**: Mayor riesgo de cuentas spam o bots

### Mitigaciones

1. **Validación posterior**: Puedes agregar verificación de email como paso opcional en el onboarding
2. **KYC/KYB robusto**: El proceso de KYC (Socure + OFAC) valida la identidad del usuario
3. **Aprobación manual**: Admin debe aprobar cada caso antes de dar acceso completo
4. **Rate limiting**: Implementar límite de signups por IP (pendiente)
5. **CAPTCHA**: Agregar reCAPTCHA en el formulario de signup (pendiente)

## Configuración de Producción Recomendada

Para producción, se recomienda:

### Opción 1: Sin Confirmación de Email (Actual)
```
✅ Signup → Sesión → Onboarding → KYC Review → Acceso
```

**Mejor para**: Onboarding B2B donde el KYC es obligatorio

### Opción 2: Con Confirmación de Email (Alternativa)
```
Signup → Email → Confirmar → Sesión → Onboarding → KYC Review → Acceso
```

**Mejor para**: Plataformas con usuarios individuales

## Configuración Actual de Auth

### Variables de Entorno

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Tabla `auth.users`

Supabase maneja automáticamente:
- Creación de usuario
- Hash de contraseña
- Sesiones (JWT tokens)

### Tabla `public.users`

Nuestro código crea el perfil:
```sql
INSERT INTO users (id, email, full_name)
VALUES (auth.uid(), 'user@example.com', 'John Doe');
```

## Testing

### Test 1: Signup Exitoso
```
1. Ir a /signup
2. Llenar formulario
3. Click "Crear cuenta"
Expected: Redirige a /onboarding/start
```

### Test 2: Email Duplicado
```
1. Intentar signup con email existente
Expected: Error "User already registered"
```

### Test 3: Sesión Persistente
```
1. Hacer signup
2. Cerrar navegador
3. Volver a abrir
Expected: Usuario sigue autenticado
```

### Test 4: Middleware Enforcement
```
1. Hacer signup
2. Intentar ir a /
Expected: Middleware redirige a /onboarding
```

## Troubleshooting

### Problema: "Email not confirmed"

**Causa**: La opción "Enable email confirmations" está activa en Supabase.

**Solución**:
1. Dashboard → Authentication → Settings
2. Desmarcar "Enable email confirmations"

### Problema: Usuario no puede hacer signin

**Causa**: El signup creó el usuario pero el signin falló.

**Solución**:
```sql
-- Verificar usuario existe
SELECT * FROM auth.users WHERE email = 'user@example.com';

-- Verificar si email está confirmado
SELECT email_confirmed_at FROM auth.users WHERE email = 'user@example.com';

-- Forzar confirmación (desarrollo only)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'user@example.com';
```

### Problema: Redirect loop

**Causa**: Middleware redirige pero la sesión no se guardó.

**Solución**: Verificar que `createSupabaseServer()` está usando cookies correctamente.

## Próximos Pasos (Opcional)

### 1. Agregar reCAPTCHA
```bash
npm install react-google-recaptcha
```

### 2. Implementar Rate Limiting
```typescript
// Usar Upstash Redis o similar
import { Ratelimit } from "@upstash/ratelimit";
```

### 3. Email Verification Opcional
```typescript
// Agregar paso en onboarding para verificar email
// No bloquear acceso, pero marcar como "verified"
```

---

**Última actualización**: 2026-01-08
