'use client';

/**
 * Welcome Page
 *
 * Primera página que ve el usuario después de que su onboarding es aprobado.
 * Muestra las cuentas creadas y próximos pasos recomendados.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabaseClient';
import { markWelcomeShownAction } from '@/app/actions/onboarding/mark-welcome-shown';
import Link from 'next/link';

interface Account {
  id: string;
  account_number: string;
  currency: 'DOP' | 'USD';
  balance: number;
  status: string;
}

interface CompanyInfo {
  company_name: string;
  rnc: string;
}

export default function WelcomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowser();

        // Get user and company info
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/signin');
          return;
        }

        // Get user profile with company info
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, company_id, companies(company_name, rnc)')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || 'Usuario');
          if (profile.companies) {
            setCompanyInfo({
              company_name: (profile.companies as any).company_name,
              rnc: (profile.companies as any).rnc,
            });
          }

          // Get accounts for this company
          if (profile.company_id) {
            const { data: accountsData } = await supabase
              .from('bank_accounts')
              .select('id, account_number, currency, balance, status')
              .eq('company_id', profile.company_id)
              .order('currency', { ascending: true });

            if (accountsData) {
              setAccounts(accountsData as Account[]);
            }
          }
        }

        // Mark welcome as shown
        await markWelcomeShownAction();

        setLoading(false);
      } catch (error) {
        console.error('Error loading welcome data:', error);
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleGoToDashboard = () => {
    router.push('/');
  };

  const handleStartTour = () => {
    // TODO: Implement tour in Phase 4
    // For now, just go to dashboard
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-brand-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header con animación de celebración */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/20">
              <span className="text-5xl">🎉</span>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            ¡Bienvenido a Fintech RD!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {userName.split(' ')[0]}, tu cuenta empresarial ha sido aprobada y está lista para usar.
          </p>
        </div>

        {/* Información de la empresa */}
        {companyInfo && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                  {companyInfo.company_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  RNC: <span className="font-mono font-semibold">{companyInfo.rnc}</span>
                </p>
              </div>
              <div className="badge badge-success badge-lg">
                Activa
              </div>
            </div>
          </div>
        )}

        {/* Cuentas creadas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Tus Cuentas Bancarias
          </h2>

          {accounts.length > 0 ? (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-brand-500 dark:hover:border-brand-400 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center">
                      <span className="text-2xl">
                        {account.currency === 'DOP' ? '💵' : '💰'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        Cuenta {account.currency === 'DOP' ? 'en Pesos Dominicanos' : 'en Dólares Americanos'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {account.account_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {account.currency === 'DOP' ? 'RD$' : '$'}
                      {account.balance.toLocaleString('es-DO', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-success-700 bg-success-100 dark:bg-success-900/20 dark:text-success-400 rounded-full">
                      {account.status === 'active' ? 'Activa' : account.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron cuentas. Contacta a soporte si esto es un error.
              </p>
            </div>
          )}
        </div>

        {/* Próximos pasos */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Próximos Pasos
          </h2>

          <div className="space-y-4">
            {/* Step 1 */}
            <Link href="/company-profile">
              <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    Completa tu perfil empresarial
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Agrega logo, información de contacto y preferencias de tu empresa
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Step 2 */}
            <Link href="/settings/team">
              <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    Invita a tu equipo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Agrega empleados y asigna roles (admin, contador, empleado)
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Step 3 */}
            <Link href="/settings/ncf">
              <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-2 border-warning-200 dark:border-warning-900/40">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning-500 text-white flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                      Configura NCF (DGII)
                    </h3>
                    <span className="badge badge-warning badge-sm">Requerido</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Obligatorio para facturación electrónica en República Dominicana
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Step 4 */}
            <Link href="/transfers/new">
              <div className="group flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 border-2 border-brand-200 dark:border-brand-800 hover:border-brand-400 dark:hover:border-brand-600 transition-colors cursor-pointer">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    Realiza tu primera transacción
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Prueba enviar una transferencia o crear tu primera factura
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-brand-500 group-hover:text-brand-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleStartTour}
            className="btn btn-outline btn-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hacer un tour guiado
          </button>
          <button
            onClick={handleGoToDashboard}
            className="btn btn-primary btn-lg"
          >
            Ir al dashboard
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Help section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            ¿Necesitas ayuda para comenzar?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a
              href="mailto:soporte@fintechrd.com"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              soporte@fintechrd.com
            </a>
            <span className="hidden sm:inline text-gray-400">•</span>
            <a
              href="tel:+18095553000"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +1 (809) 555-3000
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
