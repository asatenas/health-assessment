'use client';

import { useState } from 'react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { BarChart3, List } from 'lucide-react';
import { PermissionGate } from '@/components/auth/permission-gate';
import { usePermissions } from '@/hooks/use-permissions';
import { ConfigurationsSheet } from '@/components/dashboard/configurations-sheet';
import { HelpModal } from '@/components/dashboard/help-modal';
import { ClinicInvitationDialog } from '@/components/dashboard/clinic-invitation-dialog';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { NewChatBanner } from '@/components/dashboard/new-chat-banner';
import { AnalyticsView } from '@/components/dashboard/analytics-view';
import { ChatListView } from '@/components/dashboard/chat-list-view';
import {
  useClinicConfig,
  useClinicInvitations,
  useCreateChat,
  useSurgeryStatusMutation,
} from '@/hooks/swr';
import { useDashboardFilters } from '@/hooks/use-dashboard-filters';
import { useSWRConfig } from 'swr';

export default function ClinicDashboard() {
  const { status: sessionStatus } = useSession();
  const { hasPermission, hasAnyPermission } = usePermissions();
  const canReadAssessments = hasAnyPermission([
    'assessments.read',
    'assessments.read.summary',
  ]);
  const canReadFull = hasPermission('assessments.read');

  const [isConfigurationsOpen, setIsConfigurationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { clinicName, dashboardConfig, mutate: mutateConfig } = useClinicConfig();
  const { invitations, mutate: mutateInvitations } = useClinicInvitations();
  const { createChat, isCreating, newChatData, clearNewChatData } = useCreateChat();
  const { updateSurgeryStatus } = useSurgeryStatusMutation();
  const { mutate } = useSWRConfig();

  const {
    view,
    setView,
    statusFilter,
    setStatusFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    currentPeriod,
    currentPage,
    setCurrentPage,
    handleFilterChange,
    clearFilters,
  } = useDashboardFilters();

  // Force list view for summary-only users
  if (canReadAssessments && !canReadFull && view === 'analytics') {
    setView('list');
  }

  const handleCreateChat = async () => {
    try {
      await createChat();
      toast({ type: 'success', description: 'Avaliação criada com sucesso!' });
    } catch {
      toast({ type: 'error', description: 'Falha ao criar avaliação' });
    }
  };

  const handleRefresh = () => {
    if (!canReadAssessments) return;
    clearNewChatData();
    mutate(
      (key: string) =>
        typeof key === 'string' &&
        (key.startsWith('/api/clinic/metrics') ||
          key.startsWith('/api/clinic/chats')),
      undefined,
      { revalidate: true },
    );
  };

  const handleSurgeryStatusUpdate = async (
    chatId: string,
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => {
    try {
      await updateSurgeryStatus(chatId, status);
      toast({ type: 'success', description: 'Status da cirurgia atualizado com sucesso!' });
    } catch {
      toast({ type: 'error', description: 'Falha ao atualizar status da cirurgia' });
      throw new Error('Failed to update surgery status');
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    const response = await fetch(
      `/api/user/clinic-invitations/${invitationId}/accept`,
      { method: 'POST' },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to accept invitation');
    }
    mutateInvitations();
  };

  const handleRejectInvitation = async (invitationId: string) => {
    const response = await fetch(
      `/api/user/clinic-invitations/${invitationId}/reject`,
      { method: 'POST' },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject invitation');
    }
    mutateInvitations();
  };

  if (sessionStatus === 'loading') {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6">
        <DashboardHeader
          clinicName={clinicName}
          isCreating={isCreating}
          isRefreshing={false}
          onCreateChat={handleCreateChat}
          onRefresh={handleRefresh}
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenConfigurations={() => setIsConfigurationsOpen(true)}
        />

        {/* View Toggle - Only show for users with read permissions */}
        <PermissionGate permission="assessments.read">
          <div className="mb-6">
            <div className="flex sm:inline-flex w-full sm:w-auto rounded-lg border bg-muted p-1">
              <Button
                variant={view === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('analytics')}
                className="gap-2 flex-1 sm:flex-none"
              >
                <BarChart3 className="size-4" />
                Dashboard
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="gap-2 flex-1 sm:flex-none"
              >
                <List className="size-4" />
                Lista de Avaliações
              </Button>
            </div>
          </div>
        </PermissionGate>

        {newChatData && (
          <NewChatBanner
            chatId={newChatData.chatId}
            token={newChatData.token}
            url={newChatData.url}
            onClose={clearNewChatData}
          />
        )}

        <PermissionGate permission="assessments.read">
          {view === 'analytics' && (
            <AnalyticsView
              period={currentPeriod}
              dateFrom={dateFromFilter || undefined}
              dateTo={dateToFilter || undefined}
              statusFilter={statusFilter}
              dashboardConfig={dashboardConfig}
              onFilterChange={handleFilterChange}
              onSurgeryStatusUpdate={handleSurgeryStatusUpdate}
            />
          )}
        </PermissionGate>

        <PermissionGate
          permissions={['assessments.read', 'assessments.read.summary']}
        >
          {view === 'list' && (
            <ChatListView
              currentPage={currentPage}
              statusFilter={statusFilter}
              dateFromFilter={dateFromFilter}
              dateToFilter={dateToFilter}
              onPageChange={setCurrentPage}
              onStatusFilterChange={setStatusFilter}
              onDateFromFilterChange={setDateFromFilter}
              onDateToFilterChange={setDateToFilter}
              onClearFilters={clearFilters}
              canReadFull={canReadFull}
            />
          )}
        </PermissionGate>
      </div>

      <ConfigurationsSheet
        open={isConfigurationsOpen}
        onOpenChange={setIsConfigurationsOpen}
        onSaved={() => mutateConfig()}
        initialClinicName={clinicName}
      />

      <HelpModal open={isHelpOpen} onOpenChange={setIsHelpOpen} />

      {invitations.length > 0 && (
        <ClinicInvitationDialog
          invitations={invitations}
          currentClinicName={clinicName}
          onAccept={handleAcceptInvitation}
          onReject={handleRejectInvitation}
        />
      )}
    </div>
  );
}
