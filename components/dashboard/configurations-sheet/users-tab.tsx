'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus, Search } from 'lucide-react';
import { PermissionGate } from '@/components/auth/permission-gate';
import { UsersList } from './users-list';
import { InviteUserDialog } from './invite-user-dialog';
import type { User } from '@/lib/db/schema';

export function UsersTab() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchMembers();
  }, [page, search, statusFilter, roleFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (roleFilter !== 'all') params.append('role', roleFilter);

      const response = await fetch(`/api/clinic/members?${params}`);
      if (!response.ok) throw new Error('Failed to fetch members');

      const data = await response.json();
      setMembers(data.members);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteDialog(false);
    fetchMembers();
  };

  const handleMemberUpdate = () => {
    fetchMembers();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base">Gerenciar Usuários</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Convide, edite e remova usuários da sua clínica
            </p>
          </div>
          <PermissionGate permission="users.invite">
            <Button
              onClick={() => setShowInviteDialog(true)}
              className="w-full sm:w-auto"
            >
              <UserPlus className="size-4 mr-2" />
              Convidar Usuário
            </Button>
          </PermissionGate>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="invited">Convidado</SelectItem>
                <SelectItem value="disabled">Desativado</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Papéis</SelectItem>
                <SelectItem value="owner">Proprietário</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="clinician">Clínico</SelectItem>
                <SelectItem value="secretary">Secretária</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <UsersList members={members} onUpdate={handleMemberUpdate} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({total} usuários)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

      <InviteUserDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        onSuccess={handleInviteSuccess}
      />
    </Card>
  );
}
