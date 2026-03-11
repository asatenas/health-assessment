'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricsOverview } from '@/components/dashboard/metrics-overview';
import { RiskDistributionChart } from '@/components/dashboard/risk-distribution-chart';
import { TimelineChart } from '@/components/dashboard/timeline-chart';
import { CancellationsAndReschedulesChart } from '@/components/dashboard/cancellations-reschedules-chart';
import { TodaysSurgeriesPanel } from '@/components/dashboard/todays-surgeries-panel';
import { WeeklySurgeriesPanel } from '@/components/dashboard/weekly-surgeries-panel';
import { MonthlySurgeriesPanel } from '@/components/dashboard/monthly-surgeries-panel';
import { NotificationsPanel } from '@/components/dashboard/notifications-panel';
import { SurgeryDetailsModal } from '@/components/dashboard/surgery-details-modal';
import { AssessmentDetailsModal } from '@/components/dashboard/assessment-details-modal';
import { DashboardFilters } from '@/components/dashboard/dashboard-filters';
import { ExportButton } from '@/components/dashboard/export-button';
import { PermissionGate } from '@/components/auth/permission-gate';
import { useDashboardMetrics, useWeeklySurgeries } from '@/hooks/swr';
import type { DashboardConfiguration } from '@/lib/types/clinic-config';

type AnalyticsViewProps = {
  period: string;
  dateFrom?: string;
  dateTo?: string;
  statusFilter: string;
  dashboardConfig: DashboardConfiguration;
  onFilterChange: (period: string, dateFrom?: Date, dateTo?: Date) => void;
  onSurgeryStatusUpdate: (
    chatId: string,
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => Promise<void>;
};

export function AnalyticsView({
  period,
  dateFrom,
  dateTo,
  statusFilter,
  dashboardConfig,
  onFilterChange,
  onSurgeryStatusUpdate,
}: AnalyticsViewProps) {
  const {
    metrics,
    timeline,
    notifications,
    todaysSurgeries,
    monthlySurgeries,
    isLoading: isLoadingMetrics,
  } = useDashboardMetrics({ period, dateFrom, dateTo });

  const { surgeries: weeklySurgeries } = useWeeklySurgeries();

  const [notificationAssessmentId, setNotificationAssessmentId] = useState<
    string | null
  >(null);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationAssessmentModalOpen, setNotificationAssessmentModalOpen] =
    useState(false);

  const handleNotificationClick = (chatId: string) => {
    setNotificationAssessmentId(chatId);
    setNotificationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters and Export - Admin/Owner only */}
      <PermissionGate permission="org.manage">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex-1 w-full">
            <DashboardFilters onFilterChange={onFilterChange} />
          </div>
          <ExportButton
            dateFrom={dateFrom ? new Date(dateFrom) : undefined}
            dateTo={dateTo ? new Date(dateTo) : undefined}
            status={statusFilter}
          />
        </div>
      </PermissionGate>

      {/* Metrics Overview - Admin/Owner only */}
      <PermissionGate permission="org.manage">
        {dashboardConfig.widgets.metricsOverview.enabled && (
          <MetricsOverview
            totalAssessments={metrics?.totalAssessments || 0}
            completionRate={metrics?.completionRate || 0}
            highRiskPatients={metrics?.riskDistribution?.high || 0}
            latexAllergies={metrics?.latexAllergies || 0}
            isLoading={isLoadingMetrics}
          />
        )}
      </PermissionGate>

      {/* Charts Grid */}
      {isLoadingMetrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg hidden sm:block" />
          <Skeleton className="h-[400px] w-full rounded-lg hidden sm:block" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PermissionGate permission="org.manage">
            {dashboardConfig.widgets.riskDistribution.enabled && metrics && (
              <RiskDistributionChart
                low={metrics.riskDistribution.low}
                medium={metrics.riskDistribution.medium}
                high={metrics.riskDistribution.high}
                unknown={metrics.riskDistribution.unknown}
              />
            )}
          </PermissionGate>
          <PermissionGate permission="org.manage">
            {dashboardConfig.widgets.timeline.enabled && (
              <TimelineChart data={timeline} />
            )}
          </PermissionGate>
          {dashboardConfig.widgets.weeklySurgeries.enabled && (
            <WeeklySurgeriesPanel
              surgeries={weeklySurgeries}
              onUpdateStatus={onSurgeryStatusUpdate}
            />
          )}
          {dashboardConfig.widgets.todaysSurgeries.enabled && (
            <TodaysSurgeriesPanel
              surgeries={todaysSurgeries}
              onUpdateStatus={onSurgeryStatusUpdate}
            />
          )}
          {dashboardConfig.widgets.monthlySurgeries.enabled && (
            <MonthlySurgeriesPanel
              surgeriesByDay={monthlySurgeries}
              onUpdateStatus={onSurgeryStatusUpdate}
            />
          )}
          {dashboardConfig.widgets.cancellations.enabled &&
            metrics?.cancellationsAndReschedulesByReason && (
              <CancellationsAndReschedulesChart
                data={metrics.cancellationsAndReschedulesByReason}
              />
            )}
          {dashboardConfig.widgets.notifications.enabled && (
            <NotificationsPanel
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
            />
          )}
        </div>
      )}

      <SurgeryDetailsModal
        assessmentId={notificationAssessmentId}
        open={notificationModalOpen}
        onOpenChange={(open) => {
          setNotificationModalOpen(open);
          if (!open) setNotificationAssessmentId(null);
        }}
        onViewAssessment={() => {
          setNotificationModalOpen(false);
          setNotificationAssessmentModalOpen(true);
        }}
      />

      <AssessmentDetailsModal
        assessmentId={notificationAssessmentId}
        open={notificationAssessmentModalOpen}
        onOpenChange={(open) => {
          setNotificationAssessmentModalOpen(open);
          if (!open) setNotificationAssessmentId(null);
        }}
        onViewSurgery={() => {
          setNotificationAssessmentModalOpen(false);
          setNotificationModalOpen(true);
        }}
      />
    </div>
  );
}
