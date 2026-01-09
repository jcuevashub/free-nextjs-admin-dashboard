# Guía de Integración: Socure ID+ y DocV

**Última actualización:** 2026-01-08
**Versión:** 1.0
**Contacto técnico:** dev@fintechrd.com

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Prerrequisitos](#prerrequisitos)
3. [Registro y Credenciales](#registro-y-credenciales)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Servicios de Socure](#servicios-de-socure)
6. [Implementación Paso a Paso](#implementación-paso-a-paso)
7. [Pruebas en Sandbox](#pruebas-en-sandbox)
8. [Producción](#producción)
9. [Manejo de Errores](#manejo-de-errores)
10. [Mejores Prácticas](#mejores-prácticas)
11. [FAQ](#faq)

---

## Introducción

**Socure** es una plataforma de verificación de identidad digital que combina inteligencia artificial, machine learning y análisis de datos para detectar fraude y verificar identidades de forma precisa.

### Servicios Utilizados

En nuestro flujo de onboarding utilizamos tres servicios principales de Socure:

1. **DocV (Document Verification)**
   - Verificación de documentos de identidad
   - OCR (Reconocimiento Óptico de Caracteres)
   - Detección de documentos falsificados
   - Validación de seguridad del documento

2. **ID+ (Identity Verification)**
   - Prueba de vida (liveness detection)
   - Comparación facial (selfie vs documento)
   - Verificación de identidad en tiempo real
   - Detección de deepfakes y presentación de ataques

3. **Sigma (Fraud Detection)**
   - Scoring de riesgo de fraude (0-1000)
   - Detección de identidades sintéticas
   - Análisis de patrones de fraude
   - Integrado automáticamente con ID+

### Beneficios

- ✅ **Precisión:** >99% de precisión en detección de liveness
- ✅ **Velocidad:** Verificación en <3 segundos
- ✅ **Cumplimiento:** Cumple con KYC/AML regulaciones
- ✅ **Global:** Soporte para 195+ países
- ✅ **República Dominicana:** Validación de cédulas dominicanas

---

## Prerrequisitos

### Conocimientos Técnicos

- ✅ TypeScript/JavaScript
- ✅ RESTful APIs
- ✅ Base64 encoding
- ✅ Manejo de archivos multimedia
- ✅ Async/await patterns

### Requisitos del Sistema

- Node.js ≥ 18.x
- Next.js 16.x
- Supabase configurado
- Acceso a cuenta de Socure

### Documentos Soportados (República Dominicana)

- ✅ Cédula de Identidad (ambos lados)
- ✅ Pasaporte dominicano
- ✅ Licencia de conducir

---

## Registro y Credenciales

### Paso 1: Crear Cuenta en Socure

1. Visita [https://www.socure.com/contact](https://www.socure.com/contact)
2. Solicita una demostración o prueba
3. Completa el proceso de onboarding empresarial
4. Proporciona información sobre tu caso de uso (fintech, onboarding)

### Paso 2: Obtener API Keys

Una vez aprobada tu cuenta:

1. Inicia sesión en el portal de Socure: [https://portal.socure.com](https://portal.socure.com)
2. Navega a **Settings → API Keys**
3. Genera dos pares de keys:
   - **Sandbox API Key** (para desarrollo/testing)
   - **Production API Key** (para producción)

**Formato de las keys:**
```
Sandbox: sk_sandbox_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Production: sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Paso 3: Activar Módulos

Asegúrate de que tu cuenta tenga activados:

- ✅ **DocV** (Document Verification)
- ✅ **ID+** (EmailAuthScore con liveness)
- ✅ **Sigma** (Fraud Score)

Contacta a tu Account Manager de Socure si necesitas activar módulos adicionales.

---

## Configuración del Proyecto

### Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```bash
# Socure API Configuration
SOCURE_API_KEY=sk_sandbox_your_api_key_here
SOCURE_BASE_URL=https://service.socure.com
SOCURE_ENVIRONMENT=sandbox  # sandbox | production

# Socure Webhook Secret (opcional, para webhooks)
SOCURE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# Socure Settings
SOCURE_FRAUD_THRESHOLD=750  # Score > 750 = auto-reject
SOCURE_LIVENESS_THRESHOLD=0.8  # Score < 0.8 = requires review
```

### Validación de Configuración

Crea un script de verificación:

```typescript
// scripts/verify-socure-config.ts
async function verifySocureConfig() {
  const apiKey = process.env.SOCURE_API_KEY;
  const baseUrl = process.env.SOCURE_BASE_URL;

  if (!apiKey) {
    throw new Error('SOCURE_API_KEY no está configurada');
  }

  if (!apiKey.startsWith('sk_sandbox_') && !apiKey.startsWith('sk_live_')) {
    throw new Error('SOCURE_API_KEY tiene formato inválido');
  }

  console.log('✅ Configuración de Socure válida');
  console.log(`   Entorno: ${apiKey.startsWith('sk_sandbox_') ? 'Sandbox' : 'Production'}`);
  console.log(`   Base URL: ${baseUrl}`);
}

verifySocureConfig();
```

Ejecuta:
```bash
npx tsx scripts/verify-socure-config.ts
```

---

## Servicios de Socure

### 1. DocV - Document Verification

**Propósito:** Verificar autenticidad de documentos de identidad.

#### Endpoint

```
POST https://service.socure.com/api/3.0/DocumentVerification
```

#### Request Headers

```
Content-Type: application/json
Authorization: Bearer {SOCURE_API_KEY}
```

#### Request Body

```json
{
  "documentType": "national_id",
  "country": "DO",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "backImage": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "modules": ["extractedData", "authenticate"]
}
```

#### Response

```json
{
  "referenceId": "docv_abc123xyz",
  "documentUuid": "doc_456789",
  "status": "success",
  "decision": "accept",
  "extractedData": {
    "firstName": "Juan",
    "lastName": "Pérez García",
    "documentNumber": "001-1234567-8",
    "dateOfBirth": "1990-05-15",
    "expirationDate": "2030-05-15",
    "nationality": "DO"
  },
  "authenticate": {
    "decision": "accept",
    "confidence": 0.98,
    "fraudIndicators": []
  }
}
```

### 2. ID+ - Identity Verification con Liveness

**Propósito:** Verificar que la persona es real (liveness) y coincide con el documento.

#### Endpoint

```
POST https://service.socure.com/api/3.0/EmailAuthScore
```

#### Request Headers

```
Content-Type: application/json
Authorization: Bearer {SOCURE_API_KEY}
```

#### Request Body

```json
{
  "documentUuid": "doc_456789",
  "modules": ["selfie", "liveness", "facematch", "sigma"],
  "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "firstName": "Juan",
  "lastName": "Pérez García",
  "nationalId": "001-1234567-8",
  "dateOfBirth": "1990-05-15",
  "email": "juan.perez@example.com",
  "phone": "+18095551234",
  "address": {
    "street": "Av. 27 de Febrero",
    "city": "Santo Domingo",
    "state": "Distrito Nacional",
    "postalCode": "10101",
    "country": "DO"
  }
}
```

#### Response

```json
{
  "referenceId": "idp_xyz789abc",
  "decision": "accept",
  "selfieVerification": {
    "livenessScore": 0.95,
    "livenessDecision": "live",
    "faceMatch": true,
    "faceMatchScore": 0.92
  },
  "fraudSignals": {
    "sigmaScore": 245,
    "riskLevel": "low",
    "reasons": []
  },
  "addressVerification": {
    "status": "verified"
  },
  "documentVerification": {
    "status": "verified"
  }
}
```

### 3. Sigma - Fraud Score

**Integrado automáticamente con ID+**

**Interpretación del Score:**

| Score | Risk Level | Action |
|-------|------------|--------|
| 0-250 | Low | Auto-approve ✅ |
| 251-500 | Medium | Manual review 👁️ |
| 501-750 | High | Enhanced due diligence 🔍 |
| 751-1000 | Critical | Auto-reject ❌ |

---

## Implementación Paso a Paso

### Estructura de Archivos

```
src/
├── lib/
│   └── integrations/
│       └── socure/
│           ├── client.ts          # Cliente HTTP base
│           ├── docv.ts            # Document Verification
│           ├── id-plus.ts         # Identity + Liveness
│           ├── sigma.ts           # Fraud Detection
│           └── types.ts           # TypeScript types
├── app/
│   └── actions/
│       └── onboarding/
│           ├── upload-document.ts # Upload + DocV
│           └── verify-identity.ts # Selfie + ID+
```

### Paso 1: Cliente HTTP Base

**Archivo:** `src/lib/integrations/socure/client.ts`

```typescript
/**
 * Socure HTTP Client
 *
 * Cliente base para todas las llamadas a Socure API.
 */

interface SocureConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
}

interface SocureRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
}

export class SocureClient {
  private config: SocureConfig;

  constructor(config?: Partial<SocureConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.SOCURE_API_KEY || '',
      baseUrl: config?.baseUrl || process.env.SOCURE_BASE_URL || 'https://service.socure.com',
      timeout: config?.timeout || 30000,
    };

    if (!this.config.apiKey) {
      throw new Error('SOCURE_API_KEY is required');
    }
  }

  async request<T>(options: SocureRequestOptions): Promise<T> {
    const { method, endpoint, body, headers = {} } = options;
    const url = `${this.config.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Socure API error (${response.status}): ${errorBody}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Socure API request timeout');
      }

      throw error;
    }
  }
}

// Singleton instance
let clientInstance: SocureClient | null = null;

export function getSocureClient(): SocureClient {
  if (!clientInstance) {
    clientInstance = new SocureClient();
  }
  return clientInstance;
}
```

### Paso 2: Document Verification (DocV)

**Archivo:** `src/lib/integrations/socure/docv.ts`

```typescript
/**
 * Socure DocV - Document Verification
 *
 * Verifica autenticidad de documentos de identidad.
 */

import { getSocureClient } from './client';

export interface DocumentVerificationInput {
  documentType: 'national_id' | 'passport' | 'drivers_license';
  country: string;
  frontImage: string; // Base64
  backImage?: string; // Base64 (opcional para pasaporte)
}

export interface DocumentVerificationResult {
  documentUuid: string;
  referenceId: string;
  decision: 'accept' | 'reject' | 'review';
  confidence: number;
  extractedData: {
    firstName?: string;
    lastName?: string;
    documentNumber?: string;
    dateOfBirth?: string;
    expirationDate?: string;
    nationality?: string;
  };
  fraudIndicators: string[];
}

export async function verifyDocument(
  input: DocumentVerificationInput
): Promise<DocumentVerificationResult> {
  const client = getSocureClient();

  const requestBody = {
    documentType: input.documentType,
    country: input.country,
    image: input.frontImage,
    backImage: input.backImage,
    modules: ['extractedData', 'authenticate'],
  };

  try {
    const response = await client.request<any>({
      method: 'POST',
      endpoint: '/api/3.0/DocumentVerification',
      body: requestBody,
    });

    return {
      documentUuid: response.documentUuid,
      referenceId: response.referenceId,
      decision: response.authenticate?.decision || 'review',
      confidence: response.authenticate?.confidence || 0,
      extractedData: response.extractedData || {},
      fraudIndicators: response.authenticate?.fraudIndicators || [],
    };
  } catch (error) {
    console.error('[Socure DocV] Error:', error);
    throw new Error(
      `Document verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Helper: Convert File to Base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Paso 3: Identity Verification + Liveness (ID+)

**Archivo:** `src/lib/integrations/socure/id-plus.ts`

```typescript
/**
 * Socure ID+ - Identity Verification with Liveness
 *
 * Verifica identidad con prueba de vida y face matching.
 */

import { getSocureClient } from './client';

export interface IdentityVerificationInput {
  documentUuid: string;
  selfie: string; // Base64
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string; // YYYY-MM-DD
  email?: string;
  phone?: string;
}

export interface IdentityVerificationResult {
  referenceId: string;
  decision: 'accept' | 'reject' | 'review' | 'refer' | 'resubmit';
  livenessScore: number;
  livenessDecision: 'live' | 'not_live' | 'uncertain';
  faceMatch: boolean;
  faceMatchScore: number;
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export async function verifySocureIdentity(
  input: IdentityVerificationInput
): Promise<IdentityVerificationResult> {
  const client = getSocureClient();

  const requestBody = {
    documentUuid: input.documentUuid,
    modules: ['selfie', 'liveness', 'facematch', 'sigma'],
    selfie: input.selfie,
    firstName: input.firstName,
    lastName: input.lastName,
    nationalId: input.nationalId,
    dateOfBirth: input.dateOfBirth,
    email: input.email,
    phone: input.phone,
  };

  try {
    const response = await client.request<any>({
      method: 'POST',
      endpoint: '/api/3.0/EmailAuthScore',
      body: requestBody,
    });

    // Parse liveness score
    const livenessScore = response.selfieVerification?.livenessScore || 0;
    const faceMatchScore = response.selfieVerification?.faceMatchScore || 0;
    const fraudScore = response.fraudSignals?.sigmaScore || 0;

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (fraudScore <= 250) riskLevel = 'low';
    else if (fraudScore <= 500) riskLevel = 'medium';
    else if (fraudScore <= 750) riskLevel = 'high';
    else riskLevel = 'critical';

    return {
      referenceId: response.referenceId,
      decision: response.decision || 'review',
      livenessScore,
      livenessDecision: response.selfieVerification?.livenessDecision || 'uncertain',
      faceMatch: response.selfieVerification?.faceMatch || false,
      faceMatchScore,
      fraudScore,
      riskLevel,
    };
  } catch (error) {
    console.error('[Socure ID+] Error:', error);
    throw new Error(
      `Identity verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

### Paso 4: TypeScript Types

**Archivo:** `src/lib/integrations/socure/types.ts`

```typescript
/**
 * Socure Type Definitions
 */

export type SocureDecision = 'accept' | 'reject' | 'review' | 'refer' | 'resubmit';

export type SocureRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type DocumentType = 'national_id' | 'passport' | 'drivers_license';

export interface SocureErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SocureWebhookEvent {
  eventType: 'verification.completed' | 'verification.failed' | 'fraud.detected';
  referenceId: string;
  timestamp: string;
  data: any;
}
```

### Paso 5: Server Action - Upload Document

**Archivo:** `src/app/actions/onboarding/upload-document.ts`

```typescript
'use server';

import { createSupabaseServer } from '@/lib/supabaseServer';
import { verifyDocument } from '@/lib/integrations/socure/docv';

export interface UploadDocumentInput {
  caseId: string;
  documentType: 'cedula' | 'passport' | 'registro_mercantil' | 'comprobante_direccion';
  frontImage: string; // Base64
  backImage?: string; // Base64
}

export async function uploadDocumentAction(input: UploadDocumentInput) {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Map document type to Socure format
    const socureDocType = input.documentType === 'cedula'
      ? 'national_id'
      : input.documentType === 'passport'
      ? 'passport'
      : null;

    // Only verify identity documents (cédula, passport)
    let verificationResult = null;
    if (socureDocType) {
      verificationResult = await verifyDocument({
        documentType: socureDocType,
        country: 'DO',
        frontImage: input.frontImage,
        backImage: input.backImage,
      });

      // Auto-reject if document verification fails
      if (verificationResult.decision === 'reject') {
        return {
          success: false,
          error: 'Documento rechazado. Por favor verifica que la imagen sea clara y el documento válido.',
        };
      }
    }

    // Upload to Supabase Storage
    const fileName = `${input.caseId}/${input.documentType}_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('onboarding-docs')
      .upload(fileName, Buffer.from(input.frontImage.split(',')[1], 'base64'), {
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      return { success: false, error: 'Error al subir documento' };
    }

    // Save to company_documents table
    const { error: dbError } = await supabase
      .from('company_documents')
      .insert({
        case_id: input.caseId,
        document_type: input.documentType,
        file_path: fileName,
        socure_document_uuid: verificationResult?.documentUuid,
        socure_verification_status: verificationResult?.decision,
        ocr_data: verificationResult?.extractedData,
        extraction_confidence: verificationResult?.confidence,
      });

    if (dbError) {
      return { success: false, error: 'Error al guardar documento' };
    }

    return {
      success: true,
      documentUuid: verificationResult?.documentUuid,
      extractedData: verificationResult?.extractedData,
    };
  } catch (error) {
    console.error('[uploadDocument] Error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}
```

### Paso 6: Server Action - Verify Identity

**Archivo:** `src/app/actions/onboarding/verify-identity.ts`

```typescript
'use server';

import { createSupabaseServer } from '@/lib/supabaseServer';
import { verifySocureIdentity } from '@/lib/integrations/socure/id-plus';

export interface VerifyIdentityInput {
  caseId: string;
  documentUuid: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  selfieBase64: string;
}

export async function verifyIdentityAction(input: VerifyIdentityInput) {
  try {
    const supabase = await createSupabaseServer();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado' };

    // Call Socure ID+ API
    const result = await verifySocureIdentity({
      documentUuid: input.documentUuid,
      selfie: input.selfieBase64,
      firstName: input.firstName,
      lastName: input.lastName,
      nationalId: input.nationalId,
      dateOfBirth: input.dateOfBirth,
    });

    // Check liveness threshold
    const livenessThreshold = parseFloat(
      process.env.SOCURE_LIVENESS_THRESHOLD || '0.8'
    );

    if (result.livenessScore < livenessThreshold) {
      return {
        success: false,
        error: 'Prueba de vida fallida. Por favor intenta de nuevo en un lugar bien iluminado.',
      };
    }

    // Check face match
    if (!result.faceMatch) {
      return {
        success: false,
        error: 'La foto no coincide con el documento. Por favor intenta de nuevo.',
      };
    }

    // Save verification to database
    const { error: dbError } = await supabase
      .from('identity_verifications')
      .insert({
        case_id: input.caseId,
        user_id: user.id,
        socure_reference_id: result.referenceId,
        liveness_score: result.livenessScore,
        face_match_score: result.faceMatchScore,
        fraud_score: result.fraudScore,
        risk_level: result.riskLevel,
        decision: result.decision,
      });

    if (dbError) {
      return { success: false, error: 'Error al guardar verificación' };
    }

    // Update onboarding case
    await supabase
      .from('onboarding_cases')
      .update({
        liveness_score: result.livenessScore,
        socure_fraud_score: result.fraudScore / 1000, // Normalize to 0-1
        socure_decision: result.decision,
      })
      .eq('id', input.caseId);

    return {
      success: true,
      decision: result.decision,
      livenessScore: result.livenessScore,
      faceMatch: result.faceMatch,
      fraudScore: result.fraudScore,
      riskLevel: result.riskLevel,
    };
  } catch (error) {
    console.error('[verifyIdentity] Error:', error);
    return { success: false, error: 'Error inesperado' };
  }
}
```

---

## Pruebas en Sandbox

### Datos de Prueba

Socure proporciona datos sintéticos para testing en sandbox:

#### Documentos de Prueba

**Cédula aprobada (República Dominicana):**
```
Nombre: Juan Carlos
Apellido: Pérez García
Cédula: 001-1234567-8
Fecha Nacimiento: 1990-05-15
```

**Cédula rechazada:**
```
Nombre: Fraudster
Apellido: McFraud
Cédula: 999-9999999-9
Fecha Nacimiento: 2000-01-01
```

#### Imágenes de Prueba

Socure proporciona imágenes de prueba en el portal:
1. Inicia sesión en [https://portal.socure.com](https://portal.socure.com)
2. Navega a **Developer → Test Data**
3. Descarga imágenes de cédulas y selfies de prueba

### Script de Testing

**Archivo:** `scripts/test-socure.ts`

```typescript
import { verifyDocument } from '@/lib/integrations/socure/docv';
import { verifySocureIdentity } from '@/lib/integrations/socure/id-plus';
import { fileToBase64 } from '@/lib/integrations/socure/docv';

async function testSocureIntegration() {
  console.log('🧪 Testing Socure Integration...\n');

  // Test 1: Document Verification
  console.log('1️⃣ Testing Document Verification (DocV)...');
  try {
    // Load test image (replace with actual path)
    const testDocFront = 'data:image/jpeg;base64,...'; // Your test image
    const testDocBack = 'data:image/jpeg;base64,...';

    const docResult = await verifyDocument({
      documentType: 'national_id',
      country: 'DO',
      frontImage: testDocFront,
      backImage: testDocBack,
    });

    console.log('✅ DocV Result:', {
      decision: docResult.decision,
      confidence: docResult.confidence,
      documentUuid: docResult.documentUuid,
      extractedData: docResult.extractedData,
    });
  } catch (error) {
    console.error('❌ DocV Error:', error);
  }

  console.log('\n');

  // Test 2: Identity Verification
  console.log('2️⃣ Testing Identity Verification (ID+)...');
  try {
    const testSelfie = 'data:image/jpeg;base64,...'; // Your test selfie

    const idResult = await verifySocureIdentity({
      documentUuid: 'doc_test_123', // From DocV result
      selfie: testSelfie,
      firstName: 'Juan Carlos',
      lastName: 'Pérez García',
      nationalId: '001-1234567-8',
      dateOfBirth: '1990-05-15',
    });

    console.log('✅ ID+ Result:', {
      decision: idResult.decision,
      livenessScore: idResult.livenessScore,
      faceMatch: idResult.faceMatch,
      fraudScore: idResult.fraudScore,
      riskLevel: idResult.riskLevel,
    });
  } catch (error) {
    console.error('❌ ID+ Error:', error);
  }
}

testSocureIntegration();
```

**Ejecutar:**
```bash
npx tsx scripts/test-socure.ts
```

### Casos de Prueba

| Test Case | Expected Result |
|-----------|----------------|
| Documento válido + Selfie real | `decision: "accept"` |
| Documento válido + Selfie no coincide | `decision: "reject"` |
| Documento inválido | `decision: "reject"` |
| Selfie con foto de foto | `livenessDecision: "not_live"` |
| Fraud score alto | `riskLevel: "high" o "critical"` |

---

## Producción

### Checklist de Go-Live

- [ ] Cambiar `SOCURE_API_KEY` a production key (`sk_live_...`)
- [ ] Cambiar `SOCURE_ENVIRONMENT` a `production`
- [ ] Configurar `SOCURE_BASE_URL` a URL de producción (si difiere)
- [ ] Configurar webhooks de Socure (opcional)
- [ ] Ajustar thresholds de producción:
  - `SOCURE_FRAUD_THRESHOLD` (recomendado: 750)
  - `SOCURE_LIVENESS_THRESHOLD` (recomendado: 0.8)
- [ ] Habilitar logging de producción
- [ ] Configurar alertas de Sentry/error tracking
- [ ] Realizar pruebas de carga
- [ ] Documentar procedimiento de rollback

### Monitoreo

**Métricas clave a trackear:**

1. **Tasa de aprobación** (acceptance rate)
   - Target: >85%
   - Alert si <70%

2. **Latencia de API**
   - Target: <3 segundos
   - Alert si >5 segundos

3. **Tasa de error**
   - Target: <1%
   - Alert si >5%

4. **False positive rate**
   - Rechazos de usuarios legítimos
   - Review manual si aumenta >10%

### Costos

**Pricing de Socure (aproximado):**

- DocV: ~$0.50 por verificación
- ID+: ~$1.50 por verificación completa
- Sigma: Incluido con ID+

**Estimación mensual:**
- 1000 onboardings/mes = ~$2,000 USD/mes
- 5000 onboardings/mes = ~$10,000 USD/mes

Contacta a Socure para pricing personalizado con volúmenes altos.

---

## Manejo de Errores

### Errores Comunes

#### 1. `401 Unauthorized`

**Causa:** API key inválida o expirada.

**Solución:**
```typescript
if (error.message.includes('401')) {
  // Log error and alert admin
  console.error('Socure API key inválida');
  // Send alert to monitoring
  Sentry.captureException(error, {
    tags: { service: 'socure', error_type: 'auth' }
  });
}
```

#### 2. `429 Too Many Requests`

**Causa:** Rate limit excedido.

**Solución:** Implementar retry con exponential backoff:

```typescript
async function requestWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

#### 3. `timeout`

**Causa:** Request demoró más de 30 segundos.

**Solución:**
```typescript
// Aumentar timeout para documentos grandes
const client = new SocureClient({ timeout: 60000 }); // 60s
```

#### 4. `decision: "review"`

**Causa:** Resultado no concluyente.

**Solución:**
```typescript
if (result.decision === 'review') {
  // Enviar a revisión manual
  await supabase.from('onboarding_cases').update({
    status: 'pending_review',
    review_reason: 'Socure returned inconclusive result'
  });
}
```

### Error Logging

```typescript
// lib/integrations/socure/logger.ts
export function logSocureError(
  operation: string,
  error: any,
  context: Record<string, any>
) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    operation,
    error: error.message,
    stack: error.stack,
    context,
  };

  console.error('[Socure Error]', errorLog);

  // Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: {
        service: 'socure',
        operation,
      },
      extra: context,
    });
  }
}
```

---

## Mejores Prácticas

### 1. Optimización de Imágenes

```typescript
/**
 * Compress image to optimal size for Socure
 * Target: <2MB, JPEG quality 85%
 */
export async function compressImage(base64: string): Promise<string> {
  // Use canvas to resize if needed
  const img = new Image();
  img.src = base64;

  await new Promise(resolve => img.onload = resolve);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Max dimensions
  const maxWidth = 1920;
  const maxHeight = 1920;

  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width *= ratio;
    height *= ratio;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', 0.85);
}
```

### 2. Caché de Resultados

```typescript
// Cache DocV results to avoid re-verification
const docvCache = new Map<string, DocumentVerificationResult>();

export async function verifyDocumentCached(
  input: DocumentVerificationInput
): Promise<DocumentVerificationResult> {
  const cacheKey = `${input.documentType}_${hashImage(input.frontImage)}`;

  if (docvCache.has(cacheKey)) {
    return docvCache.get(cacheKey)!;
  }

  const result = await verifyDocument(input);
  docvCache.set(cacheKey, result);

  return result;
}
```

### 3. Validación Previa

```typescript
/**
 * Validate image quality before sending to Socure
 */
export function validateImageQuality(base64: string): {
  valid: boolean;
  reason?: string;
} {
  // Check file size
  const sizeInBytes = (base64.length * 3) / 4;
  if (sizeInBytes > 10 * 1024 * 1024) { // 10MB
    return { valid: false, reason: 'Image too large (max 10MB)' };
  }

  if (sizeInBytes < 50 * 1024) { // 50KB
    return { valid: false, reason: 'Image too small (min 50KB)' };
  }

  // Check format
  if (!base64.startsWith('data:image/')) {
    return { valid: false, reason: 'Invalid image format' };
  }

  return { valid: true };
}
```

### 4. User Experience

**Guía para el usuario al tomar selfie:**

```typescript
const SELFIE_GUIDELINES = {
  es: {
    title: 'Instrucciones para la foto',
    tips: [
      '📸 Asegúrate de tener buena iluminación',
      '🤓 Quítate lentes oscuros o de sol',
      '🧢 No uses gorra, sombrero o capucha',
      '😊 Mira directamente a la cámara',
      '📱 Sostén el teléfono a la altura de los ojos',
    ],
  },
};
```

### 5. Seguridad

```typescript
// NUNCA almacenar imágenes sin encriptar
export async function uploadSecureDocument(
  file: File,
  caseId: string
): Promise<string> {
  const base64 = await fileToBase64(file);

  // Encrypt before storing (if storing locally)
  // const encrypted = await encryptData(base64);

  // Upload to secure storage with encryption at rest
  const { data, error } = await supabase.storage
    .from('onboarding-docs')
    .upload(`${caseId}/${file.name}`, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  // Return signed URL with expiration
  const { data: signedUrl } = await supabase.storage
    .from('onboarding-docs')
    .createSignedUrl(data.path, 3600); // 1 hour

  return signedUrl.signedUrl;
}
```

---

## FAQ

### ¿Cuánto tiempo toma la verificación?

**Respuesta:** Típicamente 2-4 segundos. En casos complejos puede tomar hasta 10 segundos.

### ¿Qué pasa si la API de Socure está caída?

**Respuesta:** Implementar fallback:

```typescript
try {
  const result = await verifySocureIdentity(input);
  return result;
} catch (error) {
  // Log error
  console.error('Socure API down:', error);

  // Fallback: marcar para revisión manual
  await supabase.from('onboarding_cases').update({
    status: 'pending_review',
    review_reason: 'Socure API unavailable - requires manual review'
  });

  return {
    success: false,
    requiresManualReview: true,
  };
}
```

### ¿Soporta múltiples idiomas?

**Sí.** Socure soporta OCR en 195+ países y múltiples alfabetos (latino, árabe, cirílico, etc.).

### ¿Puedo testear sin API key?

**No.** Necesitas una API key de sandbox. Contacta a Socure para obtener acceso.

### ¿Cómo manejo usuarios que fallan verificación?

**Opciones:**

1. **Retry:** Permitir 2-3 intentos antes de bloquear
2. **Manual Review:** Escalar a equipo de compliance
3. **Alternate Methods:** Ofrecer verificación presencial/videollamada
4. **Reject:** Si fraude confirmado, rechazar definitivamente

### ¿Qué hacer con datos sensibles después de verificación?

**Best practice:**

```typescript
// Después de verificación exitosa, eliminar imágenes
async function cleanupSensitiveData(caseId: string) {
  // Esperar 30 días (retention period)
  const retentionPeriod = 30 * 24 * 60 * 60 * 1000;

  setTimeout(async () => {
    // Delete from storage
    await supabase.storage
      .from('onboarding-docs')
      .remove([`${caseId}/selfie.jpg`, `${caseId}/cedula_front.jpg`]);

    // Keep metadata, remove raw images
    await supabase.from('identity_verifications').update({
      selfie_deleted_at: new Date().toISOString()
    }).eq('case_id', caseId);
  }, retentionPeriod);
}
```

---

## Recursos Adicionales

### Documentación Oficial

- 📘 [Socure API Documentation](https://developer.socure.com/docs)
- 📘 [DocV Guide](https://developer.socure.com/docs/docv)
- 📘 [ID+ Guide](https://developer.socure.com/docs/id-plus)
- 📘 [Sigma Fraud Score](https://developer.socure.com/docs/sigma)

### Soporte

- 📧 Email: support@socure.com
- 💬 Slack: [Socure Developer Community](https://socure-dev.slack.com)
- 📞 Teléfono: +1 (844) 600-2920

### Herramientas

- 🔧 [Postman Collection](https://www.postman.com/socure-api)
- 🔧 [Socure SDK for Node.js](https://www.npmjs.com/package/@socure/node-sdk)

---

## Changelog

### Version 1.0 (2026-01-08)

- ✅ Documentación inicial completa
- ✅ Ejemplos de código TypeScript
- ✅ Guías de testing en sandbox
- ✅ Best practices de seguridad
- ✅ FAQ y troubleshooting

---

**¿Preguntas o problemas?**
Contacta al equipo técnico: dev@fintechrd.com
