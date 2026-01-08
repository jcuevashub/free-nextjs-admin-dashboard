'use client';

/**
 * Identity Verification Page
 *
 * Step 6 of onboarding: Selfie capture + liveness detection with Socure ID+
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { verifyIdentityAction } from '@/app/actions/onboarding/verify-identity';

type VerificationStatus = 'idle' | 'capturing' | 'uploading' | 'verifying' | 'success' | 'error';

export default function IdentityVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selfieDataUrl, setSelfieDataUrl] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [result, setResult] = useState<{
    livenessScore?: number;
    faceMatch?: boolean;
    decision?: string;
  } | null>(null);

  const caseId = searchParams.get('caseId') || '';
  const documentUuid = searchParams.get('documentUuid') || '';
  const firstName = searchParams.get('firstName') || '';
  const lastName = searchParams.get('lastName') || '';
  const nationalId = searchParams.get('nationalId') || '';
  const dateOfBirth = searchParams.get('dateOfBirth') || '';

  /**
   * Start camera for selfie capture
   */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    }
  };

  /**
   * Stop camera
   */
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  /**
   * Capture selfie from video stream
   */
  const captureSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Get data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setSelfieDataUrl(dataUrl);
    setStatus('capturing');
    stopCamera();
  };

  /**
   * Retake selfie
   */
  const retakeSelfie = () => {
    setSelfieDataUrl(null);
    setStatus('idle');
    setError(null);
    startCamera();
  };

  /**
   * Submit for verification
   */
  const handleSubmit = async () => {
    if (!selfieDataUrl) {
      setError('Por favor captura una selfie primero');
      return;
    }

    if (!documentUuid || !firstName || !lastName || !nationalId || !dateOfBirth) {
      setError('Faltan datos requeridos. Por favor regresa y completa los pasos anteriores.');
      return;
    }

    setStatus('verifying');
    setError(null);

    try {
      // Extract base64 from data URL
      const base64Image = selfieDataUrl.split(',')[1];

      const result = await verifyIdentityAction({
        caseId,
        documentUuid,
        firstName,
        lastName,
        nationalId,
        dateOfBirth,
        selfieBase64: base64Image,
      });

      if (!result.success) {
        setError(result.error || 'Error al verificar identidad');
        setStatus('error');
        return;
      }

      setResult(result);
      setStatus('success');

      // Auto-redirect after 3 seconds if approved
      if (result.decision === 'accept') {
        setTimeout(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('livenessScore', result.livenessScore?.toString() || '0');
          router.push(`/onboarding/documents?${params.toString()}`);
        }, 3000);
      }
    } catch (err) {
      console.error('Error verifying identity:', err);
      setError('Error inesperado. Por favor intenta de nuevo.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            Verificación de identidad
          </h1>
          <p className="text-base-content/70">
            Toma una selfie para verificar tu identidad con detección de liveness
          </p>
        </div>

        {/* Main card */}
        <div className="bg-base-100 rounded-2xl shadow-lg p-8">
          {/* Status: Idle or Camera */}
          {(status === 'idle' || cameraActive) && (
            <>
              {/* Video preview */}
              <div className="mb-6 relative aspect-video bg-base-300 rounded-xl overflow-hidden">
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg
                        className="w-24 h-24 mx-auto mb-4 text-base-content/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <p className="text-base-content/60">Cámara desactivada</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="mb-6 p-4 bg-info/10 border border-info/30 rounded-lg">
                <h3 className="font-semibold text-base-content mb-2">Instrucciones:</h3>
                <ul className="text-sm text-base-content/80 space-y-1 list-disc list-inside">
                  <li>Asegúrate de estar en un lugar bien iluminado</li>
                  <li>Mira directamente a la cámara</li>
                  <li>Mantén tu rostro centrado y visible</li>
                  <li>No uses lentes de sol ni sombreros</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="btn btn-primary flex-1"
                  >
                    Iniciar cámara
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={captureSelfie}
                    className="btn btn-primary flex-1"
                  >
                    Capturar selfie
                  </button>
                )}
              </div>
            </>
          )}

          {/* Status: Captured selfie preview */}
          {status === 'capturing' && selfieDataUrl && (
            <>
              <div className="mb-6 relative aspect-video bg-base-300 rounded-xl overflow-hidden">
                <img
                  src={selfieDataUrl}
                  alt="Selfie capturada"
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-center mb-6 text-base-content/80">
                ¿Esta foto se ve bien? Asegúrate de que tu rostro sea visible y esté bien iluminado.
              </p>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={retakeSelfie}
                  className="btn btn-ghost flex-1"
                >
                  Tomar otra foto
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary flex-1"
                >
                  Verificar identidad
                </button>
              </div>
            </>
          )}

          {/* Status: Verifying */}
          {status === 'verifying' && (
            <div className="text-center py-12">
              <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
              <p className="text-base-content font-medium mb-2">Verificando tu identidad...</p>
              <p className="text-base-content/60 text-sm">
                Esto puede tomar unos segundos
              </p>
            </div>
          )}

          {/* Status: Success */}
          {status === 'success' && result && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-success mb-2">
                ¡Identidad verificada!
              </h3>
              <p className="text-base-content/70 mb-4">
                Tu identidad ha sido verificada exitosamente
              </p>

              {result.livenessScore !== undefined && (
                <p className="text-sm text-base-content/60">
                  Liveness score: {(result.livenessScore * 100).toFixed(0)}%
                </p>
              )}

              <p className="text-sm text-base-content/60 mt-4">
                Redirigiendo al siguiente paso...
              </p>
            </div>
          )}

          {/* Status: Error */}
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-error mb-2">
                Verificación fallida
              </h3>
              <p className="text-base-content/70 mb-6">{error}</p>

              <button
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setError(null);
                  setSelfieDataUrl(null);
                }}
                className="btn btn-primary"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* Error message (general) */}
          {error && status !== 'error' && (
            <div className="mt-6 p-4 bg-error/10 border border-error rounded-lg text-error text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Progress indicator */}
        <div className="mt-6 text-center text-sm text-base-content/60">
          Paso 6 de 10
        </div>
      </div>
    </div>
  );
}
