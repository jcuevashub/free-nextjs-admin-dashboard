'use client';

/**
 * Admin Login Page
 *
 * Página de login específica para el área administrativa.
 * Solo el usuario 'godlike' puede acceder.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLoginAction } from '@/app/actions/admin/admin-login';
import Input from '@/components/form/input/InputField';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await adminLoginAction({ username, password });

      if (!result.success) {
        setError(result.error || 'Credenciales inválidas');
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin/kyc-review');
      router.refresh();
    } catch (err) {
      console.error('Error en login admin:', err);
      setError('Error inesperado. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-base-300 bg-base-100 shadow-lg p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Admin Login
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Acceso restringido al panel administrativo
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <label className="form-control w-full">
              <span className="label-text text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario
              </span>
              <Input
                type="text"
                required
                className="input input-bordered w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contraseña
              </span>
              <Input
                type="password"
                required
                className="input input-bordered w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </label>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-sm text-error text-center">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-sm"></span>
                Verificando...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          {/* Back to home */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary"
              onClick={() => router.push('/')}
            >
              ← Volver al inicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
