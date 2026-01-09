# Checklist de Configuración: Socure ID+ y DocV

**Proyecto:** Fintech RD - Onboarding Digital
**Última actualización:** 2026-01-08

---

## 🎯 Objetivo

Esta checklist te guía paso a paso para configurar Socure ID+ y DocV en el proyecto, desde el registro hasta el go-live en producción.

---

## Fase 1: Registro y Credenciales (1-2 semanas)

### 1.1 Crear Cuenta en Socure

- [ ] Visitar [https://www.socure.com/contact](https://www.socure.com/contact)
- [ ] Completar formulario de contacto
- [ ] Especificar caso de uso: "Onboarding digital para fintech en República Dominicana"
- [ ] Proporcionar documentos solicitados:
  - [ ] Registro mercantil de Fintech RD
  - [ ] RNC de la empresa
  - [ ] Identificación del representante legal
  - [ ] Descripción del producto/servicio
- [ ] Esperar aprobación (3-5 días hábiles)

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 1.2 Configurar Portal de Socure

- [ ] Recibir credenciales de acceso al portal
- [ ] Iniciar sesión en [https://portal.socure.com](https://portal.socure.com)
- [ ] Completar perfil de empresa
- [ ] Activar autenticación de dos factores (2FA)
- [ ] Agregar usuarios adicionales del equipo:
  - [ ] Tech Lead
  - [ ] Backend Developer
  - [ ] QA Engineer

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 1.3 Obtener API Keys

#### Sandbox (Desarrollo)

- [ ] Navegar a **Settings → API Keys → Sandbox**
- [ ] Generar nueva API key
- [ ] Copiar y guardar en 1Password/Vault:
  ```
  Nombre: Socure Sandbox API Key
  Key: sk_sandbox_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  Entorno: Desarrollo/Staging
  ```
- [ ] Configurar IP whitelist (opcional)
- [ ] Configurar webhook endpoint para desarrollo

#### Production (Producción)

- [ ] Navegar a **Settings → API Keys → Production**
- [ ] Generar nueva API key
- [ ] Copiar y guardar en 1Password/Vault:
  ```
  Nombre: Socure Production API Key
  Key: sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  Entorno: Producción
  ```
- [ ] Configurar IP whitelist (recomendado)
- [ ] Configurar webhook endpoint para producción

**⚠️ IMPORTANTE:** Nunca commitear API keys en Git. Usar variables de entorno.

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 1.4 Activar Módulos

- [ ] Verificar que los siguientes módulos estén activos:
  - [ ] ✅ **DocV** (Document Verification)
  - [ ] ✅ **ID+** (Identity Verification con liveness)
  - [ ] ✅ **Sigma** (Fraud Detection)
  - [ ] ✅ **Address Verification** (opcional)

- [ ] Si algún módulo no está activo:
  - [ ] Contactar a Account Manager de Socure
  - [ ] Especificar módulos necesarios
  - [ ] Esperar activación (1-2 días)

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 1.5 Configurar Test Data

- [ ] Navegar a **Developer → Test Data**
- [ ] Descargar imágenes de prueba:
  - [ ] Cédula dominicana (frente)
  - [ ] Cédula dominicana (reverso)
  - [ ] Pasaporte dominicano
  - [ ] Selfies de prueba (aprobadas)
  - [ ] Selfies de prueba (rechazadas)
  - [ ] Documentos fraudulentos para testing
- [ ] Guardar en `/test-data/socure/` del proyecto
- [ ] Documentar casos de prueba en README

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

## Fase 2: Configuración del Proyecto (1 semana)

### 2.1 Variables de Entorno

- [ ] Crear/actualizar `.env.local` (desarrollo):
  ```bash
  SOCURE_API_KEY=sk_sandbox_your_key_here
  SOCURE_BASE_URL=https://service.socure.com
  SOCURE_ENVIRONMENT=sandbox
  SOCURE_FRAUD_THRESHOLD=750
  SOCURE_LIVENESS_THRESHOLD=0.8
  ```

- [ ] Configurar variables en Vercel/Plataforma de hosting:
  - [ ] `SOCURE_API_KEY` (encrypted)
  - [ ] `SOCURE_BASE_URL`
  - [ ] `SOCURE_ENVIRONMENT`
  - [ ] `SOCURE_FRAUD_THRESHOLD`
  - [ ] `SOCURE_LIVENESS_THRESHOLD`

- [ ] Verificar que `.env` está en `.gitignore`

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 2.2 Instalar Dependencias

- [ ] Instalar librerías necesarias:
  ```bash
  npm install @supabase/ssr
  npm install zod
  npm install --save-dev @types/node
  ```

- [ ] Verificar que `package.json` incluye:
  - [ ] `next@^16.0.0`
  - [ ] `react@^18.0.0`
  - [ ] `typescript@^5.0.0`

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 2.3 Crear Estructura de Archivos

- [ ] Crear directorios:
  ```
  src/lib/integrations/socure/
  src/app/actions/onboarding/
  docs/
  scripts/
  test-data/socure/
  ```

- [ ] Copiar archivos de integración:
  - [ ] `src/lib/integrations/socure/client.ts`
  - [ ] `src/lib/integrations/socure/docv.ts`
  - [ ] `src/lib/integrations/socure/id-plus.ts`
  - [ ] `src/lib/integrations/socure/types.ts`

- [ ] Copiar server actions:
  - [ ] `src/app/actions/onboarding/upload-document.ts`
  - [ ] `src/app/actions/onboarding/verify-identity.ts`

- [ ] Copiar documentación:
  - [ ] `docs/SOCURE_INTEGRATION_GUIDE.md`
  - [ ] `docs/LIVENESS_DETECTION_GUIDE.md`
  - [ ] `docs/SOCURE_SETUP_CHECKLIST.md` (este archivo)

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 2.4 Configurar Base de Datos

- [ ] Crear tabla `identity_verifications`:
  ```sql
  CREATE TABLE identity_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES onboarding_cases(id),
    user_id UUID NOT NULL REFERENCES users(id),
    socure_reference_id VARCHAR(255),
    liveness_score DECIMAL(3,2),
    face_match_score DECIMAL(3,2),
    fraud_score INT,
    risk_level VARCHAR(20),
    decision VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```

- [ ] Agregar campos a `onboarding_cases`:
  ```sql
  ALTER TABLE onboarding_cases ADD COLUMN liveness_score DECIMAL(3,2);
  ALTER TABLE onboarding_cases ADD COLUMN socure_fraud_score DECIMAL(4,3);
  ALTER TABLE onboarding_cases ADD COLUMN socure_decision VARCHAR(20);
  ```

- [ ] Agregar campos a `company_documents`:
  ```sql
  ALTER TABLE company_documents ADD COLUMN socure_document_uuid VARCHAR(255);
  ALTER TABLE company_documents ADD COLUMN socure_verification_status VARCHAR(20);
  ALTER TABLE company_documents ADD COLUMN ocr_data JSONB;
  ALTER TABLE company_documents ADD COLUMN extraction_confidence DECIMAL(3,2);
  ```

- [ ] Aplicar migraciones:
  ```bash
  npx supabase db push
  ```

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 2.5 Configurar Storage (Supabase)

- [ ] Crear bucket `onboarding-docs`:
  ```sql
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('onboarding-docs', 'onboarding-docs', false);
  ```

- [ ] Configurar RLS policies:
  ```sql
  CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'onboarding-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

  CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'onboarding-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
  ```

- [ ] Configurar límites:
  - [ ] Max file size: 10MB
  - [ ] Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

## Fase 3: Desarrollo y Testing (2-3 semanas)

### 3.1 Implementar UI Components

- [ ] Crear `SelfieCapture.tsx`:
  - [ ] Acceso a cámara
  - [ ] Guías visuales (óvalo facial)
  - [ ] Vista previa
  - [ ] Validación de calidad
  - [ ] Feedback de errores

- [ ] Crear `DocumentUpload.tsx`:
  - [ ] Upload de archivo
  - [ ] Vista previa
  - [ ] Crop/rotate (opcional)
  - [ ] Validación de tamaño

- [ ] Integrar en página de onboarding:
  - [ ] `/onboarding/identity-verification`
  - [ ] `/onboarding/documents`

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 3.2 Testing en Sandbox

- [ ] Crear script de testing: `scripts/test-socure.ts`

- [ ] Test DocV (Document Verification):
  - [ ] ✅ Cédula válida aprobada
  - [ ] ✅ Cédula inválida rechazada
  - [ ] ✅ Pasaporte válido aprobado
  - [ ] ✅ Documento fraudulento rechazado
  - [ ] ✅ OCR extrae datos correctamente

- [ ] Test ID+ (Identity + Liveness):
  - [ ] ✅ Selfie real aprobada (score >0.8)
  - [ ] ✅ Foto de foto rechazada (score <0.3)
  - [ ] ✅ Face match correcto
  - [ ] ✅ Fraud score bajo para usuario legítimo
  - [ ] ✅ Fraud score alto para ataque

- [ ] Test End-to-End:
  - [ ] ✅ Flujo completo: upload documento → DocV → selfie → ID+ → aprobación
  - [ ] ✅ Retry después de fallo
  - [ ] ✅ Escalación a revisión manual después de 3 intentos
  - [ ] ✅ Admin puede ver resultados en dashboard

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 3.3 Manejo de Errores

- [ ] Implementar error handling para:
  - [ ] ❌ API key inválida
  - [ ] ❌ Timeout (>30s)
  - [ ] ❌ Rate limit excedido
  - [ ] ❌ Imagen muy grande
  - [ ] ❌ Formato inválido
  - [ ] ❌ Liveness score bajo
  - [ ] ❌ Face match fallido

- [ ] Configurar logging:
  - [ ] Console logs en desarrollo
  - [ ] Sentry en producción
  - [ ] Database logs para auditoría

- [ ] Implementar retry logic:
  - [ ] Exponential backoff para 429 errors
  - [ ] Max 3 reintentos para liveness
  - [ ] Escalación a manual review

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 3.4 Performance Optimization

- [ ] Comprimir imágenes antes de upload:
  - [ ] Target: <500KB para selfies
  - [ ] Target: <1MB para documentos
  - [ ] JPEG quality: 85%

- [ ] Implementar lazy loading:
  - [ ] Cargar cámara solo cuando usuario hace click
  - [ ] Preload Face Detection library en background

- [ ] Configurar timeouts apropiados:
  - [ ] DocV: 30 segundos
  - [ ] ID+: 45 segundos

- [ ] Medir y optimizar:
  - [ ] Tiempo de captura a upload: <2s
  - [ ] Tiempo de verificación completa: <10s

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

## Fase 4: QA y UAT (1-2 semanas)

### 4.1 Testing Funcional

- [ ] Test en dispositivos reales:
  - [ ] iPhone (Safari)
  - [ ] Android (Chrome)
  - [ ] Desktop (Chrome, Firefox, Safari)

- [ ] Test en condiciones reales:
  - [ ] Luz natural
  - [ ] Luz artificial
  - [ ] Poca luz
  - [ ] Contraluz

- [ ] Test de casos edge:
  - [ ] Usuario con lentes
  - [ ] Usuario con barba
  - [ ] Usuario con maquillaje
  - [ ] Documento parcialmente dañado

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 4.2 User Acceptance Testing (UAT)

- [ ] Reclutar 10 usuarios beta:
  - [ ] 5 con cédula
  - [ ] 5 con pasaporte

- [ ] Ejecutar flujo completo de onboarding:
  - [ ] Medir tiempo de completitud
  - [ ] Recoger feedback cualitativo
  - [ ] Identificar puntos de fricción

- [ ] Métricas objetivo:
  - [ ] Tasa de completitud: >80%
  - [ ] Tiempo promedio: <15 minutos
  - [ ] Satisfacción (NPS): >7/10
  - [ ] Tasa de error: <5%

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 4.3 Security Audit

- [ ] Revisar código:
  - [ ] No hay API keys hardcoded
  - [ ] Variables de entorno encriptadas
  - [ ] Imágenes encriptadas en storage
  - [ ] HTTPS en todas las comunicaciones

- [ ] Revisar RLS policies:
  - [ ] Usuarios solo acceden sus propios datos
  - [ ] Admins tienen acceso apropiado
  - [ ] Documentos no son públicos

- [ ] Configurar retention policies:
  - [ ] Selfies: eliminar después de 30 días
  - [ ] Documentos: mantener 7 años (compliance)
  - [ ] Logs: mantener 1 año

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

## Fase 5: Pre-Production (1 semana)

### 5.1 Cambiar a Production Keys

- [ ] Actualizar variables de entorno en producción:
  ```bash
  SOCURE_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  SOCURE_ENVIRONMENT=production
  ```

- [ ] Verificar cambios aplicados:
  ```bash
  # SSH a servidor o check en Vercel dashboard
  env | grep SOCURE
  ```

- [ ] Probar con 1 caso real en producción

**⚠️ CRÍTICO:** Hacer esto en una ventana de mantenimiento (baja carga de usuarios).

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 5.2 Configurar Monitoring

- [ ] Configurar alertas en Sentry:
  - [ ] Error rate >5%
  - [ ] Response time >10s
  - [ ] Liveness score promedio <0.7

- [ ] Configurar dashboard de métricas:
  - [ ] Tasa de aprobación
  - [ ] Tasa de rechazo
  - [ ] Fraud score promedio
  - [ ] Tiempo de verificación promedio

- [ ] Configurar notificaciones:
  - [ ] Email a tech@fintechrd.com para errores críticos
  - [ ] Slack #alerts para warnings

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

### 5.3 Documentación Final

- [ ] Actualizar README.md:
  - [ ] Sección de "Setup" con Socure
  - [ ] Variables de entorno requeridas
  - [ ] Comandos de testing

- [ ] Crear runbook de operaciones:
  - [ ] Procedimiento de troubleshooting
  - [ ] Escalación a Socure support
  - [ ] Rollback procedure

- [ ] Capacitar equipo:
  - [ ] Presentación de 1 hora sobre Socure
  - [ ] Demo en vivo del flujo
  - [ ] Q&A session

**Responsable:** ________________
**Fecha límite:** ________________
**Status:** ⬜ Pendiente | ⬜ En Progreso | ⬜ Completado

---

## Fase 6: Go-Live (1 día)

### 6.1 Checklist Pre-Launch

**24 horas antes:**

- [ ] Backup completo de base de datos
- [ ] Verificar que todas las pruebas pasan
- [ ] Confirmar que production API key funciona
- [ ] Preparar plan de rollback

**2 horas antes:**

- [ ] Notificar al equipo del deployment
- [ ] Verificar estado de Socure API: [https://status.socure.com](https://status.socure.com)
- [ ] Verificar que no hay mantenimientos programados

**Deployment:**

- [ ] Deploy a producción
- [ ] Verificar que la aplicación inicia correctamente
- [ ] Ejecutar smoke tests:
  - [ ] ✅ Cargar página de onboarding
  - [ ] ✅ Capturar selfie
  - [ ] ✅ Upload documento
  - [ ] ✅ Verificación exitosa end-to-end

**Responsable:** ________________
**Fecha:** ________________
**Hora:** ________________

---

### 6.2 Monitoreo Post-Launch

**Primera hora:**

- [ ] Monitorear logs cada 15 minutos
- [ ] Verificar error rate <1%
- [ ] Verificar response time <5s
- [ ] Estar disponible para hot-fixes

**Primeras 24 horas:**

- [ ] Revisar métricas cada hora
- [ ] Recoger feedback de primeros usuarios
- [ ] Identificar y resolver issues
- [ ] Documentar lecciones aprendidas

**Primera semana:**

- [ ] Revisar métricas diariamente:
  - [ ] Tasa de aprobación: >85%
  - [ ] Tasa de completitud: >80%
  - [ ] Tiempo promedio: <15 min
  - [ ] Error rate: <2%

**Responsable:** ________________

---

### 6.3 Soporte Post-Launch

- [ ] Crear canal de Slack `#socure-support`
- [ ] Asignar ingeniero on-call 24/7 (primera semana)
- [ ] Configurar proceso de escalación:
  1. Check logs y Sentry
  2. Revisar documentación
  3. Contactar Socure support si necesario

**Contactos de Socure:**
- Email: support@socure.com
- Teléfono: +1 (844) 600-2920
- Slack: socure-dev.slack.com

**Responsable:** ________________

---

## Métricas de Éxito

### KPIs Objetivo (Mes 1)

| Métrica | Target | Actual | Status |
|---------|--------|--------|--------|
| Tasa de aprobación | >85% | ___ | ⬜ |
| Tasa de completitud | >80% | ___ | ⬜ |
| Tiempo promedio | <15 min | ___ | ⬜ |
| Error rate | <2% | ___ | ⬜ |
| Liveness score promedio | >0.85 | ___ | ⬜ |
| False positive rate | <5% | ___ | ⬜ |
| Support tickets | <10/semana | ___ | ⬜ |
| NPS | >7/10 | ___ | ⬜ |

### Revisión Semanal

**Semana 1:**
- Fecha de revisión: ________________
- Notas: ________________
- Acciones: ________________

**Semana 2:**
- Fecha de revisión: ________________
- Notas: ________________
- Acciones: ________________

**Semana 3:**
- Fecha de revisión: ________________
- Notas: ________________
- Acciones: ________________

**Semana 4:**
- Fecha de revisión: ________________
- Notas: ________________
- Acciones: ________________

---

## Contactos Clave

### Equipo Interno

- **Tech Lead:** ________________ (email: ________________)
- **Backend Dev:** ________________ (email: ________________)
- **Frontend Dev:** ________________ (email: ________________)
- **QA Engineer:** ________________ (email: ________________)
- **Product Manager:** ________________ (email: ________________)

### Socure

- **Account Manager:** ________________ (email: ________________)
- **Technical Support:** support@socure.com
- **Emergency Hotline:** +1 (844) 600-2920

---

## Notas Finales

**Fecha de inicio:** ________________
**Fecha estimada de go-live:** ________________
**Fecha real de go-live:** ________________

**Lecciones aprendidas:**

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

**Próximos pasos:**

_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________

---

**Firmado:**

Tech Lead: ________________ Fecha: ________________
Product Manager: ________________ Fecha: ________________
