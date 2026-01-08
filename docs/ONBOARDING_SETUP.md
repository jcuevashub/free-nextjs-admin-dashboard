# Onboarding Digital - Guía de Configuración

Esta guía explica cómo configurar y ejecutar el sistema completo de onboarding digital con verificación KYC/KYB para la plataforma de banca empresarial.

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Cuenta de Supabase configurada
- API keys de Socure (para verificación de identidad)
- API key de Sanctions.io o OFAC-API (para screening de sanciones)

## 🚀 Paso 1: Configurar Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```bash
# Supabase (ya configuradas)
NEXT_PUBLIC_SUPABASE_URL=https://rfghjmltxymarogapgee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Socure (Verificación de Identidad)
SOCURE_API_KEY=tu_socure_api_key
SOCURE_BASE_URL=https://service.socure.com

# Sanctions Screening (OFAC/PEP)
SANCTIONS_IO_API_KEY=tu_sanctions_io_key
# O alternativamente:
# OFAC_API_KEY=tu_ofac_api_key

# Resend (Email)
RESEND_API_KEY=re_i6uS5wor_W79QqGBrzbkLotKprnhseTG9
```

## 🗄️ Paso 2: Ejecutar Migraciones de Base de Datos

### Opción A: Usando Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Login a Supabase
supabase login

# 3. Link al proyecto
supabase link --project-ref rfghjmltxymarogapgee

# 4. Ejecutar migraciones
supabase db push
```

### Opción B: Manualmente desde el Dashboard de Supabase

1. Ve a https://supabase.com/dashboard/project/rfghjmltxymarogapgee/sql
2. Abre el archivo `supabase/migrations/003_onboarding_schema.sql`
3. Copia y pega el contenido en el SQL Editor
4. Ejecuta la migración
5. Repite con `supabase/migrations/004_storage_bucket.sql`

## 📝 Paso 3: Verificar las Tablas Creadas

Las migraciones deberían haber creado las siguientes tablas:

- ✅ `onboarding_cases` - Casos de onboarding con estado y progreso
- ✅ `identity_verifications` - Verificaciones de identidad con Socure ID+
- ✅ `sanctions_screenings` - Resultados de screening OFAC/PEP
- ✅ Actualizaciones a `company_documents` - Campos de Socure DocV
- ✅ Storage bucket `onboarding-docs` con RLS policies

Puedes verificar ejecutando:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('onboarding_cases', 'identity_verifications', 'sanctions_screenings');
```

## 🔑 Paso 4: Obtener API Keys de Proveedores Externos

### Socure

1. Regístrate en https://www.socure.com/
2. Crea un proyecto y obtén tu API key
3. Configura los productos:
   - **ID+** (Identity Verification)
   - **DocV** (Document Verification)
   - **Sigma** (Fraud Detection)
4. Para desarrollo, usa el **sandbox environment**

**Endpoints de Socure:**
- Sandbox: `https://sandbox.socure.com`
- Producción: `https://service.socure.com`

### Sanctions.io

1. Regístrate en https://www.sanctions.io/
2. Obtén tu API key desde el dashboard
3. Plan recomendado: **Pro** (incluye OFAC, PEP, UN, EU, UK sanctions)

**Alternativa:** OFAC-API.com (https://www.ofac-api.com/)

## 🧪 Paso 5: Probar la Integración

### Test 1: Verificar Conectividad con Socure

Crea un archivo de prueba `test-socure.ts`:

```typescript
import { socureClient } from '@/lib/integrations/socure/client';

async function testSocure() {
  const healthy = await socureClient.healthCheck();
  console.log('Socure API:', healthy ? '✅ Conectado' : '❌ Error');
}

testSocure();
```

### Test 2: Verificar Conectividad con Sanctions.io

```typescript
import { sanctionsClient } from '@/lib/integrations/sanctions/client';

async function testSanctions() {
  const healthy = await sanctionsClient.healthCheck();
  console.log('Sanctions API:', healthy ? '✅ Conectado' : '❌ Error');
}

testSanctions();
```

## 🎯 Paso 6: Flujo de Onboarding Completo

### Orden de los Pasos:

1. **`/onboarding/start`** - Captura nombre del aplicante
2. **`/onboarding/account-selection`** (NUEVO) - Selecciona peso/dólar/ambas
3. **`/onboarding/company-info`** - Datos de la empresa + validación RNC
4. **`/onboarding/company-address`** - Dirección fiscal
5. **`/onboarding/ownership`** - Propietario/UBO + % participación
6. **`/onboarding/identity-verification`** (NUEVO) - Selfie + liveness con Socure ID+
7. **`/onboarding/documents`** - Subir 4 documentos + Socure DocV
8. **`/onboarding/expected-activity`** - Volumen mensual, países
9. **`/onboarding/follow-up`** - Preguntas adicionales
10. **`/onboarding/complete`** - Confirmación

### Documentos Requeridos:

- ✅ RNC (Certificado DGII)
- ✅ Registro Mercantil (Acta Constitutiva)
- ✅ Cédula del representante legal (ambos lados)
- ✅ Comprobante de dirección

## 🔐 Paso 7: Configurar Permisos y Seguridad

### RLS Policies

Las políticas de Row Level Security ya están configuradas en las migraciones:

- Usuarios solo pueden ver sus propios casos de onboarding
- Admins (role='owner') pueden ver todos los casos
- Documentos están protegidos por usuario ID en Storage

### Roles de Usuario

El sistema usa estos roles (enum `user_role`):

- `owner` - Dueño de la empresa (acceso completo + admin KYC)
- `admin` - Administrador
- `accountant` - Contador
- `employee` - Empleado
- `viewer` - Solo lectura

## 📊 Paso 8: Dashboard de Administración (Opcional)

Para crear el dashboard de revisión KYC para admins:

**Ruta:** `/src/app/admin/kyc-review/page.tsx`

Funcionalidades:
- Lista de casos pending_review
- Ver documentos subidos
- Ver scores de Socure (liveness, fraud)
- Ver resultados de OFAC/PEP
- Aprobar/Rechazar con notas

## 🧑‍💻 Paso 9: Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Abrir en navegador
http://localhost:3000
```

## 🚢 Paso 10: Deployment a Producción

### Antes de deployar:

1. ✅ Todas las migraciones ejecutadas
2. ✅ Variables de entorno configuradas en Vercel/producción
3. ✅ API keys de Socure en modo PRODUCCIÓN (no sandbox)
4. ✅ Storage bucket configurado con RLS
5. ✅ Pruebas end-to-end completadas

### Checklist de Seguridad:

- ✅ API keys nunca expuestas en frontend
- ✅ RLS policies activas en todas las tablas
- ✅ Documentos solo accesibles vía signed URLs
- ✅ Rate limiting configurado
- ✅ Audit logs activos

## 🐛 Troubleshooting

### Error: "Socure API key is required"

**Solución:** Verifica que `SOCURE_API_KEY` esté en `.env` y reinicia el servidor.

### Error: "No rows found" en onboarding_cases

**Solución:** Las migraciones no se ejecutaron. Vuelve a ejecutar `supabase db push`.

### Error: "Storage bucket not found"

**Solución:** Ejecuta la migración `004_storage_bucket.sql` manualmente desde el dashboard de Supabase.

### Error: Middleware redirect loop

**Solución:** Asegúrate de que `/onboarding` esté en `isPublicPath` en middleware.ts.

## 📚 Recursos Adicionales

- [Documentación de Socure](https://developer.socure.com/)
- [Documentación de Sanctions.io](https://www.sanctions.io/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

## 📞 Soporte

Para problemas o preguntas:
- Email: business@hacksondev.com
- GitHub Issues: [Crear issue](https://github.com/tu-repo/issues)

---

**Última actualización:** 2026-01-08
