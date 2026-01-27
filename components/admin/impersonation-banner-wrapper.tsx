'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ImpersonationBanner } from './impersonation-banner';

export function ImpersonationBannerWrapper() {
  const { data: session, update } = useSession();
  const [exiting, setExiting] = useState(false);
  const router = useRouter();

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
        clinicName={session.clinic?.name || ''}
        onExit={handleExitImpersonation}
        exiting={exiting}
      />
      <div className="h-14" />
    </>
  );
}
