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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Desativar Usuário</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja desativar {user.email}?
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
                <p className="font-medium mb-2">O usuário será desativado e:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Não poderá mais fazer login no sistema</li>
                  <li>
                    Todas as avaliações e cirurgias criadas permanecerão no
                    sistema
                  </li>
                  <li>Poderá ser reativado a qualquer momento</li>
                  <li>Seus dados não serão permanentemente excluídos</li>
                </ul>
              </AlertDescription>
            </Alert>

            <p className="text-sm text-muted-foreground">
              Esta é uma ação reversível. Você pode reativar este usuário
              posteriormente se necessário.
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
                  Desativando...
                </>
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
