'use client';

/**
 * Start Page - Step 1 of onboarding
 *
 * Captures applicant name and initializes the onboarding case.
 * Creates a new onboarding_cases record with status 'draft'.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { saveStepAction } from '@/app/actions/onboarding/save-step';

export default function OnboardingStartPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Initialize onboarding case
      const result = await saveStepAction({
        step: 'start',
        data: {
          applicantFirstName: firstName,
          applicantLastName: lastName,
        },
      });

      if (!result.success) {
        setError(result.error || 'Error al iniciar onboarding');
        setLoading(false);
        return;
      }

      // Navigate to account selection with caseId
      const params = new URLSearchParams();
      params.set('caseId', result.caseId!);
      params.set('firstName', firstName);
      params.set('lastName', lastName);
      router.push(`/onboarding/account-selection?${params.toString()}`);
    } catch (err) {
      console.error('Error in start:', err);
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20" />
        <button
          type="button"
          className="text-sm font-medium text-base-content/70 hover:text-base-content"
          onClick={() => router.push('/panel/login')}
        >
          Iniciar sesión →
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl rounded-2xl border border-base-300 bg-base-100 shadow-sm p-6 md:p-8 space-y-6"
        >
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">Comienza tu aplicación</h1>
            <p className="text-gray-500 dark:text-gray-400">Tardarás menos de 10 minutos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="form-control w-full">
              <span className="label-text text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</span>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ana"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</span>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Pérez"
              />
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full md:w-auto px-6 text-primary-content"
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Comenzar solicitud'}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Al hacer clic en &quot;Comenzar solicitud&quot; aceptas los Términos y la Política de privacidad de Facil.do y consientes
            recibir comunicaciones electrónicas relacionadas a tu cuenta.
          </p>
        </form>
      </main>
    </div>
  );
}
