'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ImpersonationBanner } from './impersonation-banner';

export function ImpersonationBannerWrapper() {
  const { data: session, update } = useSession();
  const [exiting, setExiting] = useState(false);
  const [clinicName, setClinicName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (session?.impersonation) {
      fetch('/api/clinic/config')
        .then((res) => res.json())
        .then((data) => setClinicName(data.clinicName))
        .catch((err) => console.error('Failed to fetch clinic name:', err));
    }
  }, [session?.impersonation]);

  if (!session?.impersonation) {
    return null;
  }

  const handleExitImpersonation = async () => {
    setExiting(true);
    try {
      const response = await fetch('/api/admin/exit-impersonation', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to exit impersonation');
      }

      // Update session to clear impersonation
      await update({ impersonation: null });

      // Force a full page reload to show admin's own data
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error exiting impersonation:', error);
      alert('Erro ao sair da personificação');
      setExiting(false);
    }
  };

  return (
    <>
      <ImpersonationBanner
        email={session.user.email || ''}
        clinicName={clinicName}
        onExit={handleExitImpersonation}
        exiting={exiting}
      />
      <div className="h-14" />
    </>
  );
}
