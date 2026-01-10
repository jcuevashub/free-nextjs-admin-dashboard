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
import { approveCaseAction } from '@/app/actions/kyc/approve-case';
import { rejectCaseAction } from '@/app/actions/kyc/reject-case';
import Button from '@/components/ui/button/Button';

export default function KYCReviewPage() {
  const router = useRouter();
  const [cases, setCases] = useState<PendingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingCaseId, setProcessingCaseId] = useState<string | null>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

  const handleQuickApprove = async (caseId: string) => {
    if (!confirm('¿Estás seguro de aprobar este caso?')) return;

    setProcessingCaseId(caseId);

    const result = await approveCaseAction({ caseId });

    if (!result.success) {
      alert(`Error al aprobar: ${result.error}`);
      setProcessingCaseId(null);
      return;
    }

    alert(`Caso aprobado exitosamente. ${result.accountsCreated} cuenta(s) creada(s).`);

    // Remover el caso de la lista
    setCases(cases.filter(c => c.id !== caseId));
    setProcessingCaseId(null);
  };

  const handleQuickReject = async () => {
    if (!selectedCaseId || !rejectReason || rejectReason.trim().length < 10) {
      alert('Debes proporcionar una razón detallada (mínimo 10 caracteres)');
      return;
    }

    setProcessingCaseId(selectedCaseId);

    const result = await rejectCaseAction({
      caseId: selectedCaseId,
      reason: rejectReason,
      requiresUpdate: false,
    });

    if (!result.success) {
      alert(`Error al rechazar: ${result.error}`);
      setProcessingCaseId(null);
      return;
    }

    alert('Caso rechazado exitosamente');

    // Remover el caso de la lista
    setCases(cases.filter(c => c.id !== selectedCaseId));
    setProcessingCaseId(null);
    setShowRejectModal(false);
    setSelectedCaseId(null);
    setRejectReason('');
  };

  const openRejectModal = (caseId: string) => {
    setSelectedCaseId(caseId);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-lg">Cargando casos KYC...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">Revisión KYC</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Casos pendientes de aprobación ({cases.length})
            </p>
          </div>
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
                  className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Main info */}
                    <div className="flex-1 space-y-3">
                      {/* Company name & RNC */}
                      <div>
                        <h3 className="text-xl font-semibold">{c.companyName || 'Sin nombre'}</h3>
                        <p className="text-md text-base-content/60">
                          RNC: {c.rnc || 'N/A'} • {c.industry || 'Sin industria'}
                        </p>
                      </div>

                      {/* Owner info */}
                      <div className="text-md">
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

                    {/* Action buttons */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      <Button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          // e.stopPropagation();
                          handleQuickApprove(c.id);
                        }}
                        disabled={processingCaseId === c.id}
                      >
                        {processingCaseId === c.id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          '✓ Aprobar'
                        )}
                      </Button>
                      <Button
                        className="btn btn-error btn-sm"
                        onClick={() => openRejectModal(c.id)}
                        disabled={processingCaseId === c.id}
                      >
                        ✗ Rechazar
                      </Button>
                      <Button
                        className="btn btn-ghost btn-sm"
                        onClick={() => router.push(`/admin/kyc-review/${c.id}`)}
                      >
                        Ver detalle →
                      </Button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-md">
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Rechazar Caso
              </h3>
              <p className="text-md text-gray-500 dark:text-gray-400">
                Proporciona una razón detallada para el rechazo (mínimo 10 caracteres).
              </p>

              <textarea
                className="textarea textarea-bordered w-full"
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explica la razón del rechazo..."
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  className="btn btn-ghost flex-1"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedCaseId(null);
                    setRejectReason('');
                  }}
                  disabled={processingCaseId !== null}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-error flex-1"
                  onClick={handleQuickReject}
                  disabled={processingCaseId !== null || rejectReason.trim().length < 10}
                >
                  {processingCaseId ? (
                    <span className="flex items-center gap-2">
                      <span className="loading loading-spinner loading-sm"></span>
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar Rechazo'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
