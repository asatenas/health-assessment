'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Building2 } from 'lucide-react';

interface ClinicInvitation {
  id: string;
  clinicName: string | null;
  role: string;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
}

interface ClinicInvitationDialogProps {
  invitations: ClinicInvitation[];
  currentClinicName: string | null;
  onAccept: (invitationId: string) => Promise<void>;
  onReject: (invitationId: string) => Promise<void>;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  clinician: 'Clínico',
  secretary: 'Secretária',
};

export function ClinicInvitationDialog({
  invitations,
  currentClinicName,
  onAccept,
  onReject,
}: ClinicInvitationDialogProps) {
  const [loading, setLoading] = useState<'accept' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentInvitation = invitations[currentIndex];

  const handleAccept = async () => {
    if (!currentInvitation) return;

    setError(null);
    setLoading('accept');

    try {
      await onAccept(currentInvitation.id);
      window.location.replace('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao aceitar convite',
      );
    }
  };

  const handleReject = async () => {
    if (!currentInvitation) return;

    setError(null);
    setLoading('reject');

    try {
      await onReject(currentInvitation.id);

      // Move to next invitation or close dialog
      if (currentIndex < invitations.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more invitations, dialog will close automatically
      }
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao recusar convite',
      );
    } finally {
      setLoading(null);
    }
  };

  if (invitations.length === 0 || !currentInvitation) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Convite para Nova Clínica
          </DialogTitle>
          <DialogDescription>
            Você recebeu um convite para se juntar a outra clínica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <p className="text-sm font-medium">Nova Clínica</p>
                <p className="text-lg font-semibold">
                  {currentInvitation.clinicName || 'Clínica sem nome'}
                </p>
              </div>
              <Badge variant="default" className="text-xs">
                {ROLE_LABELS[currentInvitation.role]}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Convidado por:{' '}
                <span className="font-medium">
                  {currentInvitation.invitedBy}
                </span>
              </p>
            </div>

            <Alert>
              <AlertTriangle className="size-4" />
              <AlertDescription>
                <p className="font-medium mb-2">Importante:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    Você será desconectado e precisará fazer login novamente
                  </li>
                  <li>
                    Você perderá acesso à sua clínica atual
                    {currentClinicName && (
                      <span className="font-medium">
                        {' '}
                        ({currentClinicName})
                      </span>
                    )}
                  </li>
                  <li>
                    Seus dados e avaliações permanecerão na clínica original
                  </li>
                  <li>
                    Você não poderá voltar automaticamente para a clínica
                    anterior
                  </li>
                  <li>
                    Seu novo perfil será:{' '}
                    <span className="font-medium">
                      {ROLE_LABELS[currentInvitation.role]}
                    </span>
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {invitations.length > 1 && (
            <p className="text-xs text-center text-muted-foreground">
              Convite {currentIndex + 1} de {invitations.length}
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReject}
            disabled={loading !== null}
            className="w-full sm:w-auto"
          >
            {loading === 'reject' ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Recusando...
              </>
            ) : (
              'Recusar'
            )}
          </Button>
          <Button
            type="button"
            onClick={handleAccept}
            disabled={loading !== null}
            className="w-full sm:w-auto"
          >
            {loading === 'accept' ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Aceitando...
              </>
            ) : (
              'Aceitar e Trocar de Clínica'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
