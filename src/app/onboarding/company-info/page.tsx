'use client';

/**
 * Company Info Page - Step 3 of onboarding
 *
 * Collects company information and performs:
 * - RNC uniqueness validation
 * - OFAC/Sanctions screening for the company
 * - Saves data to onboarding_cases and creates company record
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { validateOnboardingAction } from '@/app/actions/onboarding/validate';
import { saveStepAction } from '@/app/actions/onboarding/save-step';
import { screenSanctionsAction } from '@/app/actions/onboarding/screen-sanctions';
import { companyInfoSchema } from '@/lib/validations/onboarding';
import { formatRnc } from '@/lib/utils';
import Input from '@/components/form/input/InputField';
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

function CompanyInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [companyName, setCompanyName] = useState(searchParams.get('companyName') ?? '');
  const [rnc, setRnc] = useState(searchParams.get('rnc') ?? '');
  const [phone, setPhone] = useState(searchParams.get('phone') ?? '');
  const [industry, setIndustry] = useState(searchParams.get('industry') ?? '');
  const [description, setDescription] = useState(searchParams.get('description') ?? '');
  const [website, setWebsite] = useState(searchParams.get('website') ?? '');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country] = useState('DO');

  const [loading, setLoading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sanctionsWarning, setSanctionsWarning] = useState<string | null>(null);

  const caseId = searchParams.get('caseId') || undefined;
  const accountPreference = searchParams.get('accountPreference') || 'peso';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSanctionsWarning(null);

    try {
      // Step 1: Validate form data with Zod
      const validation = companyInfoSchema.safeParse({
        companyName,
        rnc,
        phone,
        industry,
        description,
        website,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          province,
          postalCode: postalCode || undefined,
          country,
      });

      if (!validation.success) {
        const firstError = validation.error;
        setError(firstError.message);
        setLoading(false);
        return;
      }

      // Step 2: Validate RNC uniqueness
      const validateResult = await validateOnboardingAction({ rnc });

      if (!validateResult.success) {
        if (validateResult.conflicts?.rnc) {
          setError('Ya existe una empresa registrada con este RNC');
        } else {
          setError(validateResult.message || 'Error al validar RNC');
        }
        setLoading(false);
        return;
      }

      // Step 3: Save company info
      const saveResult = await saveStepAction({
        step: 'company_info',
        caseId,
        data: {
          companyName,
          rnc,
          phone,
          industry,
          description,
          website,
          country: 'DO',
          addressLine1,
          addressLine2,
          city,
          province,
          postalCode,
          accountPreference,
        },
      });

      if (!saveResult.success) {
        setError(saveResult.error || 'Error al guardar información');
        setLoading(false);
        return;
      }

      // Step 4: Screen company against OFAC/Sanctions lists
      setScreening(true);
      const screeningResult = await screenSanctionsAction({
        caseId: saveResult.caseId!,
        entityName: companyName,
        entityType: 'company',
        entityIdentifier: rnc,
      });

      if (!screeningResult.success) {
        console.error('Sanctions screening error:', screeningResult.error);
        // Don't fail the flow, just log and continue
      } else if (screeningResult.isOnSanctionsList) {
        // OFAC match - this should auto-reject
        setError('Esta empresa aparece en listas de sanciones internacionales y no puede ser aprobada.');
        setLoading(false);
        setScreening(false);
        return;
      } else if (screeningResult.isPEP) {
        // PEP found - show warning but allow to continue
        setSanctionsWarning('Se identificó como Persona Políticamente Expuesta (PEP). Tu solicitud será revisada manualmente.');
      }

      setScreening(false);

      // Step 5: Navigate to next step
      const params = new URLSearchParams(searchParams.toString());
      params.set('caseId', saveResult.caseId!);
      params.set('companyId', saveResult.companyId!);

      if (saveResult.companyId) params.set('companyId', saveResult.companyId);
      router.push(`/onboarding/ownership?${params.toString()}`);

    } catch (err) {
      console.error('Error in company-info:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
      setScreening(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <p className="text-xl text-base-content/60">Paso 1 de 6</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0 space-y-3">
            <p className="text-xl font-medium text-primary">1 / 6</p>
            <nav className="space-y-2 text-md">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`px-3 py-2 rounded-lg ${
                    idx === 0 ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/60'
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
                <h1 className="text-2xl font-semibold">Información de la empresa</h1>
                <p className="text-base-content/70">
                  Cuéntanos sobre tu empresa para iniciar la verificación.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Company Name */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Nombre legal *</span>
                  <Input
                    required
                    type="text"
                    className="input input-bordered w-full"
                    defaultValue={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Empresa SRL"
                  />
                </label>

                {/* RNC */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">RNC *</span>
                  <Input
                    required
                    type="text"
                    className="input input-bordered w-full"
                    value={rnc}
                    onChange={(e) => setRnc(formatRnc(e.target.value))}
                    placeholder="123-45678-9"
                    maxLength={13}
                  />
                  <span className="text-xs text-base-content/60 mt-1">
                    Formato: 9 o 11 dígitos (ej. 123-45678-9)
                  </span>
                </label>

                {/* Phone & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">Teléfono *</span>
                    <Input
                      required
                      type="tel"
                      className="input input-bordered w-full"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(809) 000-0000"
                    />
                  </label>

                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">Industria</span>
                    <Input
                      required
                      type="text"
                      className="input input-bordered w-full"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Tecnología, Retail..."
                    />
                  </label>
                </div>

                {/* Website */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Sitio web (opcional)</span>
                  <Input
                    type="url"
                    className="input input-bordered w-full"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://miempresa.com"
                  />
                </label>

                {/* Description */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Descripción</span>
                  <TextArea
                    className="w-full"
                    rows={3}
                    value={description}
                    onChange={(value) => setDescription(value)}
                    placeholder="Describe qué hace tu empresa..."
                  />
                </label>
              </div>
                          
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Dirección de la empresa</h1>
                <p className="text-base-content/70">Usaremos esta dirección para verificaciones y notificaciones.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Address Line 1 */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Dirección *</span>
                  <Input
                    required
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
                    required
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
                      required
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
                      required
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
                      required
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

              {/* Screening status */}
              {/* {screening && (
                <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="loading loading-spinner loading-sm text-info"></div>
                    <p className="text-md text-info">
                      Verificando contra listas de sanciones OFAC/PEP...
                    </p>
                  </div>
                </div>
              )} */}

              {/* Sanctions warning */}
              {sanctionsWarning && (
                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                  <p className="text-md text-warning">{sanctionsWarning}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 bg-error/10 border border-error rounded-lg">
                  <p className="text-md text-error">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div>
                </div>

                <Button
                  className="btn btn-primary"
                  disabled={loading || screening}
                >
                  {loading || screening ? 'Procesando...' : 'Siguiente'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function CompanyInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <CompanyInfoContent />
    </Suspense>
  )
}
