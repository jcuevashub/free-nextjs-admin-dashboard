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
import Button from '@/components/ui/button/Button';

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
          ctaAction: () => router.push('/signin'),
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
          icon: '',
          iconClass: 'bg-info/10 text-info',
          borderClass: 'border-info',
          ctaText: 'Entendido',
          ctaAction: () => router.push('/signin'),
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
        <p className="text-md text-base-content/60">Onboarding Completo</p>
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

            <Button className="btn btn-primary" onClick={statusConfig.ctaAction}>
              {statusConfig.ctaText}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
