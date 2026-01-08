'use client';

/**
 * KYC Case Detail Page
 *
 * Displays complete information about a single onboarding case.
 * Allows admin to approve, reject, or request updates.
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCaseDetailAction, type CaseDetail } from '@/app/actions/kyc/get-case-detail';
import { approveCaseAction } from '@/app/actions/kyc/approve-case';
import { rejectCaseAction } from '@/app/actions/kyc/reject-case';

export default function KYCCaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'update' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCase() {
      const result = await getCaseDetailAction(caseId);

      if (!result.success) {
        setError(result.error || 'Error al cargar caso');
        setLoading(false);
        return;
      }

      setCaseDetail(result.case || null);
      setLoading(false);
    }

    loadCase();
  }, [caseId]);

  const handleApprove = async () => {
    if (!caseDetail) return;

    setActionLoading(true);
    setActionError(null);

    const result = await approveCaseAction({
      caseId: caseDetail.id,
      adminNotes: actionNotes || undefined,
    });

    if (!result.success) {
      setActionError(result.error || 'Error al aprobar caso');
      setActionLoading(false);
      return;
    }

    // Success - redirect to KYC dashboard
    alert(`Caso aprobado exitosamente. ${result.accountsCreated} cuentas creadas.`);
    router.push('/admin/kyc-review');
  };

  const handleReject = async (requiresUpdate: boolean = false) => {
    if (!caseDetail) return;

    if (!actionNotes || actionNotes.trim().length < 10) {
      setActionError('Debes proporcionar una razón detallada (mínimo 10 caracteres)');
      return;
    }

    setActionLoading(true);
    setActionError(null);

    const result = await rejectCaseAction({
      caseId: caseDetail.id,
      reason: actionNotes,
      requiresUpdate,
    });

    if (!result.success) {
      setActionError(result.error || 'Error al rechazar caso');
      setActionLoading(false);
      return;
    }

    // Success - redirect to KYC dashboard
    alert(
      requiresUpdate
        ? 'Caso marcado como "requiere actualización"'
        : 'Caso rechazado exitosamente'
    );
    router.push('/admin/kyc-review');
  };

  const getFraudRiskLevel = (score: number | null) => {
    if (!score) return { level: 'N/A', color: 'text-base-content/60' };
    const fraudScore = score * 1000;
    if (fraudScore <= 200) return { level: 'Bajo', color: 'text-success' };
    if (fraudScore <= 500) return { level: 'Medio', color: 'text-warning' };
    if (fraudScore <= 750) return { level: 'Alto', color: 'text-error' };
    return { level: 'Crítico', color: 'text-error font-bold' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="text-lg">Cargando caso...</p>
        </div>
      </div>
    );
  }

  if (error || !caseDetail) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-lg">{error || 'Caso no encontrado'}</p>
            <button className="btn btn-ghost btn-sm mt-4" onClick={() => router.push('/admin/kyc-review')}>
              ← Volver a KYC Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  const companyData = caseDetail.companyData || {};
  const addressData = caseDetail.addressData || {};
  const ownershipData = caseDetail.ownershipData || {};
  const expectedActivityData = caseDetail.expectedActivityData || {};
  const followUpData = caseDetail.followUpData || {};
  const fraudRisk = getFraudRiskLevel(caseDetail.socureFraudScore);

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              className="btn btn-ghost btn-sm mb-2"
              onClick={() => router.push('/admin/kyc-review')}
            >
              ← Volver a lista
            </button>
            <h1 className="text-3xl font-bold">{companyData.companyName || 'Caso KYC'}</h1>
            <p className="text-base-content/70 mt-1">
              Caso ID: {caseDetail.id.substring(0, 8)}... • RNC: {companyData.rnc || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`badge ${
                caseDetail.status === 'pending_review'
                  ? 'badge-warning'
                  : caseDetail.status === 'approved'
                  ? 'badge-success'
                  : 'badge-error'
              } badge-lg`}
            >
              {caseDetail.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Información de la Empresa</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-base-content/60">Nombre legal</p>
                  <p className="font-medium">{companyData.companyName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">RNC</p>
                  <p className="font-medium">{companyData.rnc || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">Teléfono</p>
                  <p className="font-medium">{companyData.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">Industria</p>
                  <p className="font-medium">{companyData.industry || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-base-content/60">Sitio web</p>
                  <p className="font-medium">{companyData.website || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-base-content/60">Descripción</p>
                  <p className="font-medium">{companyData.description || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Dirección</h2>
              <div className="text-sm space-y-2">
                <p>{addressData.addressLine1 || 'N/A'}</p>
                {addressData.addressLine2 && <p>{addressData.addressLine2}</p>}
                <p>
                  {addressData.city || 'N/A'}, {addressData.province || 'N/A'}
                </p>
                {addressData.postalCode && <p>Código postal: {addressData.postalCode}</p>}
              </div>
            </div>

            {/* Owner/UBO */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Propietario / UBO</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-base-content/60">Nombre completo</p>
                  <p className="font-medium">{ownershipData.ownerName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">Cédula</p>
                  <p className="font-medium">{ownershipData.ownerId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">% de participación</p>
                  <p className="font-medium">
                    {ownershipData.ownershipPct ? `${ownershipData.ownershipPct}%` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-base-content/60">Cargo</p>
                  <p className="font-medium">{ownershipData.position || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">PEP</p>
                  <p className="font-medium">{ownershipData.pep ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </div>

            {/* Expected Activity */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Actividad Esperada</h2>
              <div className="text-sm space-y-3">
                <div>
                  <p className="text-base-content/60">Volumen mensual estimado</p>
                  <p className="font-medium">{expectedActivityData.monthlyVolume || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">Países con los que opera</p>
                  <p className="font-medium">{expectedActivityData.countries || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-base-content/60">Origen de fondos</p>
                  <p className="font-medium">{expectedActivityData.fundingSource || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {followUpData.additionalInfo && (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Notas Adicionales</h2>
                <p className="text-sm">{followUpData.additionalInfo}</p>
              </div>
            )}

            {/* Documents */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Documentos ({caseDetail.documents.length})
              </h2>
              <div className="space-y-3">
                {caseDetail.documents.length === 0 ? (
                  <p className="text-sm text-base-content/60">No hay documentos subidos</p>
                ) : (
                  caseDetail.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-base-300 rounded-lg p-4 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{doc.documentType}</p>
                          {doc.socureVerificationStatus && (
                            <span
                              className={`badge badge-sm ${
                                doc.socureVerificationStatus === 'verified'
                                  ? 'badge-success'
                                  : doc.socureVerificationStatus === 'rejected'
                                  ? 'badge-error'
                                  : 'badge-warning'
                              }`}
                            >
                              {doc.socureVerificationStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-base-content/60 mt-1">{doc.fileName}</p>
                        {doc.extractionConfidence !== null && (
                          <p className="text-xs text-base-content/60 mt-1">
                            Confianza: {(doc.extractionConfidence * 100).toFixed(0)}%
                          </p>
                        )}
                      </div>
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          Ver
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sanctions Screenings */}
            {caseDetail.sanctionsScreenings.length > 0 && (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Screening de Sanciones ({caseDetail.sanctionsScreenings.length})
                </h2>
                <div className="space-y-3">
                  {caseDetail.sanctionsScreenings.map((screening) => (
                    <div key={screening.id} className="border border-base-300 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{screening.entityName}</p>
                          <p className="text-xs text-base-content/60">
                            {screening.entityType === 'company' ? 'Empresa' : 'Persona'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {screening.ofacMatch && (
                            <span className="badge badge-error badge-sm">OFAC</span>
                          )}
                          {screening.pepMatch && (
                            <span className="badge badge-warning badge-sm">PEP</span>
                          )}
                        </div>
                      </div>
                      {screening.riskScore !== null && (
                        <p className="text-xs text-base-content/60">
                          Risk score: {screening.riskScore}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Identity Verifications */}
            {caseDetail.identityVerifications.length > 0 && (
              <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Verificaciones de Identidad ({caseDetail.identityVerifications.length})
                </h2>
                <div className="space-y-3">
                  {caseDetail.identityVerifications.map((verification) => (
                    <div key={verification.id} className="border border-base-300 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-base-content/60">Decisión</p>
                          <p className="font-medium">
                            {verification.decision || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60">Liveness Score</p>
                          <p className="font-medium">
                            {verification.livenessScore !== null
                              ? `${(verification.livenessScore * 100).toFixed(0)}%`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60">Face Match</p>
                          <p className="font-medium">
                            {verification.faceMatchScore !== null
                              ? `${(verification.faceMatchScore * 100).toFixed(0)}%`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-base-content/60">Fraud Score</p>
                          <p className="font-medium">
                            {verification.fraudScore !== null
                              ? `${(verification.fraudScore * 1000).toFixed(0)}`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Verification summary & actions */}
          <div className="space-y-6">
            {/* Verification Summary */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold">Resumen de Verificación</h2>

              {/* Liveness */}
              {caseDetail.livenessScore !== null && (
                <div>
                  <p className="text-sm text-base-content/60">Liveness Score</p>
                  <p className="text-2xl font-bold">
                    {(caseDetail.livenessScore * 100).toFixed(0)}%
                  </p>
                  <p
                    className={`text-xs ${
                      caseDetail.livenessScore >= 0.9
                        ? 'text-success'
                        : caseDetail.livenessScore >= 0.7
                        ? 'text-warning'
                        : 'text-error'
                    }`}
                  >
                    {caseDetail.livenessScore >= 0.9
                      ? 'Excelente'
                      : caseDetail.livenessScore >= 0.7
                      ? 'Bueno'
                      : 'Dudoso'}
                  </p>
                </div>
              )}

              {/* Fraud */}
              {caseDetail.socureFraudScore !== null && (
                <div>
                  <p className="text-sm text-base-content/60">Fraud Score (Sigma)</p>
                  <p className="text-2xl font-bold">
                    {(caseDetail.socureFraudScore * 1000).toFixed(0)}
                  </p>
                  <p className={`text-xs ${fraudRisk.color}`}>{fraudRisk.level}</p>
                </div>
              )}

              {/* Documents */}
              <div>
                <p className="text-sm text-base-content/60">Documentos Verificados</p>
                <p className="text-2xl font-bold">
                  {caseDetail.documentsVerified} / {caseDetail.documentsUploaded}
                </p>
              </div>

              {/* OFAC/PEP */}
              <div className="space-y-2">
                <div
                  className={`p-3 rounded-lg ${
                    caseDetail.ofacMatchFound ? 'bg-error/10' : 'bg-success/10'
                  }`}
                >
                  <p className="text-sm font-medium">
                    {caseDetail.ofacMatchFound ? '⚠️ OFAC Match' : '✓ OFAC Clean'}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${
                    caseDetail.pepMatchFound ? 'bg-warning/10' : 'bg-success/10'
                  }`}
                >
                  <p className="text-sm font-medium">
                    {caseDetail.pepMatchFound ? '⚠️ PEP Detectado' : '✓ No PEP'}
                  </p>
                </div>
              </div>

              {/* Account preference */}
              <div>
                <p className="text-sm text-base-content/60">Tipo de cuenta</p>
                <p className="font-medium">
                  {caseDetail.accountPreference === 'peso'
                    ? 'Pesos (DOP)'
                    : caseDetail.accountPreference === 'dolar'
                    ? 'Dólares (USD)'
                    : caseDetail.accountPreference === 'both'
                    ? 'Ambas (DOP + USD)'
                    : 'N/A'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold">Acciones</h2>

              {!actionType ? (
                <div className="space-y-2">
                  <button
                    className="btn btn-success w-full"
                    onClick={() => setActionType('approve')}
                  >
                    Aprobar Caso
                  </button>
                  <button
                    className="btn btn-warning w-full"
                    onClick={() => setActionType('update')}
                  >
                    Solicitar Actualización
                  </button>
                  <button
                    className="btn btn-error w-full"
                    onClick={() => setActionType('reject')}
                  >
                    Rechazar Caso
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">
                      {actionType === 'approve'
                        ? 'Notas de aprobación (opcional)'
                        : 'Razón (requerido)'}
                    </p>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder={
                        actionType === 'approve'
                          ? 'Notas adicionales...'
                          : 'Explica la razón detalladamente...'
                      }
                    />
                  </div>

                  {actionError && (
                    <div className="p-3 bg-error/10 border border-error rounded-lg">
                      <p className="text-sm text-error">{actionError}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      className="btn btn-ghost flex-1"
                      onClick={() => {
                        setActionType(null);
                        setActionNotes('');
                        setActionError(null);
                      }}
                      disabled={actionLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      className={`btn flex-1 ${
                        actionType === 'approve'
                          ? 'btn-success'
                          : actionType === 'update'
                          ? 'btn-warning'
                          : 'btn-error'
                      }`}
                      onClick={() => {
                        if (actionType === 'approve') {
                          handleApprove();
                        } else if (actionType === 'update') {
                          handleReject(true);
                        } else {
                          handleReject(false);
                        }
                      }}
                      disabled={actionLoading}
                    >
                      {actionLoading
                        ? 'Procesando...'
                        : actionType === 'approve'
                        ? 'Confirmar Aprobación'
                        : actionType === 'update'
                        ? 'Solicitar Actualización'
                        : 'Confirmar Rechazo'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Línea de Tiempo</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">Creado</p>
                    <p className="text-xs text-base-content/60">
                      {new Date(caseDetail.createdAt).toLocaleString('es-DO')}
                    </p>
                  </div>
                </div>
                {caseDetail.submittedAt && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-info"></div>
                    <div>
                      <p className="font-medium">Enviado</p>
                      <p className="text-xs text-base-content/60">
                        {new Date(caseDetail.submittedAt).toLocaleString('es-DO')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
