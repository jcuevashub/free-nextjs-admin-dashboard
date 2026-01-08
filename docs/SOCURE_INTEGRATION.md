# Integración con Socure - Guía Técnica

Esta guía detalla la integración con los productos de Socure para verificación de identidad y detección de fraude en el onboarding digital.

## 📦 Productos Socure Utilizados

### 1. Socure DocV (Document Verification)
- **Propósito:** Verificar autenticidad de documentos con OCR
- **Documentos soportados:** RNC, Registro Mercantil, Cédula, Pasaportes
- **Features:** Detección de alteraciones, extracción de datos, quality checks

### 2. Socure ID+ (Identity Verification)
- **Propósito:** Verificación integral de identidad
- **Combina:** Documento + Selfie + Face Matching + Liveness Detection
- **Output:** Decision (accept/reject/review), scores de confianza

### 3. Socure Sigma (Fraud Detection)
- **Propósito:** Detección de fraude e identidades sintéticas
- **Score:** 0-1000 (mayor = más riesgo)
- **Thresholds:** 0-200 (bajo), 201-500 (medio), 501-750 (alto), 751+ (crítico)

## 🔌 API Endpoints

### Endpoint 1: Document Verification (DocV)

**URL:** `POST https://service.socure.com/api/3.0/DocumentVerification`

**Request:**
```json
{
  "documentType": "national_id",
  "country": "DO",
  "documentFront": "base64_encoded_image",
  "documentBack": "base64_encoded_image",
  "extractData": true
}
```

**Response:**
```json
{
  "documentUuid": "doc_abc123",
  "status": "verified",
  "confidence": 0.95,
  "ocrData": {
    "firstName": "Juan",
    "lastName": "Pérez",
    "documentNumber": "001-1234567-8",
    "dateOfBirth": "1990-01-15",
    "expirationDate": "2030-01-15"
  },
  "qualityChecks": {
    "imageQuality": "good",
    "tampering": false,
    "glareDetected": false
  }
}
```

**Implementación en el proyecto:**
```typescript
// Archivo: /src/lib/integrations/socure/docv.ts
const result = await verifySocureDocument(file, 'cedula');
// Retorna: { documentUuid, status, confidence, ocrData, qualityChecks }
```

**Cuándo se llama:**
- Inmediatamente después de subir cada documento en `/onboarding/documents`
- Via server action: `/src/app/actions/onboarding/upload-document.ts`

---

### Endpoint 2: Identity Verification (ID+)

**URL:** `POST https://service.socure.com/api/3.0/EmailAuthScore`

**Request:**
```json
{
  "documentUuid": "doc_abc123",
  "firstName": "Juan",
  "lastName": "Pérez",
  "nationalId": "001-1234567-8",
  "dateOfBirth": "1990-01-15",
  "country": "DO",
  "selfieImageData": "base64_encoded_selfie",
  "modules": ["document", "selfie", "liveness", "fraud"]
}
```

**Response:**
```json
{
  "referenceId": "id_xyz789",
  "decision": "accept",
  "documentVerification": {
    "status": "verified",
    "documentType": "national_id",
    "issuingCountry": "DO",
    "extractedData": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "dateOfBirth": "1990-01-15",
      "documentNumber": "001-1234567-8"
    }
  },
  "selfieVerification": {
    "livenessScore": 0.92,
    "faceMatch": true,
    "faceMatchScore": 0.88
  },
  "fraudSignals": {
    "sigmaScore": 150,
    "syntheticIdentityScore": 0.05,
    "reasons": []
  }
}
```

**Implementación en el proyecto:**
```typescript
// Archivo: /src/lib/integrations/socure/id-plus.ts
const result = await verifySocureIdentity({
  documentUuid: 'doc_abc123',
  firstName: 'Juan',
  lastName: 'Pérez',
  nationalId: '001-1234567-8',
  dateOfBirth: '1990-01-15',
  selfieImage: selfieFile // or base64 string
});
```

**Cuándo se llama:**
- Paso `/onboarding/identity-verification` después de capturar selfie
- Via server action: `/src/app/actions/onboarding/verify-identity.ts`

---

## 🎯 Flujo de Integración End-to-End

### Paso 1: Upload de Cédula (DocV)

```
Usuario sube cédula (frente y reverso)
   ↓
upload-document.ts recibe el archivo
   ↓
Llama a verifySocureDocument(file, 'cedula')
   ↓
Socure extrae: nombre, cédula #, fecha nacimiento
   ↓
Retorna documentUuid + ocrData
   ↓
Se guarda en company_documents con socure_document_uuid
```

### Paso 2: Captura de Selfie (ID+)

```
Usuario captura selfie con cámara
   ↓
identity-verification page convierte a base64
   ↓
Llama a verifyIdentityAction con selfie + documentUuid
   ↓
Socure compara rostro con cédula
   ↓
Genera liveness score + fraud score (Sigma)
   ↓
Retorna decision: accept/reject/review
   ↓
Se guarda en identity_verifications table
```

### Paso 3: Evaluación de Fraude (Sigma)

```
Sigma score incluido automáticamente en ID+ response
   ↓
evaluateFraudRisk(sigmaScore, reasons)
   ↓
Determina: low/medium/high/critical risk
   ↓
Decision: approve/review/reject
   ↓
Se guarda socure_fraud_score en onboarding_cases
```

---

## 🔍 Interpretación de Scores

### Liveness Score (0-1)

| Score | Interpretación | Acción |
|-------|----------------|--------|
| 0.9-1.0 | Excelente (muy seguro que es persona real) | Auto-aprobar |
| 0.7-0.89 | Bueno (probablemente real) | Auto-aprobar |
| 0.5-0.69 | Dudoso | Revisión manual |
| <0.5 | Malo (posible foto de foto) | Rechazar o retry |

### Face Match Score (0-1)

| Score | Interpretación | Acción |
|-------|----------------|--------|
| 0.85-1.0 | Alta coincidencia | Aprobar |
| 0.7-0.84 | Coincidencia media | Revisión manual |
| <0.7 | Baja coincidencia | Rechazar |

### Sigma Fraud Score (0-1000)

| Rango | Risk Level | Acción |
|-------|------------|--------|
| 0-200 | Low | Auto-aprobar |
| 201-500 | Medium | Revisión manual |
| 501-750 | High | Revisión exhaustiva |
| 751+ | Critical | Auto-rechazar |

---

## 🛠️ Configuración del Proyecto

### Variables de Entorno

```bash
SOCURE_API_KEY=your_socure_api_key_here
SOCURE_BASE_URL=https://service.socure.com  # Producción
# O para desarrollo:
# SOCURE_BASE_URL=https://sandbox.socure.com
```

### Modo Sandbox vs Producción

**Sandbox (Desarrollo):**
- URL: `https://sandbox.socure.com`
- No cobra transacciones
- Datos de prueba predefinidos
- Resultados simulados

**Producción:**
- URL: `https://service.socure.com`
- Cobra por transacción
- Verificaciones reales
- Datos reales

### Pricing Estimado

| Producto | Costo por transacción | Notas |
|----------|----------------------|--------|
| DocV | ~$0.50 | Por documento verificado |
| ID+ | ~$2.00 | Incluye DocV + Selfie + Sigma |
| Sigma | Incluido en ID+ | Scoring de fraude |

---

## 🧪 Testing

### Test Cases para DocV

```typescript
// Test 1: Documento válido
const validDoc = new File([...], 'cedula.jpg', { type: 'image/jpeg' });
const result = await verifySocureDocument(validDoc, 'cedula');
expect(result.status).toBe('verified');
expect(result.confidence).toBeGreaterThan(0.7);

// Test 2: Documento alterado
const tamperedDoc = new File([...], 'fake.jpg', { type: 'image/jpeg' });
const result = await verifySocureDocument(tamperedDoc, 'cedula');
expect(result.status).toBe('rejected');
expect(result.qualityChecks.tampering).toBe(true);
```

### Test Cases para ID+

```typescript
// Test 1: Identidad válida
const result = await verifySocureIdentity({
  documentUuid: 'doc_123',
  firstName: 'Juan',
  lastName: 'Pérez',
  nationalId: '001-1234567-8',
  dateOfBirth: '1990-01-15',
  selfieImage: selfieFile
});
expect(result.decision).toBe('accept');
expect(result.selfieVerification.livenessScore).toBeGreaterThan(0.7);

// Test 2: Face mismatch
const result = await verifySocureIdentity({...differentPerson});
expect(result.selfieVerification.faceMatch).toBe(false);
expect(result.decision).toBe('reject');
```

---

## ⚠️ Error Handling

### Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `401 Unauthorized` | API key inválida | Verificar SOCURE_API_KEY en .env |
| `400 Bad Request` | Formato de imagen incorrecto | Convertir a JPEG y validar tamaño |
| `429 Too Many Requests` | Rate limit excedido | Implementar retry con backoff |
| `500 Internal Server Error` | Error en Socure | Retry automático o modo degradado |

### Retry Logic

Implementado en `/src/lib/utils/retry.ts`:

```typescript
const result = await retryWithBackoff(
  () => verifySocureIdentity(data),
  3,        // max 3 intentos
  1000      // delay inicial de 1s
);
```

---

## 📊 Monitoring y Logs

### Logs Recomendados

```typescript
// Log exitoso
console.log('[Socure ID+] Verification success', {
  referenceId: result.referenceId,
  decision: result.decision,
  livenessScore: result.selfieVerification.livenessScore,
  fraudScore: result.fraudSignals.sigmaScore
});

// Log de error
console.error('[Socure ID+] Verification failed', {
  error: error.message,
  userId: user.id,
  documentUuid: data.documentUuid
});
```

### Métricas a Trackear

- ✅ Tasa de aprobación (accept rate)
- ✅ Tasa de rechazo (reject rate)
- ✅ Tasa de revisión manual (review rate)
- ✅ Promedio de liveness score
- ✅ Promedio de fraud score
- ✅ Tiempo de respuesta de API
- ✅ Errores de API por tipo

---

## 🔒 Seguridad

### Best Practices

1. ✅ **Nunca exponer API key en frontend**
   - Solo usar en server actions
   - No incluir en código cliente

2. ✅ **Validar datos antes de enviar a Socure**
   - Usar Zod schemas
   - Validar formato de imágenes

3. ✅ **Almacenar respuestas completas**
   - Guardar `rawResponse` en DB
   - Útil para auditorías y debugging

4. ✅ **Rate limiting**
   - Implementar límites por usuario
   - Prevenir abuse

5. ✅ **Signed URLs para documentos**
   - No exponer URLs públicas
   - Usar expiración de 1 hora

---

## 📞 Soporte Socure

- **Documentación:** https://developer.socure.com/
- **Support Portal:** https://support.socure.com/
- **Status Page:** https://status.socure.com/

---

**Última actualización:** 2026-01-08
