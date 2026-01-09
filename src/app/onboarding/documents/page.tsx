'use client';

/**
 * Documents Page - Step 7 of onboarding
 *
 * Upload 4 required documents:
 * - RNC Certificate (DGII)
 * - Registro Mercantil (Acta Constitutiva)
 * - Cédula del representante legal (both sides)
 * - Comprobante de dirección
 *
 * Each document is verified with Socure DocV for authenticity and OCR extraction.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, Suspense } from 'react';
import { uploadDocumentAction } from '@/app/actions/onboarding/upload-document';
import Button from '@/components/ui/button/Button';

interface DocumentStatus {
  uploaded: boolean;
  url?: string;
  socureStatus?: string;
  confidence?: number;
}

const steps = [
  'Información de la empresa',
  'Dirección',
  'Propietarios',
  'Verificación de identidad',
  'Documentos',
];

const REQUIRED_DOCUMENTS = [
  {
    key: 'rnc' as const,
    label: 'Comprobante RNC / DGII',
    description: 'Certificado de Registro Nacional de Contribuyentes',
  },
  {
    key: 'constitutivo' as const,
    label: 'Registro Mercantil / Acta Constitutiva',
    description: 'Documento de constitución de la empresa',
  },
  {
    key: 'cedula_front' as const,
    label: 'Cédula (Frente)',
    description: 'Anverso de la cédula del representante legal',
  },
  {
    key: 'cedula_back' as const,
    label: 'Cédula (Reverso)',
    description: 'Reverso de la cédula del representante legal',
  },
  {
    key: 'address' as const,
    label: 'Comprobante de dirección',
    description: 'Factura de servicios o estado de cuenta',
  },
];

function DocumentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const [documents, setDocuments] = useState<Record<string, DocumentStatus>>({
    rnc: { uploaded: false },
    constitutivo: { uploaded: false },
    cedula_front: { uploaded: false },
    cedula_back: { uploaded: false },
    address: { uploaded: false },
  });

  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const caseId = searchParams.get('caseId') || '';
  const companyId = searchParams.get('companyId') || '';

  const triggerFileInput = (key: string) => {
    fileInputs.current[key]?.click();
  };

  const handleFileChange = async (key: string, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      setError('Archivo muy grande. Máximo 10MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo PDF, PNG, JPG');
      return;
    }

    setUploading(key);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', key);
      formData.append('caseId', caseId);
      formData.append('companyId', companyId);

      // Upload using server action
      const result = await uploadDocumentAction(formData);

      if (!result.success) {
        setError(result.error || 'Error al subir documento');
        setUploading(null);
        return;
      }

      // Update document status
      setDocuments((prev) => ({
        ...prev,
        [key]: {
          uploaded: true,
          url: result.url,
          socureStatus: result.socureVerification?.status,
          confidence: result.socureVerification?.confidence,
        },
      }));

      setUploading(null);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado al subir');
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate all required documents are uploaded
    const requiredKeys = ['rnc', 'constitutivo', 'cedula_front', 'cedula_back'];
    const missingDocs = requiredKeys.filter((key) => !documents[key].uploaded);

    if (missingDocs.length > 0) {
      setError(`Faltan documentos por subir: ${missingDocs.join(', ')}`);
      setLoading(false);
      return;
    }

    // Navigate to next step
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/onboarding/expected-activity?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/onboarding/identity-verification?${params.toString()}`);
  };

  const getUploadedCount = () => {
    return Object.values(documents).filter((doc) => doc.uploaded).length;
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <p className="text-sm text-base-content/60">Paso 6 de 6</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0 space-y-3">
            <p className="text-sm font-medium text-primary">6 / 6</p>
            <nav className="space-y-2 text-sm">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`px-3 py-2 rounded-lg ${
                    idx === 5 ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/60'
                  }`}
                >
                  {step}
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Form */}
          <section className="flex-1">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 md:p-8 space-y-4"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Documentos requeridos</h1>
                <p className="text-base-content/70">
                  Sube los documentos para verificar tu empresa. Se verificarán automáticamente con
                  Socure DocV.
                </p>
                <p className="text-sm text-base-content/60">
                  {getUploadedCount()} de {REQUIRED_DOCUMENTS.length} documentos subidos
                </p>
              </div>

              {/* Documents list */}
              <div className="space-y-3">
                {REQUIRED_DOCUMENTS.map((doc) => {
                  const status = documents[doc.key];
                  const isUploading = uploading === doc.key;

                  return (
                    <div
                      key={doc.key}
                      className="border border-base-300 rounded-lg p-4 hover:bg-base-200/50 transition"
                    >
                      {/* Document header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{doc.label}</h3>
                            {status.uploaded && (
                              <span className="badge badge-success badge-sm">Subido</span>
                            )}
                            {doc.key === 'address' && (
                              <span className="badge badge-ghost badge-sm">Opcional</span>
                            )}
                          </div>
                          <p className="text-xs text-base-content/60 mt-1">{doc.description}</p>
                        </div>

                        {/* Upload button */}
                        {!status.uploaded && !isUploading && (
                          <Button
                            onClick={() => triggerFileInput(doc.key)}
                            className="btn btn-primary btn-sm"
                          >
                            Subir
                          </Button>
                        )}
                      </div>

                      {/* Uploading status */}
                      {isUploading && (
                        <div className="flex items-center gap-2 text-sm text-info">
                          <div className="loading loading-spinner loading-xs"></div>
                          <span>Subiendo y verificando...</span>
                        </div>
                      )}

                      {/* Uploaded status */}
                      {status.uploaded && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <svg
                              className="w-4 h-4 text-success"
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
                            <span>Documento subido correctamente</span>
                          </div>

                          {/* Socure verification status */}
                          {status.socureStatus && (
                            <div className="text-xs">
                              <span className="text-base-content/60">Estado Socure DocV: </span>
                              <span
                                className={
                                  status.socureStatus === 'verified'
                                    ? 'text-success font-medium'
                                    : status.socureStatus === 'rejected'
                                    ? 'text-error font-medium'
                                    : 'text-warning font-medium'
                                }
                              >
                                {status.socureStatus === 'verified' ? 'Verificado' : status.socureStatus === 'rejected' ? 'Rechazado' : 'En revisión'}
                              </span>
                              {status.confidence !== undefined && (
                                <span className="ml-2 text-base-content/60">
                                  (Confianza: {(status.confidence * 100).toFixed(0)}%)
                                </span>
                              )}
                            </div>
                          )}

                          {status.url && (
                            <a
                              href={status.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs link link-primary"
                            >
                              Ver documento
                            </a>
                          )}
                        </div>
                      )}

                      {/* Hidden file input */}
                      <input
                        ref={(el) => {
                          if (!fileInputs.current) fileInputs.current = {};
                          fileInputs.current[doc.key] = el;
                        }}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(doc.key, e.target.files)}
                        accept=".pdf,.png,.jpg,.jpeg"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Info box */}
              <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-sm text-base-content/80">
                  <strong>Tipos de archivo permitidos:</strong> PDF, PNG, JPG (máximo 10MB)
                </p>
                <p className="text-xs text-base-content/60 mt-1">
                  Los documentos se verificarán automáticamente usando OCR y detección de fraude.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-error/10 border border-error rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  className="btn btn-ghost btn-sm"
                  onClick={handleBack}
                  disabled={loading || !!uploading}
                >
                  Atrás
                </Button>

                <Button
                  className="btn btn-primary"
                  disabled={loading || !!uploading || getUploadedCount() < 4}
                >
                  {loading ? 'Guardando...' : 'Siguiente'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <DocumentsContent />
    </Suspense>
  )
}
