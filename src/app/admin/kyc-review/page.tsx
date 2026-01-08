'use client';

/**
 * KYC Review Dashboard - Main Page
 *
 * Lists all onboarding cases with status 'pending_review'.
 * Only accessible to admin users (role='owner').
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPendingCasesAction, type PendingCase } from '@/app/actions/kyc/get-pending-cases';

export default function KYCReviewPage() {
  const router = useRouter();
  const [cases, setCases] = useState<PendingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCases() {
      const result = await getPendingCasesAction();

      if (!result.success) {
        setError(result.error || 'Error al cargar casos');
        setLoading(false);
        return;
      }

      setCases(result.cases || []);
      setLoading(false);
    }

    loadCases();
  }, []);

  const getFraudRiskLevel = (score: number | null) => {
    if (!score) return { level: 'N/A', color: 'text-base-content/60' };
    const fraudScore = score * 1000;
    if (fraudScore <= 200) return { level: 'Bajo', color: 'text-success' };
    if (fraudScore <= 500) return { level: 'Medio', color: 'text-warning' };
    if (fraudScore <= 750) return { level: 'Alto', color: 'text-error' };
    return { level: 'Crítico', color: 'text-error font-bold' };
  };

  const getAccountTypeLabel = (preference: string | null) => {
    switch (preference) {
      case 'peso':
        return 'DOP';
      case 'dolar':
        return 'USD';
      case 'both':
        return 'DOP + USD';
      default:
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-lg">Cargando casos KYC...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Revisión KYC</h1>
            <p className="text-base-content/70 mt-1">
              Casos pendientes de aprobación ({cases.length})
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/')}>
            ← Dashboard
          </button>
        </div>

        {/* Cases list */}
        {cases.length === 0 ? (
          <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2">No hay casos pendientes</h2>
            <p className="text-base-content/60">
              Todos los casos de onboarding han sido revisados.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((c) => {
              const fraudRisk = getFraudRiskLevel(c.socureFraudScore);

              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                  onClick={() => router.push(`/admin/kyc-review/${c.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Main info */}
                    <div className="flex-1 space-y-3">
                      {/* Company name & RNC */}
                      <div>
                        <h3 className="text-xl font-semibold">{c.companyName || 'Sin nombre'}</h3>
                        <p className="text-sm text-base-content/60">
                          RNC: {c.rnc || 'N/A'} • {c.industry || 'Sin industria'}
                        </p>
                      </div>

                      {/* Owner info */}
                      <div className="text-sm">
                        <span className="font-medium">Propietario:</span> {c.ownerName || 'N/A'}
                        {c.ownerId && <span className="text-base-content/60"> • {c.ownerId}</span>}
                      </div>

                      {/* Verification scores */}
                      <div className="flex flex-wrap gap-3">
                        {/* Liveness */}
                        {c.livenessScore !== null && (
                          <div className="badge badge-outline">
                            Liveness: {(c.livenessScore * 100).toFixed(0)}%
                          </div>
                        )}

                        {/* Fraud score */}
                        {c.socureFraudScore !== null && (
                          <div className={`badge badge-outline ${fraudRisk.color}`}>
                            Fraude: {fraudRisk.level}
                          </div>
                        )}

                        {/* Documents */}
                        <div className="badge badge-outline">
                          Docs: {c.documentsVerified}/{c.documentsUploaded}
                        </div>

                        {/* Account type */}
                        <div className="badge badge-outline">
                          {getAccountTypeLabel(c.accountPreference)}
                        </div>
                      </div>

                      {/* Warning flags */}
                      <div className="flex gap-2">
                        {c.ofacMatchFound && (
                          <div className="badge badge-error badge-sm">OFAC Match</div>
                        )}
                        {c.pepMatchFound && (
                          <div className="badge badge-warning badge-sm">PEP</div>
                        )}
                      </div>

                      {/* Submitted date */}
                      {c.submittedAt && (
                        <p className="text-xs text-base-content/60">
                          Enviado: {new Date(c.submittedAt).toLocaleString('es-DO')}
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="flex-shrink-0">
                      <button className="btn btn-primary btn-sm">
                        Revisar →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats summary */}
        {cases.length > 0 && (
          <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
            <h3 className="font-semibold mb-3">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-base-content/60">Total pendientes</p>
                <p className="text-2xl font-bold">{cases.length}</p>
              </div>
              <div>
                <p className="text-base-content/60">Con OFAC match</p>
                <p className="text-2xl font-bold text-error">
                  {cases.filter((c) => c.ofacMatchFound).length}
                </p>
              </div>
              <div>
                <p className="text-base-content/60">PEP detectados</p>
                <p className="text-2xl font-bold text-warning">
                  {cases.filter((c) => c.pepMatchFound).length}
                </p>
              </div>
              <div>
                <p className="text-base-content/60">Fraude alto</p>
                <p className="text-2xl font-bold text-error">
                  {
                    cases.filter(
                      (c) => c.socureFraudScore && c.socureFraudScore * 1000 > 500
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
