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
import { useState } from 'react';
import { saveStepAction } from '@/app/actions/onboarding/save-step';
import { screenSanctionsAction } from '@/app/actions/onboarding/screen-sanctions';
import { ownershipSchema } from '@/lib/validations/onboarding';
import { formatCedula } from '@/lib/utils';

const steps = [
  'Selección de cuenta',
  'Información de la empresa',
  'Dirección',
  'Propietarios',
  'Verificación de identidad',
  'Documentos',
];

export default function OwnershipPage() {
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
        ownerId,
        ownershipPct: parseFloat(ownershipPct),
        pep,
        dateOfBirth: dateOfBirth || undefined,
        position: position || undefined,
      });

      if (!validation.success) {
        const firstError = validation.error.errors[0];
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

      // Step 4: Navigate to identity verification (NEW - Socure ID+)
      const params = new URLSearchParams(searchParams.toString());
      params.set('caseId', saveResult.caseId!);
      params.set('ownerName', ownerName);
      params.set('nationalId', ownerId);
      params.set('dateOfBirth', dateOfBirth);
      params.set('firstName', ownerName.split(' ')[0] || '');
      params.set('lastName', ownerName.split(' ').slice(1).join(' ') || '');
      router.push(`/onboarding/identity-verification?${params.toString()}`);
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
        <p className="text-sm text-base-content/60">Paso 5 de 10</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0 space-y-3">
            <p className="text-sm font-medium text-primary">5 / 10</p>
            <nav className="space-y-2 text-sm">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`px-3 py-2 rounded-lg ${
                    idx === 3 ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/60'
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
                <h1 className="text-2xl font-semibold">Propietario / UBO</h1>
                <p className="text-base-content/70">
                  Información del beneficiario final (Ultimate Beneficial Owner).
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Owner Name */}
                <label className="form-control w-full">
                  <span className="label-text text-sm font-medium">Nombre completo *</span>
                  <input
                    type="text"
                    required
                    className="input input-bordered w-full"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Juan Pérez Rodríguez"
                  />
                </label>

                {/* Cédula */}
                <label className="form-control w-full">
                  <span className="label-text text-sm font-medium">Cédula *</span>
                  <input
                    type="text"
                    required
                    className="input input-bordered w-full"
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
                    <span className="label-text text-sm font-medium">Fecha de nacimiento</span>
                    <input
                      type="date"
                      className="input input-bordered w-full"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </label>

                  <label className="form-control w-full">
                    <span className="label-text text-sm font-medium">% de participación *</span>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      className="input input-bordered w-full"
                      value={ownershipPct}
                      onChange={(e) => setOwnershipPct(e.target.value)}
                      placeholder="25"
                    />
                  </label>
                </div>

                {/* Position */}
                <label className="form-control w-full">
                  <span className="label-text text-sm font-medium">Cargo</span>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Director, Presidente, etc."
                  />
                </label>

                {/* PEP Checkbox */}
                <label className="flex items-start gap-3 p-4 border border-base-300 rounded-lg cursor-pointer hover:bg-base-200/50">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mt-1"
                    checked={pep}
                    onChange={(e) => setPep(e.target.checked)}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-sm">
                      Es Persona Políticamente Expuesta (PEP)
                    </span>
                    <p className="text-xs text-base-content/60 mt-1">
                      Funcionario público, familiar o asociado cercano de un funcionario
                    </p>
                  </div>
                </label>
              </div>

              {/* Screening status */}
              {screening && (
                <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="loading loading-spinner loading-sm text-info"></div>
                    <p className="text-sm text-info">
                      Verificando contra listas de sanciones OFAC/PEP...
                    </p>
                  </div>
                </div>
              )}

              {/* Sanctions warning */}
              {sanctionsWarning && (
                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                  <p className="text-sm text-warning">{sanctionsWarning}</p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 bg-error/10 border border-error rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {/* Info box */}
              <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-sm text-base-content/80">
                  <strong>Siguiente paso:</strong> Tomarás una selfie para verificar tu identidad con
                  tecnología de detección de liveness.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleBack}
                  disabled={loading || screening}
                >
                  Atrás
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || screening}
                >
                  {loading || screening ? 'Procesando...' : 'Continuar a Verificación de Identidad'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
