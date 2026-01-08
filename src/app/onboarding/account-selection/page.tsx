'use client';

/**
 * Account Selection Page
 *
 * Step 2 of onboarding: User selects account type (peso, dólar, or both)
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { saveStepAction } from '@/app/actions/onboarding/save-step';
import type { AccountPreference } from '@/types/onboarding';

interface AccountOption {
  value: AccountPreference;
  title: string;
  description: string;
  icon: string;
}

const accountOptions: AccountOption[] = [
  {
    value: 'peso',
    title: 'Pesos (DOP)',
    description: 'Cuenta en moneda dominicana para operaciones locales',
    icon: 'RD$',
  },
  {
    value: 'dolar',
    title: 'Dólares (USD)',
    description: 'Cuenta en dólares estadounidenses para operaciones internacionales',
    icon: '$',
  },
  {
    value: 'both',
    title: 'Ambas',
    description: 'Cuenta dual DOP + USD para máxima flexibilidad',
    icon: 'RD$ + $',
  },
];

export default function AccountSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<AccountPreference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caseId = searchParams.get('caseId') || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selected) {
      setError('Por favor selecciona un tipo de cuenta');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await saveStepAction({
        step: 'account_selection',
        caseId,
        data: { accountPreference: selected },
      });

      if (!result.success) {
        setError(result.error || 'Error al guardar');
        setLoading(false);
        return;
      }

      // Navigate to next step with updated params
      const params = new URLSearchParams(searchParams.toString());
      params.set('caseId', result.caseId!);
      params.set('accountPreference', selected);
      router.push(`/onboarding/company-info?${params.toString()}`);
    } catch (err) {
      console.error('Error saving account selection:', err);
      setError('Error inesperado. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            ¿Qué tipo de cuenta necesitas?
          </h1>
          <p className="text-base-content/70">
            Selecciona la moneda en la que operarás. Puedes elegir ambas para mayor flexibilidad.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-base-100 rounded-2xl shadow-lg p-8">
          {/* Account Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {accountOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelected(option.value)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  selected === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
              >
                {/* Icon */}
                <div className="text-4xl font-bold text-primary mb-4">{option.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-base-content mb-2">
                  {option.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-base-content/70">{option.description}</p>

                {/* Check indicator */}
                {selected === option.value && (
                  <div className="mt-4 flex items-center text-primary text-sm font-medium">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Seleccionado
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg text-error text-sm">
              {error}
            </div>
          )}

          {/* Info box */}
          <div className="mb-6 p-4 bg-info/10 border border-info/30 rounded-lg">
            <p className="text-sm text-base-content/80">
              <strong>💡 Consejo:</strong> Si planeas recibir pagos internacionales, te
              recomendamos seleccionar "Ambas" para tener acceso a cuentas en pesos y dólares.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-ghost"
              disabled={loading}
            >
              Atrás
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selected || loading}
            >
              {loading ? 'Guardando...' : 'Continuar'}
            </button>
          </div>
        </form>

        {/* Progress indicator */}
        <div className="mt-6 text-center text-sm text-base-content/60">
          Paso 2 de 10
        </div>
      </div>
    </div>
  );
}
