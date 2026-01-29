'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  clinicName: string | null;
  role: string;
}

interface UserSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSelectionDialog({
  open,
  onOpenChange,
}: UserSelectionDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const limit = 50;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, page, searchQuery]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setConfirming(true);
  };

  const handleConfirmImpersonation = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: selectedUser.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to start impersonation');
      }

      const data = await response.json();

      // Update session with impersonation data
      await update({ impersonation: data.impersonation });

      // Force a full page reload to show impersonated user's data
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error starting impersonation:', error);
      alert('Erro ao iniciar personificação');
    }
  };

  const handleCancelConfirmation = () => {
    setSelectedUser(null);
    setConfirming(false);
  };

  if (confirming && selectedUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Personificação</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja personificar este usuário?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div>
                <span className="font-semibold">Email:</span>{' '}
                {selectedUser.email}
              </div>
              <div>
                <span className="font-semibold">Clínica:</span>{' '}
                {selectedUser.clinicName || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Perfil:</span>{' '}
                {selectedUser.role}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Você verá o sistema como este usuário. Um banner amarelo será
              exibido no topo da tela para indicar que você está em modo de
              personificação.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancelConfirmation}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmImpersonation}>
              Confirmar Personificação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Selecionar Usuário para Personificar</DialogTitle>
          <DialogDescription>
            Escolha um usuário ativo para visualizar o sistema como ele
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden flex-1 overflow-y-auto">
              <div className="bg-muted/50 px-4 py-3 grid grid-cols-12 gap-4 font-medium text-sm border-b">
                <div className="col-span-4">Email</div>
                <div className="col-span-3">Clínica</div>
                <div className="col-span-3">Perfil</div>
                <div className="col-span-2" />
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/50"
                  >
                    <div className="col-span-4 font-medium text-sm">
                      {user.email}
                    </div>
                    <div className="col-span-3 text-sm">
                      {user.clinicName || 'N/A'}
                    </div>
                    <div className="col-span-3 text-sm capitalize">
                      {user.role}
                    </div>
                    <div className="col-span-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectUser(user)}
                      >
                        Selecionar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * limit + 1} -{' '}
                {Math.min(page * limit, total)} de {total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || loading}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages || loading}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
