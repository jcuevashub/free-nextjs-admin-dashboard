# Documentación - Fintech RD

Bienvenido a la documentación técnica de Fintech RD. Esta carpeta contiene guías, manuales y referencias para desarrolladores y administradores.

---

## 📋 Índice de Documentación

### Onboarding y KYC/KYB

#### 🔐 Integración de Socure (Verificación de Identidad)

**Última actualización:** 2026-01-08

La plataforma utiliza Socure para verificación de identidad digital, prueba de vida (liveness detection) y detección de fraude durante el onboarding.

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [**SOCURE_INTEGRATION_GUIDE.md**](./SOCURE_INTEGRATION_GUIDE.md) | Guía completa de integración técnica con Socure ID+, DocV y Sigma. Incluye ejemplos de código TypeScript, configuración de API, manejo de errores y mejores prácticas. | Developers |
| [**LIVENESS_DETECTION_GUIDE.md**](./LIVENESS_DETECTION_GUIDE.md) | Guía específica sobre implementación de liveness detection (prueba de vida). Incluye componente de captura de selfie, UX guidelines, validaciones y optimización. | Frontend Devs, UX |
| [**SOCURE_SETUP_CHECKLIST.md**](./SOCURE_SETUP_CHECKLIST.md) | Checklist exhaustivo de configuración en 6 fases, desde registro hasta go-live. Ideal para project managers y tech leads coordinando la implementación. | Tech Leads, PMs |

**Contenido cubierto:**
- ✅ Verificación de documentos (cédula, pasaporte) con OCR
- ✅ Prueba de vida (liveness) con detección de deepfakes
- ✅ Face matching (selfie vs documento)
- ✅ Scoring de fraude (Sigma: 0-1000)
- ✅ Validación OFAC/PEP (listas de sanciones)

---

### Post-Onboarding

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [**POST_ONBOARDING_PLAN.md**](../POST_ONBOARDING_PLAN.md) | Plan detallado de implementación post-aprobación: email de bienvenida, página welcome, setup checklist, tour guiado. Incluye arquitectura técnica y fases de desarrollo. | All Devs, PMs |
| [**POST_ONBOARDING_IMPLEMENTATION_STATUS.md**](../POST_ONBOARDING_IMPLEMENTATION_STATUS.md) | Estado actual de implementación del plan post-onboarding. Tracking de progreso, checklists de completitud y próximos pasos. **Actualizado regularmente.** | Tech Leads, PMs |

---

### Enforcement y Middleware

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [**ONBOARDING_ENFORCEMENT.md**](../ONBOARDING_ENFORCEMENT.md) | Documentación del middleware de Next.js que hace obligatorio el onboarding. Explica la lógica de redirects basada en estados y flujo de navegación. | Backend Devs |

---

## 🚀 Quick Start Guides

### Para Nuevos Desarrolladores

**1. Setup del proyecto:**
```bash
# Clone repo
git clone https://github.com/your-org/free-nextjs-admin-dashboard
cd free-nextjs-admin-dashboard

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local con tus credenciales
```

**2. Configurar Socure (Sandbox):**

Lee [`SOCURE_SETUP_CHECKLIST.md`](./SOCURE_SETUP_CHECKLIST.md) y completa las fases 1-2.

Resumen rápido:
- Obtén API key de sandbox de Socure
- Agrega a `.env.local`:
  ```
  SOCURE_API_KEY=sk_sandbox_your_key
  SOCURE_BASE_URL=https://service.socure.com
  SOCURE_ENVIRONMENT=sandbox
  ```
- Descarga test data del portal de Socure
- Ejecuta tests: `npx tsx scripts/test-socure.ts`

**3. Aplicar migraciones:**
```bash
npx supabase db push
```

**4. Ejecutar en desarrollo:**
```bash
npm run dev
```

Navega a `http://localhost:3000/onboarding` para probar el flujo.

---

### Para Product Managers

**Entender el flujo de onboarding:**

1. **Usuario se registra** → Crea cuenta con email/password
2. **Onboarding obligatorio** → Middleware redirige a `/onboarding/start`
3. **10 pasos del onboarding:**
   - Start (nombre del aplicante)
   - Account Selection (peso/dólar/ambas)
   - Company Info (datos empresa + RNC)
   - Company Address (dirección física)
   - Ownership (UBO + PEP check)
   - **Identity Verification** (selfie + liveness + face match) ⭐
   - **Documents** (4 docs: cédula, RNC, reg. mercantil, comprobante) ⭐
   - Expected Activity (volumen mensual)
   - Follow-up (preguntas adicionales)
   - Complete (confirmación)

4. **Revisión KYC** → Admin revisa en `/admin/kyc-review`
5. **Aprobación** → Sistema crea:
   - Registro en tabla `companies`
   - Cuentas bancarias (DOP/USD según preferencia)
   - Email de bienvenida
   - Notificación in-app
   - Audit log

6. **Post-aprobación:**
   - Usuario hace login → Redirige a `/welcome`
   - Ve página de bienvenida con cuentas creadas
   - Accede al dashboard

**Métricas clave:**
- Tasa de completitud: >80% objetivo
- Tiempo promedio: <15 minutos
- Tasa de aprobación: >85%
- Fraud detection: Sigma score <250 = bajo riesgo

---

## 🔒 Seguridad y Compliance

### Datos Sensibles

**Almacenamiento:**
- ✅ Documentos encriptados en Supabase Storage
- ✅ Imágenes de selfies con acceso mediante signed URLs (expiración 1 hora)
- ✅ API keys en variables de entorno (nunca en código)
- ✅ RLS policies en todas las tablas

**Retention:**
- Selfies: Eliminar después de 30 días (compliance)
- Documentos: Mantener 7 años (regulación financiera RD)
- Logs de auditoría: Mantener 1 año

**Encriptación:**
- En tránsito: HTTPS/TLS 1.3
- En reposo: AES-256 (Supabase default)
- API calls: Bearer token authentication

### Compliance

**República Dominicana:**
- ✅ Cumple con Ley 155-17 (Lavado de Activos)
- ✅ Cumple con Ley 172-13 (Protección de Datos)
- ✅ Validación de RNC con DGII
- ✅ Validación de cédula con JCE

**Internacional:**
- ✅ OFAC sanctions screening
- ✅ PEP (Politically Exposed Persons) screening
- ✅ KYC (Know Your Customer)
- ✅ KYB (Know Your Business)

---

## 🛠️ Herramientas y Stack Técnico

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 18
- **Styling:** Tailwind CSS + DaisyUI
- **Forms:** React Hook Form + Zod
- **State:** React Context + Server Actions

### Backend
- **Runtime:** Node.js 18+
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Email:** Resend

### External Services
- **Identity Verification:** Socure ID+ & DocV
- **Fraud Detection:** Socure Sigma
- **Sanctions Screening:** Sanctions.io (pendiente)

### DevOps
- **Hosting:** Vercel
- **Monitoring:** Sentry (pendiente)
- **Analytics:** Vercel Analytics
- **CI/CD:** GitHub Actions

---

## 📞 Soporte y Contactos

### Equipo Interno

- **Tech Lead:** _________________
- **Backend Developer:** _________________
- **Frontend Developer:** _________________
- **Product Manager:** _________________

### Vendors

**Socure:**
- Account Manager: _________________
- Technical Support: support@socure.com
- Emergency: +1 (844) 600-2920
- Status Page: https://status.socure.com

**Supabase:**
- Support: https://supabase.com/support
- Status: https://status.supabase.com

**Resend:**
- Support: help@resend.com
- Docs: https://resend.com/docs

---

## 📝 Contribuir a la Documentación

### Guidelines

1. **Mantener actualizada:** Actualizar docs al hacer cambios en código
2. **Ser específico:** Incluir ejemplos de código y screenshots
3. **Audiencia clara:** Especificar para quién es cada documento
4. **Formato Markdown:** Usar GitHub-flavored Markdown
5. **Enlaces relativos:** Usar rutas relativas para links internos

### Template de Documento

```markdown
# Título del Documento

**Última actualización:** YYYY-MM-DD
**Versión:** 1.0
**Audiencia:** Developers / PMs / QA

---

## Objetivo

[Descripción breve de qué cubre este documento]

## Contenido

[Contenido principal]

## Recursos

- Link 1
- Link 2

---

**Mantenido por:** [Nombre]
**Contacto:** [Email]
```

---

## 🔄 Changelog

### 2026-01-08
- ✅ Creada documentación completa de Socure (3 documentos)
- ✅ Agregado este README de índice
- ✅ Actualizado POST_ONBOARDING_IMPLEMENTATION_STATUS.md

### 2026-01-07
- ✅ Documentado enforcement de onboarding
- ✅ Creado plan post-onboarding

---

**Última revisión:** 2026-01-08
**Próxima revisión programada:** 2026-02-08
