'use client';

/**
 * Expected Activity Page - Step 8 of onboarding
 *
 * Collects information about expected business volume and activity.
 * Saves data to onboarding_cases.expected_activity_data.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { saveStepAction } from '@/app/actions/onboarding/save-step';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import MultiSelect from '@/components/form/MultiSelect';

const steps = [
  'Crear cuenta',
  'Información de la empresa',
  'Propietarios',
  'Documentos de la empresa',
  'Actividad esperada',
  'Seguimiento'
];

function ExpectedActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [countries, setCountries] = useState<string[]>(['República Dominicana']);
  const [fundingSource, setFundingSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const countryOptions = [
    { value: 'República Dominicana', text: 'República Dominicana', selected: false },
    { value: 'Estados Unidos', text: 'Estados Unidos', selected: false },
    { value: 'Canadá', text: 'Canadá', selected: false },
    { value: 'México', text: 'México', selected: false },
    { value: 'Puerto Rico', text: 'Puerto Rico', selected: false },
    { value: 'España', text: 'España', selected: false },
    { value: 'Colombia', text: 'Colombia', selected: false },
    { value: 'Chile', text: 'Chile', selected: false },
    { value: 'Argentina', text: 'Argentina', selected: false },
    { value: 'Perú', text: 'Perú', selected: false },
  ];

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
        <p className="text-xl text-base-content/60">Paso 5 de 6</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 shrink-0 space-y-3">
            <p className="text-xl font-medium text-primary">5 / 6</p>
              <nav className="space-y-2 text-md">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`px-3 py-2 rounded-lg ${
                    idx === 4 ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/60'
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
                <h1 className="text-2xl font-semibold">Actividad esperada</h1>
                <p className="text-base-content/70">Ayúdanos a entender el volumen y origen de fondos.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Volumen mensual estimado</span>
                  <Input
                    type="text"
                    required
                    className="input input-bordered w-full"
                    value={monthlyVolume}
                    onChange={(e) => setMonthlyVolume(e.target.value)}
                    placeholder="Ej: DOP 50,000"
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Países con los que operas</span>
                  <MultiSelect
                    label="Puedes seleccionar varios países."
                    options={countryOptions}
                    defaultSelected={["República Dominicana", "Estados Unidos"]}
                    onChange={(values) => setSelectedValues(values)}
                  />
                </label>
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Origen de fondos</span>
                  <Input
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
                  <p className="text-md text-error">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleBack} disabled={loading}>
                  Atrás
                </button>
                <Button className="btn btn-primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Siguiente'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

export default function ExpectedActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ExpectedActivityContent />
    </Suspense>
  )
}
