'use client';

/**
 * Admin Logout Button
 *
 * Botón para cerrar sesión del panel administrativo.
 */

import { adminLogoutAction } from '@/app/actions/admin/admin-login';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await adminLogoutAction();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      className="btn btn-ghost btn-sm text-error"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? 'Cerrando...' : 'Cerrar Sesión'}
    </button>
  );
}
