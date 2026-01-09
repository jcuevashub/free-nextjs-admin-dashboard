'use client';

/**
 * Ownership Page - Step 5 of onboarding
 *
 * Collects owner/UBO information and performs:
 * - OFAC/PEP screening for the representative
 * - Saves ownership data
 * - Redirects to identity verification (selfie + liveness)
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { saveStepAction } from '@/app/actions/onboarding/save-step';
import { screenSanctionsAction } from '@/app/actions/onboarding/screen-sanctions';
import { ownershipSchema } from '@/lib/validations/onboarding';
import { formatCedula, formatRnc } from '@/lib/utils';
import Input from '@/components/form/input/InputField';
import Checkbox from '@/components/form/input/Checkbox';
import Button from '@/components/ui/button/Button';

const steps = [
  'Crear cuenta',
  'Información de la empresa',
  'Propietarios',
  'Documentos de la empresa',
  'Actividad esperada',
  'Seguimiento'
];


function OwnershipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [ownerName, setOwnerName] = useState(searchParams.get('ownerName') ?? '');
  const [ownerId, setOwnerId] = useState(searchParams.get('ownerId') ?? '');
  const [ownershipPct, setOwnershipPct] = useState(searchParams.get('ownershipPct') ?? '25');
  const [pep, setPep] = useState(searchParams.get('pep') === 'true');
  const [dateOfBirth, setDateOfBirth] = useState(searchParams.get('dateOfBirth') ?? '');
  const [position, setPosition] = useState(searchParams.get('position') ?? 'Director');

  const [loading, setLoading] = useState(false);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sanctionsWarning, setSanctionsWarning] = useState<string | null>(null);

  const caseId = searchParams.get('caseId') || undefined;
  const companyId = searchParams.get('companyId') || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSanctionsWarning(null);

    try {
      // Step 1: Validate form data with Zod
      const validation = ownershipSchema.safeParse({
        ownerName,
        ownerId: ownerId.replaceAll('-', ''),
        ownershipPct: parseFloat(ownershipPct),
        pep,
        dateOfBirth: dateOfBirth || undefined,
        position: position || undefined,
      });

      if (!validation.success) {
        const firstError = validation.error;
        setError(firstError.message);
        setLoading(false);
        return;
      }

      // Step 2: Save ownership data
      const saveResult = await saveStepAction({
        step: 'ownership',
        caseId,
        data: {
          ownerName,
          ownerId,
          ownershipPct: parseFloat(ownershipPct),
          pep,
          dateOfBirth,
          position,
        },
      });

      if (!saveResult.success) {
        setError(saveResult.error || 'Error al guardar información');
        setLoading(false);
        return;
      }

      // Step 3: Screen owner against OFAC/PEP lists
      setScreening(true);
      const screeningResult = await screenSanctionsAction({
        caseId: saveResult.caseId!,
        entityName: ownerName,
        entityType: 'individual',
        entityIdentifier: ownerId,
        dateOfBirth: dateOfBirth || undefined,
      });

      if (!screeningResult.success) {
        console.error('Sanctions screening error:', screeningResult.error);
        // Don't fail the flow, just log and continue
      } else if (screeningResult.isOnSanctionsList) {
        // OFAC match - this should auto-reject
        setError(
          'Esta persona aparece en listas de sanciones internacionales y no puede ser aprobada.'
        );
        setLoading(false);
        setScreening(false);
        return;
      } else if (screeningResult.isPEP || pep) {
        // PEP found - show warning but allow to continue
        setSanctionsWarning(
          'Se identificó como Persona Políticamente Expuesta (PEP). Tu solicitud será revisada manualmente.'
        );
      }

      setScreening(false);

      const params = new URLSearchParams(searchParams.toString());
      params.set('caseId', saveResult.caseId!);
      params.set('companyId', companyId!);

      router.push(`/onboarding/documents?${params.toString()}`);
    } catch (err) {
      console.error('Error in ownership:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
      setScreening(false);
    }
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`/onboarding/company-address?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <p className="text-xl text-base-content/60">Paso 2 de 6</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
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

          {/* Main Form */}
          <section className="flex-1">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 md:p-8 space-y-4"
            >
              <div className="space-y-1">
                <h1 className="text-2xl font-semibold">Propietario</h1>
                <p className="text-base-content/70">
                  Información del beneficiario final.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Owner Name */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Nombre completo *</span>
                  <Input
                    type="text"
                    className="input input-bordered w-full"
                    defaultValue={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Juan Pérez Rodríguez"
                  />
                </label>

                {/* Cédula */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Cédula *</span>
                  <Input
                    required
                    type="text"
                    className="input input-bordered w-full"
                    maxLength={13}
                    value={ownerId}
                    onChange={(e) => setOwnerId(formatCedula(e.target.value))}
                    placeholder="001-1234567-8"
                  />
                  <span className="text-xs text-base-content/60 mt-1">
                    Formato: 11 dígitos (ej. 001-1234567-8)
                  </span>
                </label>

                {/* Date of Birth & Ownership % */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">Fecha de nacimiento</span>
                    <Input
                      type="date"
                      className="input input-bordered w-full"
                      defaultValue={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </label>

                  <label className="form-control w-full">
                    <span className="label-text text-md font-medium">% de participación *</span>
                    <Input
                      type="number"
                      min="0"
                      maxLength={3}
                      className="input input-bordered w-full"
                      defaultValue={ownershipPct}
                      onChange={(e) => setOwnershipPct(e.target.value)}
                      placeholder="25"
                    />
                  </label>
                </div>

                {/* Position */}
                <label className="form-control w-full">
                  <span className="label-text text-md font-medium">Cargo</span>
                  <Input
                    type="text"
                    className="input input-bordered w-full"
                    defaultValue={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Director, Presidente, etc."
                  />
                </label>

                {/* PEP Checkbox */}
                <label className="flex items-start gap-3 p-4 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200/50">
                  <Checkbox
                    checked={pep}
                    onChange={(checked) => setPep(checked)}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-md">
                      Es Persona Políticamente Expuesta (PEP)?
                    </span>
                    <p className="text-xs text-base-content/60 mt-1">
                      Funcionario público, familiar o asociado cercano de un funcionario
                    </p>
                  </div>
                </label>
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

              {/* Info box */}
              {/* <div className="p-4  bg-info/10 border border-info/30 rounded-lg">
                <p className="text-md text-base-content/80 mb-10">
                    Documento de identidad oficial del propietario
                  <DropzoneComponent />
                </p>
              </div> */}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleBack}
                  disabled={loading || screening}
                >
                  Atrás
                </button>

                <Button
                  className="btn btn-primary"
                  disabled={loading || screening}
                >
                  {loading || screening ? 'Procesando...' : 'Continuar'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default function OwnershipPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <OwnershipContent />
    </Suspense>
  )
}
