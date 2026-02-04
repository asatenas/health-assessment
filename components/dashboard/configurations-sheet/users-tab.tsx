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
import type { User, ClinicInvitation } from '@/lib/db/schema';

// Combined type for members and pending invitations
type MemberOrInvitation =
  | (User & { type: 'user' })
  | (ClinicInvitation & { type: 'invitation'; status: 'invited' });

export function UsersTab() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<ClinicInvitation[]>([]);
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

      // Fetch both members and invitations in parallel
      const [membersResponse, invitationsResponse] = await Promise.all([
        fetch(`/api/clinic/members?${params}`),
        fetch('/api/clinic/invitations'),
      ]);

      if (!membersResponse.ok) throw new Error('Failed to fetch members');

      const membersData = await membersResponse.json();
      setMembers(membersData.members);
      setTotal(membersData.total);

      // Fetch invitations (only if not filtering by non-invited status)
      if (
        invitationsResponse.ok &&
        statusFilter !== 'active' &&
        statusFilter !== 'removed'
      ) {
        const invitationsData = await invitationsResponse.json();
        setInvitations(invitationsData.invitations || []);
      } else {
        setInvitations([]);
      }
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

  // Merge members and invitations for display
  const combinedList: MemberOrInvitation[] = [
    ...members.map((m) => ({ ...m, type: 'user' as const })),
    ...invitations.map((i) => ({
      ...i,
      type: 'invitation' as const,
      status: 'invited' as const,
    })),
  ];

  // Filter invitations by search and role if applicable
  const filteredList = combinedList.filter((item) => {
    if (
      search &&
      item.email &&
      !item.email.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (roleFilter !== 'all' && item.role !== roleFilter) {
      return false;
    }
    return true;
  });

  const totalWithInvitations = total + invitations.length;
  const totalPages = Math.ceil(totalWithInvitations / limit);

  // Collect all existing emails (members + invitations)
  const existingEmails = [
    ...members.map((m) => m.email),
    ...invitations.map((i) => i.email),
  ].filter((email): email is string => email !== null);

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
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Perfis</SelectItem>
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
              <UsersList members={filteredList} onUpdate={handleMemberUpdate} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({totalWithInvitations} total)
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
        existingEmails={existingEmails}
      />
    </Card>
  );
}
