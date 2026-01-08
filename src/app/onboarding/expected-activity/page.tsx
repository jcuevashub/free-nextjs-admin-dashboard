'use client';

/**
 * Expected Activity Page - Step 8 of onboarding
 *
 * Collects information about expected business volume and activity.
 * Saves data to onboarding_cases.expected_activity_data.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { saveStepAction } from '@/app/actions/onboarding/save-step';

const steps = [
  'Selección de cuenta',
  'Información de la empresa',
  'Dirección',
  'Propietarios',
  'Verificación de identidad',
  'Documentos',
];

export default function ExpectedActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [countries, setCountries] = useState('República Dominicana');
  const [fundingSource, setFundingSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caseId = searchParams.get('caseId') || undefined;
  const companyId = searchParams.get('companyId') || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Save expected activity data
      const result = await saveStepAction({
        step: 'expected_activity',
        caseId,
        data: {
          monthlyVolume,
          countries,
          fundingSource,
        },
      });

      if (!result.success) {
        setError(result.error || 'Error al guardar actividad esperada');
        setLoading(false);
        return;
      }

      // Navigate to next step
      const params = new URLSearchParams(searchParams.toString());
      params.set('caseId', result.caseId!);
      if (result.companyId) params.set('companyId', result.companyId);
      router.push(`/onboarding/follow-up?${params.toString()}`);
    } catch (err) {
      console.error('Error in expected-activity:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/onboarding/documents?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <p className="text-sm text-base-content/60">Paso 8 de 10</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 flex-shrink-0 space-y-3">
            <p className="text-sm font-medium text-primary">8 / 10</p>
            <nav className="space-y-2 text-sm">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`px-3 py-2 rounded-lg text-base-content/60`}
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
                <h1 className="text-2xl font-semibold">Actividad esperada</h1>
                <p className="text-base-content/70">Ayúdanos a entender el volumen y origen de fondos.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="form-control w-full">
                  <span className="label-text text-sm font-medium">Volumen mensual estimado</span>
                  <input
                    type="text"
                    required
                    className="input input-bordered w-full"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    placeholder="Ej: DOP 50,000"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-sm font-medium">Países con los que operas</span>
                  <input
                    type="text"
                    required
                    className="input input-bordered w-full"
                    value={countries}
                    onChange={(e) => setCountries(e.target.value)}
                    placeholder="Rep. Dominicana, EE.UU., ... "
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-sm font-medium">Origen de fondos</span>
                  <input
                    type="text"
                    required
                    className="input input-bordered w-full"
                    value={fundingSource}
                    onChange={(e) => setFundingSource(e.target.value)}
                    placeholder="Ventas, inversiones, préstamos, etc."
                  />
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-error/10 border border-error rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleBack} disabled={loading}>
                  Atrás
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Siguiente'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
