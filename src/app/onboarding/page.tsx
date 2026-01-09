'use client';

/**
 * Onboarding Index Page
 *
 * This page acts as a router that redirects users to the appropriate onboarding step
 * based on their current onboarding case status.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resumeOnboardingAction } from '@/app/actions/onboarding/resume-case';

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function determineRoute() {
      try {
        const result = await resumeOnboardingAction();

        if (!result.success) {
          router.push('/onboarding/company-info');
          return;
        }

        switch (result.status) {
          case 'approved':
            router.push('/');
            break;

          case 'rejected':
          case 'pending_review':
            router.push('/onboarding/complete');
            break;

          case 'requires_update':
          case 'in_progress':
          case 'draft':
            const nextStep = result.nextStep || 'start';
            router.push(`/onboarding/${nextStep}`);
            break;

          default:
            router.push('/onboarding/company-info');
        }
      } catch (err) {
        console.error('Error determining onboarding route:', err);
        setError('Error al determinar el paso de onboarding');
        setTimeout(() => {
          router.push('/onboarding/company-info');
        }, 2000);
      }
    }

    determineRoute();
  }, [router]);

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <div className="space-y-3">
            <p className="text-error text-lg">{error}</p>
            <p className="text-sm text-base-content/60">Redirigiendo al inicio...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="text-lg">Cargando onboarding...</p>
          </div>
        )}
      </div>
    </div>
  );
}
