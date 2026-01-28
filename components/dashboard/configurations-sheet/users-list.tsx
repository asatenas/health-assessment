'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  UserCog,
  UserMinus,
  UserPlus,
  Trash2,
} from 'lucide-react';
import type { User } from '@/lib/db/schema';
import { useSession } from 'next-auth/react';
import { usePermissions } from '@/hooks/use-permissions';
import { ChangeRoleDialog } from './change-role-dialog';
import { RemoveUserDialog } from './remove-user-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UsersListProps {
  members: User[];
  onUpdate: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Admin',
  clinician: 'Clínico',
  secretary: 'Secretária',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  invited: 'Convidado',
  disabled: 'Desativado',
};

const ROLE_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  owner: 'default',
  admin: 'secondary',
  clinician: 'outline',
  secretary: 'outline',
};

const STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  active: 'default',
  invited: 'secondary',
  disabled: 'destructive',
};

export function UsersList({ members, onUpdate }: UsersListProps) {
  const { data: session } = useSession();
  const { hasPermission } = usePermissions();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showChangeRoleDialog, setShowChangeRoleDialog] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [permanentDelete, setPermanentDelete] = useState(false);

  const currentUserId = session?.user?.id;

  const canChangeRole = hasPermission('roles.assign');
  const canRemoveUser = hasPermission('users.remove');
  const canInvite = hasPermission('users.invite');

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setShowChangeRoleDialog(true);
  };

  const handleRemove = (user: User, permanent = false) => {
    setSelectedUser(user);
    setPermanentDelete(permanent);
    setShowRemoveDialog(true);
  };

  const handleReactivate = async (user: User) => {
    try {
      const response = await fetch(
        `/api/clinic/members/${user.id}/reactivate`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reactivate user');
      }

      onUpdate();
    } catch (error) {
      console.error('Error reactivating user:', error);
      alert(
        error instanceof Error ? error.message : 'Erro ao reativar usuário',
      );
    }
  };

  const canModifyUser = (user: User): boolean => {
    // Cannot modify yourself
    if (user.id === currentUserId) return false;

    // Admins cannot modify owners
    if (session?.user?.role === 'admin' && user.role === 'owner') {
      return false;
    }

    return true;
  };

  const getDisabledReason = (user: User): string | null => {
    if (user.id === currentUserId) {
      return 'Você não pode modificar a si mesmo';
    }
    if (session?.user?.role === 'admin' && user.role === 'owner') {
      return 'Apenas proprietários podem modificar outros proprietários';
    }
    return null;
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => {
              const isCurrentUser = member.id === currentUserId;
              const canModify = canModifyUser(member);
              const disabledReason = getDisabledReason(member);

              return (
                <TableRow
                  key={member.id}
                  className={isCurrentUser ? 'bg-muted/50' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {member.email}
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE_VARIANTS[member.role]}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[member.status]}>
                      {STATUS_LABELS[member.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isCurrentUser ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="cursor-not-allowed"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    ) : !canModify ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="cursor-not-allowed"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{disabledReason}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(member.status === 'active' ||
                            member.status === 'invited') && (
                            <>
                              {canChangeRole && (
                                <DropdownMenuItem
                                  onClick={() => handleChangeRole(member)}
                                >
                                  <UserCog className="size-4 mr-2" />
                                  Alterar Perfil
                                </DropdownMenuItem>
                              )}
                              {canRemoveUser && (
                                <DropdownMenuItem
                                  onClick={() => handleRemove(member)}
                                  className="text-destructive"
                                >
                                  {member.status === 'invited' ? (
                                    <>
                                      <Trash2 className="size-4 mr-2" />
                                      Deletar Convite
                                    </>
                                  ) : (
                                    <>
                                      <UserMinus className="size-4 mr-2" />
                                      Desativar
                                    </>
                                  )}
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                          {member.status === 'disabled' && (
                            <>
                              {canInvite && (
                                <DropdownMenuItem
                                  onClick={() => handleReactivate(member)}
                                >
                                  <UserPlus className="size-4 mr-2" />
                                  Reativar
                                </DropdownMenuItem>
                              )}
                              {canRemoveUser && (
                                <DropdownMenuItem
                                  onClick={() => handleRemove(member, true)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Deletar
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId;
          const canModify = canModifyUser(member);
          const disabledReason = getDisabledReason(member);

          return (
            <div
              key={member.id}
              className={`border rounded-lg p-4 space-y-3 ${
                isCurrentUser ? 'bg-muted/50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{member.email}</span>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">
                        Você
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ROLE_VARIANTS[member.role]}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                    <Badge variant={STATUS_VARIANTS[member.status]}>
                      {STATUS_LABELS[member.status]}
                    </Badge>
                  </div>
                </div>
                {isCurrentUser ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="cursor-not-allowed"
                  >
                    <MoreVertical className="size-4" />
                  </Button>
                ) : !canModify ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                          className="cursor-not-allowed"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{disabledReason}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(member.status === 'active' ||
                        member.status === 'invited') && (
                        <>
                          {canChangeRole && (
                            <DropdownMenuItem
                              onClick={() => handleChangeRole(member)}
                            >
                              <UserCog className="size-4 mr-2" />
                              Alterar Perfil
                            </DropdownMenuItem>
                          )}
                          {canRemoveUser && (
                            <DropdownMenuItem
                              onClick={() => handleRemove(member)}
                              className="text-destructive"
                            >
                              {member.status === 'invited' ? (
                                <>
                                  <Trash2 className="size-4 mr-2" />
                                  Deletar Convite
                                </>
                              ) : (
                                <>
                                  <UserMinus className="size-4 mr-2" />
                                  Desativar
                                </>
                              )}
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {member.status === 'disabled' && (
                        <>
                          {canInvite && (
                            <DropdownMenuItem
                              onClick={() => handleReactivate(member)}
                            >
                              <UserPlus className="size-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                          {canRemoveUser && (
                            <DropdownMenuItem
                              onClick={() => handleRemove(member, true)}
                              className="text-destructive"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialogs */}
      {selectedUser && (
        <>
          <ChangeRoleDialog
            open={showChangeRoleDialog}
            onOpenChange={setShowChangeRoleDialog}
            user={selectedUser}
            onSuccess={onUpdate}
          />
          <RemoveUserDialog
            open={showRemoveDialog}
            onOpenChange={setShowRemoveDialog}
            user={selectedUser}
            onSuccess={onUpdate}
            permanent={permanentDelete}
          />
        </>
      )}
    </>
  );
}
