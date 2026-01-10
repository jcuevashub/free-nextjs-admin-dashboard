'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Alert from '@/components/ui/alert/Alert';

export default function SessionExpiredAlert() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const sessionParam = searchParams.get('session');

    if (sessionParam === 'expired') {
      setShowAlert(true);

      // Clean URL after showing alert
      const newUrl = window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  if (!showAlert) return null;

  return (
    <div className="mb-6">
      <Alert
        variant="warning"
        title="Sesión expirada"
        message="Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente."
      />
    </div>
  );
}
