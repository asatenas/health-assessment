'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ClipboardList,
  RefreshCw,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { PermissionGate } from '@/components/auth/permission-gate';
import { usePermissions } from '@/hooks/use-permissions';

type DashboardHeaderProps = {
  clinicName: string;
  isCreating: boolean;
  isRefreshing: boolean;
  onCreateChat: () => void;
  onRefresh: () => void;
  onOpenHelp: () => void;
  onOpenConfigurations: () => void;
};

export function DashboardHeader({
  clinicName,
  isCreating,
  isRefreshing,
  onCreateChat,
  onRefresh,
  onOpenHelp,
  onOpenConfigurations,
}: DashboardHeaderProps) {
  const { hasPermission } = usePermissions();
  const canReadFull = hasPermission('assessments.read');

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
      <div>
        {clinicName === '' ? (
          <>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96 mt-2" />
          </>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold">{clinicName}</h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-1 sm:mt-2 text-sm sm:text-base">
              {canReadFull
                ? 'Visualize métricas e análises das avaliações pré-anestésicas'
                : 'Crie uma nova avaliação usando o botão à direita'}
            </p>
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
        <PermissionGate permission="assessments.create">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:hidden">
              {isCreating ? 'Criando...' : 'Criar nova avaliação'}
            </span>
            <Button
              onClick={onCreateChat}
              disabled={isCreating}
              size="sm"
              className="sm:px-3 px-3"
              aria-label={isCreating ? 'Criando avaliação' : 'Criar nova avaliação'}
            >
              <ClipboardList className="size-4" />
              <span className="hidden sm:inline sm:ml-2">
                {isCreating ? 'Criando...' : 'Criar nova avaliação'}
              </span>
            </Button>
          </div>
        </PermissionGate>
        <PermissionGate
          permissions={['assessments.read', 'assessments.read.summary']}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm sm:hidden">
              {isRefreshing ? 'Atualizando...' : 'Atualizar'}
            </span>
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="sm:px-3 px-3"
              aria-label={isRefreshing ? 'Atualizando dados' : 'Atualizar dados'}
            >
              <RefreshCw className="size-4" />
              <span className="hidden sm:inline sm:ml-2">
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </span>
            </Button>
          </div>
        </PermissionGate>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:hidden">Ajuda</span>
          <Button
            onClick={onOpenHelp}
            variant="outline"
            size="sm"
            className="sm:px-3 px-3"
            aria-label="Ajuda"
          >
            <HelpCircle className="size-4" />
            <span className="hidden sm:inline sm:ml-2">Ajuda</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:hidden">Configurações</span>
          <Button
            onClick={onOpenConfigurations}
            variant="outline"
            size="sm"
            className="sm:px-3 px-3"
            aria-label="Configurações"
          >
            <Settings className="size-4" />
            <span className="hidden sm:inline sm:ml-2">Configurações</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm sm:hidden">Sair</span>
          <Button
            onClick={() => signOut({ redirectTo: '/login' })}
            variant="secondary"
            size="sm"
            className="sm:px-3 px-3"
            aria-label="Sair"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline sm:ml-2">Sair</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
