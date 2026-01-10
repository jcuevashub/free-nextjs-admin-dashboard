/**
 * Admin Layout
 *
 * Wraps all admin pages. The authentication is handled by middleware.
 */

'use client';

import { usePathname } from 'next/navigation';
import AdminLogoutButton from '@/components/admin/LogoutButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Si es la página de login, no mostrar el header
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Para otras páginas de admin, mostrar el header completo
  return (
    <div className="min-h-screen bg-base-200">
      {/* Header con opción de logout */}
      <header className="bg-base-100 border-b border-base-300 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <svg
                className="w-5 h-5 text-primary-content"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 dark:text-white/90">Admin Panel</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sesión: godlike</p>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
