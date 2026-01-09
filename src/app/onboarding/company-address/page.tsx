'use client';

/**
 * Company Address Page - Step 4 of onboarding
 *
 * Collects company physical address.
 * Saves data to onboarding_cases.address_data.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { saveStepAction } from '@/app/actions/onboarding/save-step';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';

const steps = [
  'Información de la empresa',
  'Dirección',
  'Propietarios',
  'Verificación de identidad',
  'Documentos',
];

function CompanyAddressContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country] = useState('DO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caseId = searchParams.get('caseId') || undefined;
  const companyId = searchParams.get('companyId') || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
        router.push(`/onboarding/ownership`);
    // try {
    //   // Save address data
    //   const result = await saveStepAction({
    //     step: 'company_address',
    //     caseId,
        // data: {
        //   addressLine1,
        //   addressLine2: addressLine2 || undefined,
        //   city,
        //   province,
        //   postalCode: postalCode || undefined,
        //   country,
        // },
    //   });

    //   if (!result.success) {
    //     setError(result.error || 'Error al guardar dirección');
    //     setLoading(false);
    //     return;
    //   }

    //   // Navigate to next step
    //   const params = new URLSearchParams(searchParams.toString());
    //   params.set('caseId', result.caseId!);
    //   if (result.companyId) params.set('companyId', result.companyId);
    //   router.push(`/onboarding/ownership?${params.toString()}`);
    // } catch (err) {
    //   console.error('Error in company-address:', err);
    //   setError(err instanceof Error ? err.message : 'Error inesperado');
    //   setLoading(false);
    // }
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/onboarding/company-info?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <p className="text-xl text-base-content/60">Paso 2 de 6</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 shrink-0 space-y-3">
            <p className="text-xl font-medium text-primary">2 / 6</p>
            <nav className="space-y-2 text-md">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`px-3 py-2 rounded-lg ${
                    idx === 1 ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/60'
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
                <h1 className="text-2xl font-semibold">Dirección de la empresa</h1>
                <p className="text-base-content/70">Usaremos esta dirección para verificaciones y notificaciones.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Address Line 1 */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Dirección *</span>
                  <Input
                    type="text"
                    className="input input-bordered w-full"
                    defaultValue={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Calle Principal #123"
                  />
                </label>

                {/* Address Line 2 */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Apartamento, suite, etc. (opcional)</span>
                  <Input
                    type="text"
                    className="input input-bordered w-full"
                    defaultValue={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apto 4B"
                  />
                </label>

                {/* City & Province */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">Ciudad *</span>
                    <Input
                      type="text"
                      className="input input-bordered w-full"
                      defaultValue={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Santo Domingo"
                    />
                  </label>
                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">Provincia *</span>
                    <Input
                      type="text"
                      className="input input-bordered w-full"
                      defaultValue={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="Distrito Nacional"
                    />
                  </label>
                </div>

                {/* Postal Code & Country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">Código postal</span>
                    <Input
                      type="text"
                      className="input input-bordered w-full"
                      defaultValue={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10101"
                    />
                  </label>
                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">País</span>
                    <Input
                      type="text"
                      disabled
                      className="input input-bordered w-full"
                      defaultValue="República Dominicana"
                    />
                  </label>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-error/10 border border-error rounded-lg">
                  <p className="text-md text-error">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Button className="btn btn-ghost btn-sm" onClick={handleBack} disabled={loading}>
                  Atrás
                </Button>
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

export default function CompanyAddressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CompanyAddressContent />
    </Suspense>
  )
}
