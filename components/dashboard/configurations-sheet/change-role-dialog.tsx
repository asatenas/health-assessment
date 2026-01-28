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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { User } from '@/lib/db/schema';
import { useSession } from 'next-auth/react';

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  clinician: 'Clínico',
  secretary: 'Secretária',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner:
    'Acesso completo ao sistema. Pode gerenciar todos os usuários, incluindo outros proprietários, e configurar a clínica.',
  admin:
    'Pode gerenciar usuários (exceto proprietários), criar e visualizar avaliações completas, e acessar todas as métricas do dashboard.',
  clinician:
    'Pode criar e visualizar avaliações completas de pacientes e registrar detalhes de cirurgias.',
  secretary:
    'Pode criar novas avaliações e visualizar lista resumida de avaliações (sem acesso a detalhes clínicos completos).',
};

export function ChangeRoleDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: ChangeRoleDialogProps) {
  const { data: session } = useSession();
  const [newRole, setNewRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/clinic/members/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change role');
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error changing role:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao alterar perfil',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNewRole(user.role);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Alterar Perfil do Usuário</DialogTitle>
          <DialogDescription>
            Altere o perfil de {user.email}. Esta ação entrará em vigor
            imediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Perfil Atual</Label>
              <div className="text-sm font-medium text-muted-foreground">
                {ROLE_LABELS[user.role]}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newRole">Novo Perfil *</Label>
              <Select
                value={newRole}
                onValueChange={(value) =>
                  setNewRole(
                    value as 'owner' | 'admin' | 'clinician' | 'secretary',
                  )
                }
                disabled={loading}
              >
                <SelectTrigger id="newRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {!isAdmin && (
                    <SelectItem value="owner">{ROLE_LABELS.owner}</SelectItem>
                  )}
                  <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
                  <SelectItem value="clinician">
                    {ROLE_LABELS.clinician}
                  </SelectItem>
                  <SelectItem value="secretary">
                    {ROLE_LABELS.secretary}
                  </SelectItem>
                </SelectContent>
              </Select>
              {newRole && (
                <p className="text-xs text-muted-foreground">
                  {ROLE_DESCRIPTIONS[newRole]}
                </p>
              )}
            </div>

            {newRole === 'owner' && user.role !== 'owner' && (
              <Alert>
                <AlertTriangle className="size-4" />
                <AlertDescription>
                  Atenção: Promover um usuário a proprietário dará a ele acesso
                  completo ao sistema, incluindo a capacidade de gerenciar todos
                  os outros usuários.
                </AlertDescription>
              </Alert>
            )}

            {user.role === 'owner' && newRole !== 'owner' && (
              <Alert>
                <AlertTriangle className="size-4" />
                <AlertDescription>
                  Atenção: Rebaixar um proprietário removerá suas permissões
                  completas de gerenciamento. Certifique-se de que há pelo menos
                  um outro proprietário ativo na clínica.
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertDescription>
                Esta ação entrará em vigor imediatamente e afetará o acesso do
                usuário ao sistema.
              </AlertDescription>
            </Alert>
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
            <Button type="submit" disabled={loading || newRole === user.role}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Alterando...
                </>
              ) : (
                'Alterar Perfil'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
