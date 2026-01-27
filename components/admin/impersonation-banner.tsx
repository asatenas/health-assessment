'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, LogOut } from 'lucide-react';

interface ImpersonationBannerProps {
  email: string;
  clinicName: string | null;
  onExit: () => void;
  exiting: boolean;
}

export function ImpersonationBanner({
  email,
  clinicName,
  onExit,
  exiting,
}: ImpersonationBannerProps) {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-yellow-500 text-yellow-950 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold">Modo de Personificação:</span>
            <span>
              {email}
              {clinicName && ` (${clinicName})`}
            </span>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={onExit}
          disabled={exiting}
          className="bg-yellow-950 text-yellow-50 hover:bg-yellow-900 shrink-0"
        >
          <LogOut className="size-4 mr-2" />
          {exiting ? 'Saindo...' : 'Sair da Personificação'}
        </Button>
      </div>
    </div>
  );
}
