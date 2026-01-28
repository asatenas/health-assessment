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
import { Loader2, Info } from 'lucide-react';
import type { User } from '@/lib/db/schema';

interface RemoveUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export function RemoveUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: RemoveUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/clinic/members/${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove user');
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error removing user:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao remover usuário',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onOpenChange(false);
  };

  const isInvited = user.status === 'invited';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isInvited ? 'Deletar Convite' : 'Desativar Usuário'}
          </DialogTitle>
          <DialogDescription>
            {isInvited
              ? `Tem certeza que deseja deletar o convite para ${user.email}?`
              : `Tem certeza que deseja desativar ${user.email}?`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                {isInvited ? (
                  <>
                    <p className="font-medium mb-2">
                      O convite será permanentemente deletado:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>O usuário não poderá mais aceitar este convite</li>
                      <li>Todos os dados do convite serão removidos</li>
                      <li>Você pode criar um novo convite se necessário</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="font-medium mb-2">
                      O usuário será desativado e:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Não poderá mais fazer login no sistema</li>
                      <li>
                        Todas as avaliações e cirurgias criadas permanecerão no
                        sistema
                      </li>
                      <li>Poderá ser reativado a qualquer momento</li>
                      <li>Seus dados não serão permanentemente excluídos</li>
                    </ul>
                  </>
                )}
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              {isInvited
                ? 'Esta ação não pode ser desfeita. O convite será permanentemente deletado.'
                : 'Esta é uma ação reversível. Você pode reativar este usuário posteriormente se necessário.'}
            </p>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {isInvited ? 'Deletando...' : 'Desativando...'}
                </>
              ) : isInvited ? (
                'Deletar Convite'
              ) : (
                'Desativar Usuário'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
