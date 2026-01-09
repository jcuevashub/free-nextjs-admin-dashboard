'use client';

/**
 * Follow-up Page - Step 9 of onboarding
 *
 * Final step: collects additional notes and submits the case for review.
 * Calls submitCaseAction which applies auto-decision logic.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { submitCaseAction } from '@/app/actions/onboarding/submit-case';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';

const steps = [
  'Crear cuenta',
  'Información de la empresa',
  'Propietarios',
  'Documentos de la empresa',
  'Actividad esperada',
  'Seguimiento'
];

function FollowUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caseId = searchParams.get('caseId') || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Submit case for review with auto-decision logic
      const result = await submitCaseAction({
        caseId: caseId!,
      });

      if (!result.success) {
        setError(result.error || 'Error al finalizar onboarding');
        setLoading(false);
        return;
      }

      // Navigate to complete page
      router.push('/onboarding/complete');
    } catch (err) {
      console.error('Error in follow-up:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/onboarding/expected-activity?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <p className="text-xl text-base-content/60">Paso 6 de 6</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 shrink-0 space-y-3">
            <p className="text-md font-medium text-primary">6 / 6</p>
            <nav className="space-y-2 text-md">
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

          <section className="flex-1">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 md:p-8 space-y-4"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Preguntas adicionales</h1>
                <p className="text-base-content/70">Comparte cualquier detalle relevante para la revisión.</p>
              </div>

              <label className="form-control w-full">
                <span className="label-text text-md font-medium">Información adicional (opcional)</span>
                <TextArea
                  className="textarea textarea-bordered w-full"
                  rows={5}
                  value={additionalInfo}
                  onChange={(value) => setAdditionalInfo(value)}
                  placeholder="Describe casos de uso específicos, clientes clave, certificaciones o cualquier detalle relevante para la revisión..."
                />
              </label>

              {/* Info box */}
              <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-md text-base-content/80">
                  <strong>Siguiente paso:</strong> Tu solicitud será enviada a revisión. Aplicaremos
                  verificaciones automáticas basadas en los datos proporcionados.
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-error/10 border border-error rounded-lg">
                  <p className="text-md text-error">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleBack} disabled={loading}>
                  Atrás
                </button>
                <Button  className="btn btn-primary" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar a Revisión'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

export default function FollowUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <FollowUpContent />
    </Suspense>
  )
}
