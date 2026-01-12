import type { DashboardConfiguration } from '@/lib/types/clinic-config';

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfiguration = {
  widgets: {
    metricsOverview: { enabled: true, position: 1 },
    riskDistribution: { enabled: true, position: 2 },
    timeline: { enabled: true, position: 3 },
    cancellations: { enabled: true, position: 4 },
    todaysSurgeries: { enabled: true, position: 5 },
    weeklySurgeries: { enabled: true, position: 6 },
    monthlySurgeries: { enabled: true, position: 7 },
    notifications: { enabled: true, position: 8 },
  },
};
