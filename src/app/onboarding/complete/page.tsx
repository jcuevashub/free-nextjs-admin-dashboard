'use client';

/**
 * Complete Page - Step 10 of onboarding
 *
 * Displays comprehensive verification results and case status.
 * Shows all collected information, verification scores, and next steps.
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCaseAction, type GetCaseResult } from '@/app/actions/onboarding/get-case';

export default function OnboardingCompletePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<GetCaseResult['case'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCase() {
      try {
        const result = await getCaseAction();

        if (!result.success) {
          setError(result.error || 'Error al cargar caso');
          setLoading(false);
          return;
        }

        setCaseData(result.case || null);
        setLoading(false);
      } catch (err) {
        console.error('Error loading case:', err);
        setError('Error inesperado al cargar información');
        setLoading(false);
      }
    }

    loadCase();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-lg">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        </header>
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-error bg-base-100 shadow-sm p-6 md:p-8 space-y-4 text-center">
            <p className="text-error text-lg">{error || 'No se encontró información de onboarding'}</p>
            <button className="btn btn-primary" onClick={() => router.push('/onboarding')}>
              Ir a Onboarding
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Determine status UI
  const getStatusConfig = () => {
    switch (caseData.status) {
      case 'approved':
        return {
          title: '¡Felicidades! Tu cuenta ha sido aprobada',
          description: 'Tu solicitud fue aprobada. Ya puedes acceder a tu cuenta.',
          icon: '✓',
          iconClass: 'bg-success/10 text-success',
          borderClass: 'border-success',
          ctaText: 'Ir al Dashboard',
          ctaAction: () => router.push('/'),
        };
      case 'rejected':
        return {
          title: 'Solicitud no aprobada',
          description: caseData.adminNotes || 'Tu solicitud no pudo ser aprobada en este momento.',
          icon: '✗',
          iconClass: 'bg-error/10 text-error',
          borderClass: 'border-error',
          ctaText: 'Contactar Soporte',
          ctaAction: () => (window.location.href = 'mailto:business@hacksondev.com'),
        };
      case 'requires_update':
        return {
          title: 'Se requiere información adicional',
          description: caseData.adminNotes || 'Necesitamos que actualices algunos datos.',
          icon: '!',
          iconClass: 'bg-warning/10 text-warning',
          borderClass: 'border-warning',
          ctaText: 'Actualizar Información',
          ctaAction: () => router.push('/onboarding'),
        };
      case 'pending_review':
      case 'in_progress':
      default:
        return {
          title: 'Solicitud en revisión',
          description:
            'Recibimos tu información. Estamos verificando tus datos y te notificaremos por correo cuando tu cuenta esté lista.',
          icon: '⏳',
          iconClass: 'bg-info/10 text-info',
          borderClass: 'border-info',
          ctaText: 'Entendido',
          ctaAction: () => router.push('/'),
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Get fraud risk level
  const getFraudRiskLevel = () => {
    if (!caseData.socureFraudScore) return null;
    const score = caseData.socureFraudScore * 1000; // Convert to 0-1000 scale
    if (score <= 200) return { level: 'Bajo', color: 'text-success' };
    if (score <= 500) return { level: 'Medio', color: 'text-warning' };
    if (score <= 750) return { level: 'Alto', color: 'text-error' };
    return { level: 'Crítico', color: 'text-error font-bold' };
  };

  const fraudRisk = getFraudRiskLevel();

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <p className="text-sm text-base-content/60">Onboarding Completo</p>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-12 pt-8">
        <div className="w-full max-w-4xl space-y-6">
          {/* Status Card */}
          <div
            className={`rounded-2xl border ${statusConfig.borderClass} bg-base-100 shadow-sm p-6 md:p-8 space-y-4 text-center`}
          >
            <div
              className={`w-16 h-16 rounded-full ${statusConfig.iconClass} flex items-center justify-center text-3xl font-bold mx-auto`}
            >
              {statusConfig.icon}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">{statusConfig.title}</h1>
              <p className="text-base-content/70">{statusConfig.description}</p>
            </div>

            {/* Status badge */}
            <div className="flex justify-center">
              <span
                className={`badge ${
                  caseData.status === 'approved'
                    ? 'badge-success'
                    : caseData.status === 'rejected'
                    ? 'badge-error'
                    : caseData.status === 'requires_update'
                    ? 'badge-warning'
                    : 'badge-info'
                } badge-lg`}
              >
                Estado: {caseData.status}
              </span>
            </div>

            <button className="btn btn-primary" onClick={statusConfig.ctaAction}>
              {statusConfig.ctaText}
            </button>
          </div>

          {/* Company Information */}
          <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold">Información de la Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-base-content/60">Nombre legal</p>
                <p className="font-medium">{caseData.companyName || '-'}</p>
              </div>
              <div>
                <p className="text-base-content/60">RNC</p>
                <p className="font-medium">{caseData.rnc || '-'}</p>
              </div>
              <div>
                <p className="text-base-content/60">Teléfono</p>
                <p className="font-medium">{caseData.phone || '-'}</p>
              </div>
              <div>
                <p className="text-base-content/60">Industria</p>
                <p className="font-medium">{caseData.industry || '-'}</p>
              </div>
              <div>
                <p className="text-base-content/60">Dirección</p>
                <p className="font-medium">
                  {caseData.addressLine1 && caseData.city
                    ? `${caseData.addressLine1}, ${caseData.city}`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-base-content/60">Tipo de cuenta</p>
                <p className="font-medium">
                  {caseData.accountPreference === 'peso'
                    ? 'Pesos (DOP)'
                    : caseData.accountPreference === 'dolar'
                    ? 'Dólares (USD)'
                    : caseData.accountPreference === 'both'
                    ? 'Ambas (DOP + USD)'
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold">Propietario / UBO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-base-content/60">Nombre completo</p>
                <p className="font-medium">{caseData.ownerName || '-'}</p>
              </div>
              <div>
                <p className="text-base-content/60">Cédula</p>
                <p className="font-medium">{caseData.ownerId || '-'}</p>
              </div>
              <div>
                <p className="text-base-content/60">% de participación</p>
                <p className="font-medium">
                  {caseData.ownershipPct ? `${caseData.ownershipPct}%` : '-'}
                </p>
              </div>
              <div>
                <p className="text-base-content/60">Cargo</p>
                <p className="font-medium">{caseData.position || '-'}</p>
              </div>
            </div>
          </div>

          {/* Verification Results */}
          <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-semibold">Resultados de Verificación</h2>

            {/* Document verification */}
            <div className="p-4 bg-base-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Documentos verificados</p>
                  <p className="text-sm text-base-content/60">Verificación con Socure DocV</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {caseData.documentsVerified} / {caseData.documentsUploaded}
                  </p>
                  <p className="text-xs text-base-content/60">subidos</p>
                </div>
              </div>
            </div>

            {/* Liveness score */}
            {caseData.livenessScore !== null && (
              <div className="p-4 bg-base-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Score de Liveness</p>
                    <p className="text-sm text-base-content/60">Detección de persona real</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{(caseData.livenessScore * 100).toFixed(0)}%</p>
                    <p
                      className={`text-xs ${
                        caseData.livenessScore >= 0.9
                          ? 'text-success'
                          : caseData.livenessScore >= 0.7
                          ? 'text-warning'
                          : 'text-error'
                      }`}
                    >
                      {caseData.livenessScore >= 0.9
                        ? 'Excelente'
                        : caseData.livenessScore >= 0.7
                        ? 'Bueno'
                        : 'Dudoso'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fraud score */}
            {fraudRisk && (
              <div className="p-4 bg-base-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Riesgo de Fraude (Sigma)</p>
                    <p className="text-sm text-base-content/60">Score de 0-1000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {(caseData.socureFraudScore! * 1000).toFixed(0)}
                    </p>
                    <p className={`text-xs ${fraudRisk.color}`}>{fraudRisk.level}</p>
                  </div>
                </div>
              </div>
            )}

            {/* OFAC/PEP flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-4 rounded-lg ${caseData.ofacMatchFound ? 'bg-error/10' : 'bg-success/10'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {caseData.ofacMatchFound ? '⚠️' : '✓'}
                  </span>
                  <div>
                    <p className="font-medium">Listas OFAC</p>
                    <p className="text-xs text-base-content/60">
                      {caseData.ofacMatchFound ? 'Coincidencia encontrada' : 'Sin coincidencias'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${caseData.pepMatchFound ? 'bg-warning/10' : 'bg-success/10'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {caseData.pepMatchFound ? '⚠️' : '✓'}
                  </span>
                  <div>
                    <p className="font-medium">PEP</p>
                    <p className="text-xs text-base-content/60">
                      {caseData.pepMatchFound ? 'Persona políticamente expuesta' : 'Sin coincidencias'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline (if timestamps available) */}
          {(caseData.submittedAt || caseData.reviewedAt || caseData.completedAt) && (
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold">Línea de Tiempo</h2>
              <div className="space-y-2 text-sm">
                {caseData.submittedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <p>
                      <span className="font-medium">Enviado:</span>{' '}
                      {new Date(caseData.submittedAt).toLocaleString('es-DO')}
                    </p>
                  </div>
                )}
                {caseData.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-info"></div>
                    <p>
                      <span className="font-medium">Revisado:</span>{' '}
                      {new Date(caseData.reviewedAt).toLocaleString('es-DO')}
                    </p>
                  </div>
                )}
                {caseData.completedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <p>
                      <span className="font-medium">Completado:</span>{' '}
                      {new Date(caseData.completedAt).toLocaleString('es-DO')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
