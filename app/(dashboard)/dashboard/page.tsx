'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  List,
  ClipboardList,
  RefreshCw,
  Settings,
  LogOut,
} from 'lucide-react';
// Import new dashboard components
import { MetricsOverview } from '@/components/dashboard/metrics-overview';
import { RiskDistributionChart } from '@/components/dashboard/risk-distribution-chart';
import { TimelineChart } from '@/components/dashboard/timeline-chart';
import { CancellationsAndReschedulesChart } from '@/components/dashboard/cancellations-reschedules-chart';
import { TodaysSurgeriesPanel } from '@/components/dashboard/todays-surgeries-panel';
import { WeeklySurgeriesPanel } from '@/components/dashboard/weekly-surgeries-panel';
import { MonthlySurgeriesPanel } from '@/components/dashboard/monthly-surgeries-panel';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';
import type { DashboardConfiguration } from '@/lib/types/clinic-config';
import { DEFAULT_DASHBOARD_CONFIG } from '@/lib/config/default-dashboard-config';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { ExportButton } from '@/components/dashboard/export-button';
import { type Chat, ChatListView } from '@/components/dashboard/chat-list-view';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfigurationsSheet } from '@/components/dashboard/configurations-sheet';

type CreateChatResponse = {
  chatId: string;
  token: string;
  url: string;
};

type DashboardView = 'analytics' | 'list';

export default function ClinicDashboard() {
  const [view, setView] = useState<DashboardView>('analytics');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newChatData, setNewChatData] = useState<CreateChatResponse | null>(
    null,
  );
  const [clinicName, setClinicName] = useState<string>('Painel da Clínica');
  const [isLoadingClinicName, setIsLoadingClinicName] = useState(true);
  const [isConfigurationsOpen, setIsConfigurationsOpen] = useState(false);
  const [dashboardConfig, setDashboardConfig] =
    useState<DashboardConfiguration>(DEFAULT_DASHBOARD_CONFIG);

  // Dashboard metrics state
  const [metrics, setMetrics] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [todaysSurgeries, setTodaysSurgeries] = useState<any[]>([]);
  const [weeklySurgeries, setWeeklySurgeries] = useState<any[]>([]);
  const [thisMonthsSurgeries, setThisMonthsSurgeries] = useState<
    Record<string, any[]>
  >({});
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [currentPeriod, setCurrentPeriod] = useState<string>('30d');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChats, setTotalChats] = useState(0);
  const limit = 20;

  // Fetch clinic config for clinic name and dashboard config
  const fetchClinicConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/clinic/config');
      if (response.ok) {
        const data = await response.json();
        if (data.clinicName) {
          setClinicName(data.clinicName);
        }
        if (data.dashboardConfig) {
          setDashboardConfig(data.dashboardConfig);
        }
      }
    } catch (error) {
      console.error('Failed to fetch clinic config:', error);
    } finally {
      setIsLoadingClinicName(false);
    }
  }, []);

  useEffect(() => {
    fetchClinicConfig();
  }, [fetchClinicConfig]);

  // Fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    try {
      const params = new URLSearchParams();
      if (dateFromFilter) params.append('dateFrom', dateFromFilter);
      if (dateToFilter) params.append('dateTo', dateToFilter);
      if (currentPeriod) params.append('period', currentPeriod);

      const response = await fetch(`/api/clinic/metrics?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const data = await response.json();
      setMetrics(data.metrics);
      setTimeline(data.timeline);
      setNotifications(data.notifications);
      setTodaysSurgeries(data.todaysSurgeries || []);
      setThisMonthsSurgeries(data.thisWeeksSurgeries || {});

      // Fetch weekly surgeries separately
      const weeklySurgeriesResponse = await fetch(
        '/api/clinic/metrics/weekly-surgeries',
      );
      if (weeklySurgeriesResponse.ok) {
        const weeklySurgeriesData = await weeklySurgeriesResponse.json();
        setWeeklySurgeries(weeklySurgeriesData.surgeries || []);
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Falha ao carregar métricas do dashboard',
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [dateFromFilter, dateToFilter, currentPeriod]);

  // Fetch chats for list view
  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    setChats([]);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFromFilter) params.append('dateFrom', dateFromFilter);
      if (dateToFilter) params.append('dateTo', dateToFilter);
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());

      const url = `/api/clinic/chats${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Falha ao buscar avaliações');
      }

      const data = await response.json();
      setChats(data.chats);
      setTotalPages(data.pagination.totalPages);
      setTotalChats(data.pagination.total);
    } catch (error) {
      toast({
        type: 'error',
        description: 'Falha ao carregar avaliações',
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, dateFromFilter, dateToFilter, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFromFilter, dateToFilter]);

  // Fetch data based on current view (only after clinic config is loaded)
  useEffect(() => {
    if (!isLoadingClinicName) {
      if (view === 'analytics') {
        fetchDashboardMetrics();
      } else {
        fetchChats();
      }
    }
  }, [view, fetchDashboardMetrics, fetchChats, isLoadingClinicName]);

  const createNewChat = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/clinic/create-chat', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data: CreateChatResponse = await response.json();
      setNewChatData(data);

      toast({
        type: 'success',
        description: 'Avaliação criada com sucesso!',
      });

      // Refresh data
      if (view === 'analytics') {
        fetchDashboardMetrics();
      } else {
        fetchChats();
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Falha ao criar avaliação',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setNewChatData(null);
    try {
      if (view === 'analytics') {
        await fetchDashboardMetrics();
      } else {
        await fetchChats();
      }
      toast({
        type: 'success',
        description: 'Dados atualizados com sucesso!',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Falha ao atualizar dados',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = useCallback(() => {
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setCurrentPeriod('30d');
  }, []);

  const handleFilterChange = (
    period: string,
    dateFrom?: Date,
    dateTo?: Date,
  ) => {
    setCurrentPeriod(period);
    if (dateFrom) {
      setDateFromFilter(dateFrom.toISOString().split('T')[0]);
    }
    if (dateTo) {
      setDateToFilter(dateTo.toISOString().split('T')[0]);
    }
  };

  const handleSurgeryStatusUpdate = async (
    chatId: string,
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => {
    try {
      const response = await fetch(
        `/api/clinic/chats/${chatId}/surgery-details`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            surgeryCompleted: status === 'completed',
            surgeryRescheduled: status === 'rescheduled',
            surgeryCancelled: status === 'cancelled',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update surgery status');
      }

      toast({
        type: 'success',
        description: 'Status da cirurgia atualizado com sucesso!',
      });

      // Refresh metrics
      fetchDashboardMetrics();
    } catch (error) {
      toast({
        type: 'error',
        description: 'Falha ao atualizar status da cirurgia',
      });
      throw error;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        type: 'success',
        description: 'Copiado para a área de transferência!',
      });
    } catch (error) {
      toast({
        type: 'error',
        description:
          'Falha ao copiar para a área de transferência. Verifique as permissões do navegador.',
      });
    }
  };

  // Show loading state until clinic config is loaded
  if (isLoadingClinicName) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-background">
        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-5 w-96 mt-2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{clinicName}</h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-1 sm:mt-2 text-sm sm:text-base">
              {view === 'analytics'
                ? 'Visualize métricas e análises das avaliações pré-anestésicas'
                : 'Gerencie todos as avaliações dos pacientes'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              onClick={createNewChat}
              disabled={isCreating}
              size="sm"
              className="sm:px-3 px-3"
              aria-label={
                isCreating ? 'Criando avaliação' : 'Criar nova avaliação'
              }
            >
              <ClipboardList className="size-4" />
              <span className="hidden sm:inline sm:ml-2">
                {isCreating ? 'Criando...' : 'Criar nova avaliação'}
              </span>
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
              className="sm:px-3 px-3"
              aria-label={
                isRefreshing ? 'Atualizando dados' : 'Atualizar dados'
              }
            >
              <RefreshCw className="size-4" />
              <span className="hidden sm:inline sm:ml-2">
                {isRefreshing ? 'Atualizando...' : 'Atualizar'}
              </span>
            </Button>
            <Button
              onClick={() => setIsConfigurationsOpen(true)}
              variant="outline"
              size="sm"
              className="sm:px-3 px-3"
              aria-label="Configurações"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline sm:ml-2">Configurações</span>
            </Button>
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

        {/* View Toggle */}
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

        {/* New Chat Data Display */}
        {newChatData && (
          <div className="mb-8 p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Nova avaliação criada</h2>
              <button
                type="button"
                onClick={() => setNewChatData(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Fechar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ID da avaliação
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.chatId}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.chatId)}
                    variant="outline"
                    size="sm"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Token
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.token}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.token)}
                    variant="outline"
                    size="sm"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL do paciente
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.url}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.url)}
                    variant="outline"
                    size="sm"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {view === 'analytics' && (
          <div className="space-y-6">
            {/* Filters and Export */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="flex-1 w-full">
                <DashboardFilters onFilterChange={handleFilterChange} />
              </div>
              <ExportButton
                dateFrom={dateFromFilter ? new Date(dateFromFilter) : undefined}
                dateTo={dateToFilter ? new Date(dateToFilter) : undefined}
                status={statusFilter}
              />
            </div>

            {/* Metrics Overview */}
            {dashboardConfig.widgets.metricsOverview.enabled && (
              <MetricsOverview
                totalAssessments={metrics?.totalAssessments || 0}
                completionRate={metrics?.completionRate || 0}
                highRiskPatients={metrics?.riskDistribution?.high || 0}
                latexAllergies={metrics?.latexAllergies || 0}
                isLoading={isLoadingMetrics}
              />
            )}

            {/* Dynamic Charts Grid - Max 2 per row */}
            {isLoadingMetrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                <Skeleton className="h-[400px] w-full rounded-lg" />
                <Skeleton className="h-[400px] w-full rounded-lg" />
                <Skeleton className="h-[400px] w-full rounded-lg hidden sm:block" />
                <Skeleton className="h-[400px] w-full rounded-lg hidden sm:block" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardConfig.widgets.riskDistribution.enabled &&
                  metrics && (
                    <RiskDistributionChart
                      low={metrics.riskDistribution.low}
                      medium={metrics.riskDistribution.medium}
                      high={metrics.riskDistribution.high}
                      unknown={metrics.riskDistribution.unknown}
                    />
                  )}
                {dashboardConfig.widgets.timeline.enabled && (
                  <TimelineChart data={timeline} />
                )}
                {dashboardConfig.widgets.cancellations.enabled &&
                  metrics?.cancellationsAndReschedulesByReason && (
                    <CancellationsAndReschedulesChart
                      data={metrics.cancellationsAndReschedulesByReason}
                    />
                  )}
                {dashboardConfig.widgets.weeklySurgeries.enabled && (
                  <WeeklySurgeriesPanel
                    surgeries={weeklySurgeries}
                    onUpdateStatus={handleSurgeryStatusUpdate}
                  />
                )}
                {dashboardConfig.widgets.todaysSurgeries.enabled && (
                  <TodaysSurgeriesPanel
                    surgeries={todaysSurgeries}
                    onUpdateStatus={handleSurgeryStatusUpdate}
                  />
                )}
                {dashboardConfig.widgets.monthlySurgeries.enabled && (
                  <MonthlySurgeriesPanel
                    surgeriesByDay={thisMonthsSurgeries}
                    onUpdateStatus={handleSurgeryStatusUpdate}
                  />
                )}
                {dashboardConfig.widgets.notifications.enabled && (
                  <NotificationsPanel notifications={notifications} />
                )}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <ChatListView
            chats={chats}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalChats={totalChats}
            limit={limit}
            statusFilter={statusFilter}
            dateFromFilter={dateFromFilter}
            dateToFilter={dateToFilter}
            onPageChange={setCurrentPage}
            onStatusFilterChange={setStatusFilter}
            onDateFromFilterChange={setDateFromFilter}
            onDateToFilterChange={setDateToFilter}
            onClearFilters={clearFilters}
          />
        )}
      </div>

      {/* Configurations Sheet */}
      <ConfigurationsSheet
        open={isConfigurationsOpen}
        onOpenChange={setIsConfigurationsOpen}
        onSaved={fetchClinicConfig}
      />
    </div>
  );
}
