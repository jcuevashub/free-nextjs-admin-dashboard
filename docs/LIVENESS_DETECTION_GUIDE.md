# Guía de Implementación: Prueba de Vida (Liveness Detection)

**Última actualización:** 2026-01-08
**Versión:** 1.0
**Requiere:** Socure ID+ configurado

---

## Tabla de Contenidos

1. [¿Qué es Liveness Detection?](#qué-es-liveness-detection)
2. [Tipos de Ataques](#tipos-de-ataques)
3. [Implementación Frontend](#implementación-frontend)
4. [UX Guidelines](#ux-guidelines)
5. [Captura de Video vs Imagen](#captura-de-video-vs-imagen)
6. [Validaciones Pre-envío](#validaciones-pre-envío)
7. [Manejo de Fallos](#manejo-de-fallos)
8. [Testing](#testing)
9. [Optimización](#optimización)

---

## ¿Qué es Liveness Detection?

La **detección de vida** (liveness detection) es el proceso de verificar que una persona real está presente durante la captura biométrica, no una foto impresa, video reproducido o máscara.

### Por qué es importante

- ✅ Previene **presentation attacks** (foto de foto, video replay)
- ✅ Detecta **deepfakes** y **face swaps**
- ✅ Cumple con regulaciones KYC/AML
- ✅ Reduce fraude de identidad en >95%

### Cómo funciona Socure Liveness

Socure utiliza **passive liveness**, que analiza la imagen estática de la selfie sin requerir acciones del usuario (parpadear, girar cabeza, etc.).

**Ventajas de passive liveness:**
- ⚡ Más rápido (1 imagen vs 10+ frames)
- 😊 Mejor UX (sin instrucciones complejas)
- ♿ Accesible (no requiere movimiento)
- 🌍 Funciona en cualquier dispositivo

**Factores que analiza:**
- Textura de la piel
- Micro-expresiones faciales
- Reflexión de luz natural
- Profundidad 3D estimada
- Detección de bordes de pantalla

---

## Tipos de Ataques

### 1. Photo Attack (Foto de Foto)

**Descripción:** Mostrar una foto impresa o en pantalla.

**Cómo lo detecta Socure:**
- Falta de profundidad 3D
- Bordes del papel/pantalla visibles
- Reflexión de luz uniforme (no natural)

**Score típico:** 0.1 - 0.3 (muy bajo)

### 2. Video Replay Attack

**Descripción:** Reproducir un video de la persona.

**Cómo lo detecta Socure:**
- Patrones de movimiento artificial
- Bordes de pantalla
- Píxeles duplicados del replay

**Score típico:** 0.2 - 0.4

### 3. Deepfake Attack

**Descripción:** Video generado con IA.

**Cómo lo detecta Socure:**
- Artefactos de generación de IA
- Inconsistencias en textura de piel
- Anomalías en frecuencias de imagen

**Score típico:** 0.3 - 0.6

### 4. Mask Attack (3D Mask)

**Descripción:** Usar máscara física 3D de la persona.

**Cómo lo detecta Socure:**
- Material no orgánico detectado
- Falta de micro-expresiones
- Reflexión de luz artificial

**Score típico:** 0.4 - 0.7

### 5. Live Person (Persona Real)

**Score esperado:** 0.85 - 0.99 ✅

---

## Implementación Frontend

### Componente de Captura de Selfie

**Archivo:** `src/components/onboarding/SelfieCapture.tsx`

```typescript
'use client';

import { useRef, useState, useCallback } from 'react';

interface SelfieCaptureProps {
  onCapture: (imageBase64: string) => void;
  onError?: (error: string) => void;
}

export default function SelfieCapture({ onCapture, onError }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 1.333 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }

      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      onError?.('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    }
  }, [onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  }, [stream]);

  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.92);

    // Validate image quality
    const validation = validateImageQuality(imageBase64);
    if (!validation.valid) {
      onError?.(validation.reason || 'Imagen inválida');
      setCapturing(false);
      return;
    }

    // Stop camera
    stopCamera();

    // Return image
    onCapture(imageBase64);
    setCapturing(false);
  }, [onCapture, onError, stopCamera]);

  // Retake
  const retake = useCallback(() => {
    stopCamera();
    startCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Instrucciones para la selfie
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>📸 Asegúrate de tener buena iluminación</li>
          <li>🤓 Quítate lentes oscuros o de sol</li>
          <li>🧢 No uses gorra, sombrero o capucha</li>
          <li>😊 Mira directamente a la cámara</li>
          <li>📱 Mantén el rostro centrado en el círculo</li>
        </ul>
      </div>

      {/* Camera View */}
      <div className="relative">
        {/* Video element */}
        <video
          ref={videoRef}
          className="rounded-2xl max-w-md w-full"
          autoPlay
          playsInline
          muted
        />

        {/* Canvas (hidden) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Face oval overlay */}
        {isCameraReady && (
          <div className="absolute inset-0 pointer-events-none">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Dark overlay */}
              <mask id="face-mask">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <ellipse cx="50" cy="45" rx="25" ry="32" fill="black" />
              </mask>
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="rgba(0,0,0,0.5)"
                mask="url(#face-mask)"
              />
              {/* Oval guide */}
              <ellipse
                cx="50"
                cy="45"
                rx="25"
                ry="32"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            </svg>
          </div>
        )}

        {/* Loading state */}
        {!isCameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p>Iniciando cámara...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isCameraReady ? (
          <button
            onClick={startCamera}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar Cámara
          </button>
        ) : (
          <>
            <button
              onClick={captureImage}
              disabled={capturing}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {capturing ? 'Capturando...' : 'Capturar Foto'}
            </button>
            <button
              onClick={retake}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Cancelar
            </button>
          </>
        )}
      </div>

      {/* Privacy notice */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
        🔒 Tu imagen será procesada de forma segura y encriptada. No será compartida con terceros
        sin tu consentimiento.
      </p>
    </div>
  );
}

/**
 * Validate image quality before uploading
 */
function validateImageQuality(base64: string): { valid: boolean; reason?: string } {
  // Check file size
  const sizeInBytes = (base64.length * 3) / 4;

  if (sizeInBytes > 10 * 1024 * 1024) {
    return { valid: false, reason: 'Imagen muy grande (máx 10MB)' };
  }

  if (sizeInBytes < 50 * 1024) {
    return { valid: false, reason: 'Imagen muy pequeña (mín 50KB)' };
  }

  // Check if it's actually an image
  if (!base64.startsWith('data:image/')) {
    return { valid: false, reason: 'Formato de imagen inválido' };
  }

  return { valid: true };
}
```

### Uso en Página de Onboarding

**Archivo:** `src/app/onboarding/identity-verification/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import SelfieCapture from '@/components/onboarding/SelfieCapture';
import { verifyIdentityAction } from '@/app/actions/onboarding/verify-identity';

export default function IdentityVerificationPage() {
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelfieCapture = async (imageBase64: string) => {
    setSelfieBase64(imageBase64);
  };

  const handleSubmit = async () => {
    if (!selfieBase64) return;

    setLoading(true);
    setError(null);

    try {
      const verificationResult = await verifyIdentityAction({
        caseId: 'case_123', // From URL params or state
        documentUuid: 'doc_456', // From previous step
        firstName: 'Juan',
        lastName: 'Pérez',
        nationalId: '001-1234567-8',
        dateOfBirth: '1990-05-15',
        selfieBase64,
      });

      if (!verificationResult.success) {
        setError(verificationResult.error || 'Error en verificación');
        return;
      }

      setResult(verificationResult);
    } catch (err) {
      setError('Error inesperado al verificar identidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Verificación de Identidad</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Toma una selfie para verificar tu identidad
      </p>

      {!selfieBase64 ? (
        <SelfieCapture onCapture={handleSelfieCapture} onError={setError} />
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div>
            <h3 className="font-semibold mb-2">Vista previa</h3>
            <img
              src={selfieBase64}
              alt="Selfie preview"
              className="rounded-lg max-w-sm mx-auto border-2 border-gray-300 dark:border-gray-700"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSelfieBase64(null)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Tomar otra foto
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Continuar'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ✅ Verificación exitosa
              </h3>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <p>Liveness Score: {(result.livenessScore * 100).toFixed(1)}%</p>
                <p>Face Match: {result.faceMatch ? '✅ Sí' : '❌ No'}</p>
                <p>Risk Level: {result.riskLevel}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## UX Guidelines

### Iluminación

**Buena iluminación:**
- ✅ Luz natural frontal (ventana)
- ✅ Luz artificial blanca difusa
- ✅ Evitar sombras en el rostro

**Mala iluminación:**
- ❌ Contraluz (ventana detrás)
- ❌ Sombras fuertes
- ❌ Muy oscuro (<20 lux)
- ❌ Muy brillante (>1000 lux)

### Posición del Rostro

```
     Correcto ✅          Incorrecto ❌

    [  👤  ]            [👤      ]  (muy a la izquierda)
    Centrado            Descentrado

    [  👤  ]            [    👤  ]  (muy arriba)
    Altura OK           Muy alto

    [  👤  ]            [ 👤👤  ]  (múltiples personas)
    1 persona           Varias personas
```

### Distancia

**Óptima:** 30-50 cm de la cámara

**Demasiado cerca:** El rostro ocupa >80% del frame
**Demasiado lejos:** El rostro ocupa <30% del frame

### Feedback Visual en Tiempo Real

```typescript
// Detectar problemas comunes y mostrar feedback

interface QualityChecks {
  brightness: 'ok' | 'too_dark' | 'too_bright';
  faceDetected: boolean;
  faceSize: 'ok' | 'too_small' | 'too_large';
  multipleFaces: boolean;
}

function checkImageQuality(imageData: ImageData): QualityChecks {
  // Brightness check
  let totalBrightness = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    totalBrightness += (r + g + b) / 3;
  }
  const avgBrightness = totalBrightness / (imageData.data.length / 4);

  let brightness: 'ok' | 'too_dark' | 'too_bright' = 'ok';
  if (avgBrightness < 50) brightness = 'too_dark';
  if (avgBrightness > 200) brightness = 'too_bright';

  // Use FaceAPI.js or similar for face detection
  // const faces = await detectFaces(imageData);

  return {
    brightness,
    faceDetected: true, // From face detection
    faceSize: 'ok',
    multipleFaces: false,
  };
}
```

---

## Captura de Video vs Imagen

### Imagen Estática (Recomendado)

**Ventajas:**
- ⚡ Más rápido
- 📱 Funciona en todos los dispositivos
- 🎯 Mejor UX
- 💾 Menor tamaño de datos

**Desventajas:**
- Menos información temporal

### Video (3-5 segundos)

**Ventajas:**
- 🔍 Más datos para análisis
- 🎭 Mejor detección de deepfakes
- 📊 Información temporal

**Desventajas:**
- ⏱️ Más lento (upload + procesamiento)
- 📱 Puede fallar en dispositivos lentos
- 💾 Archivos grandes (5-20 MB)

**Para Fintech RD:** Usamos **imagen estática** con Socure passive liveness.

---

## Validaciones Pre-envío

### Checklist Frontend

```typescript
interface PreSubmitChecks {
  imageSize: boolean; // 50KB - 10MB
  imageFormat: boolean; // JPEG, PNG
  faceDetected: boolean; // Al menos 1 rostro
  multipleFaces: boolean; // Máximo 1 rostro
  brightness: boolean; // 50-200 lux
  sharpness: boolean; // No borroso
}

async function validateBeforeSubmit(base64: string): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // 1. Size check
  const sizeInBytes = (base64.length * 3) / 4;
  if (sizeInBytes < 50 * 1024) {
    errors.push('Imagen muy pequeña. Toma otra foto más cercana.');
  }
  if (sizeInBytes > 10 * 1024 * 1024) {
    errors.push('Imagen muy grande. Intenta reducir la resolución.');
  }

  // 2. Format check
  if (!base64.startsWith('data:image/jpeg') && !base64.startsWith('data:image/png')) {
    errors.push('Formato de imagen no soportado. Usa JPEG o PNG.');
  }

  // 3. Load image for advanced checks
  const img = await loadImage(base64);

  // 4. Resolution check
  if (img.width < 640 || img.height < 480) {
    errors.push('Resolución muy baja. Usa una cámara de mejor calidad.');
  }

  // 5. Aspect ratio check
  const aspectRatio = img.width / img.height;
  if (aspectRatio < 0.5 || aspectRatio > 2) {
    errors.push('Proporción de imagen incorrecta.');
  }

  // 6. Face detection (using simple heuristics or FaceAPI.js)
  // const faceDetectionResult = await detectFace(img);
  // if (!faceDetectionResult.faceDetected) {
  //   errors.push('No se detectó un rostro. Asegúrate de estar centrado.');
  // }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}
```

---

## Manejo de Fallos

### Flujo de Retry

```typescript
interface RetryConfig {
  maxAttempts: 3;
  currentAttempt: number;
  reasons: string[];
}

function handleLivenessFailed(
  score: number,
  attempt: number,
  maxAttempts: number
): {
  canRetry: boolean;
  message: string;
  suggestions: string[];
} {
  const canRetry = attempt < maxAttempts;

  let message = '';
  const suggestions: string[] = [];

  if (score < 0.5) {
    // Very low score - likely photo attack
    message = 'No pudimos verificar que eres una persona real.';
    suggestions.push('Asegúrate de no estar usando una foto o pantalla');
    suggestions.push('Mejora la iluminación');
    suggestions.push('Mira directamente a la cámara');
  } else if (score < 0.8) {
    // Medium score - might be lighting or angle issue
    message = 'La verificación no fue concluyente.';
    suggestions.push('Mejora la iluminación (más luz frontal)');
    suggestions.push('Asegúrate de estar bien centrado');
    suggestions.push('Quítate los lentes si tienes');
  }

  if (canRetry) {
    message += ` Tienes ${maxAttempts - attempt} intentos restantes.`;
  } else {
    message = 'Has alcanzado el máximo de intentos. Tu caso será revisado manualmente.';
  }

  return { canRetry, message, suggestions };
}
```

### Escalación a Revisión Manual

```typescript
async function escalateToManualReview(
  caseId: string,
  reason: string,
  attempts: number,
  lastScore: number
) {
  const supabase = await createSupabaseServer();

  // Update case status
  await supabase
    .from('onboarding_cases')
    .update({
      status: 'pending_review',
      review_reason: `Liveness failed after ${attempts} attempts. Last score: ${lastScore}. Reason: ${reason}`,
    })
    .eq('id', caseId);

  // Create notification for admin
  await supabase.from('notifications').insert({
    type: 'manual_review_required',
    title: 'Revisión manual requerida - Liveness',
    message: `Caso ${caseId} requiere revisión manual. Usuario no pasó verificación de liveness.`,
    severity: 'high',
  });

  // Send email to user
  await sendEmail({
    to: 'user@example.com',
    subject: 'Verificación en proceso',
    html: `
      <p>Tu verificación de identidad está siendo revisada por nuestro equipo.</p>
      <p>Te notificaremos en las próximas 24-48 horas.</p>
    `,
  });
}
```

---

## Testing

### Test Cases

| Test Case | Expected Liveness Score | Expected Decision |
|-----------|------------------------|-------------------|
| Selfie real, buena iluminación | 0.90 - 0.99 | accept ✅ |
| Selfie real, poca luz | 0.70 - 0.85 | review 👁️ |
| Foto de foto en papel | 0.10 - 0.30 | reject ❌ |
| Foto de pantalla | 0.15 - 0.35 | reject ❌ |
| Video en pantalla | 0.20 - 0.40 | reject ❌ |
| Deepfake (baja calidad) | 0.30 - 0.60 | reject ❌ |
| Máscara 3D | 0.40 - 0.70 | reject ❌ |

### Script de Testing Manual

```bash
# 1. Test con selfie real
npx tsx scripts/test-liveness.ts --image ./test-data/real-selfie.jpg

# 2. Test con foto de foto
npx tsx scripts/test-liveness.ts --image ./test-data/photo-attack.jpg

# 3. Test con video replay
npx tsx scripts/test-liveness.ts --image ./test-data/video-replay.jpg
```

---

## Optimización

### Compresión de Imagen

```typescript
/**
 * Compress selfie to optimal size for Socure
 * Target: 300-500 KB, 1280x720, JPEG 85%
 */
export async function compressSelfie(base64: string): Promise<string> {
  const img = await loadImage(base64);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Target dimensions
  const targetWidth = 1280;
  const targetHeight = 720;

  // Calculate resize ratio
  const ratio = Math.min(targetWidth / img.width, targetHeight / img.height, 1);

  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;

  // Draw resized image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // Convert to JPEG with quality 85%
  return canvas.toDataURL('image/jpeg', 0.85);
}
```

### Lazy Loading de Cámara

```typescript
// Only load camera when user clicks "Tomar Selfie"
// This improves page load performance

const [cameraActive, setCameraActive] = useState(false);

// Render camera component only when active
{cameraActive && <SelfieCapture onCapture={handleCapture} />}
```

### Preload Face Detection Library

```typescript
// Preload FaceAPI.js in background for faster face detection
useEffect(() => {
  if (typeof window !== 'undefined') {
    import('@vladmandic/face-api').then((faceapi) => {
      // Load models in background
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      ]);
    });
  }
}, []);
```

---

## Resumen de Best Practices

✅ **DO:**
- Usar passive liveness (1 imagen estática)
- Mostrar guías visuales (óvalo facial)
- Validar calidad antes de enviar
- Dar feedback claro sobre errores
- Permitir 2-3 reintentos
- Comprimir imágenes antes de upload
- Escalar a revisión manual después de 3 fallos

❌ **DON'T:**
- No usar active liveness (parpadear, girar cabeza) - peor UX
- No enviar videos completos - muy pesado
- No mostrar mensajes de error técnicos al usuario
- No rechazar inmediatamente sin permitir retry
- No almacenar selfies sin encriptar
- No hacer verificación del lado del cliente únicamente

---

## Recursos

- 📘 [Socure Liveness Documentation](https://developer.socure.com/docs/liveness)
- 📘 [FaceAPI.js](https://github.com/vladmandic/face-api)
- 📘 [WebRTC Camera Access](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

---

**¿Preguntas?**
Contacta al equipo técnico: dev@fintechrd.com
