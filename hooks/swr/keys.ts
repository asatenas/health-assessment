export const swrKeys = {
  clinicConfig: () => '/api/clinic/config',
  clinicInvitations: () => '/api/user/clinic-invitations',
  dashboardMetrics: (params: {
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const p = new URLSearchParams();
    if (params.period) p.append('period', params.period);
    if (params.dateFrom) p.append('dateFrom', params.dateFrom);
    if (params.dateTo) p.append('dateTo', params.dateTo);
    const qs = p.toString();
    return `/api/clinic/metrics${qs ? `?${qs}` : ''}`;
  },
  weeklySurgeries: () => '/api/clinic/metrics/weekly-surgeries',
  chats: (params: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const p = new URLSearchParams();
    if (params.page) p.append('page', params.page.toString());
    if (params.limit) p.append('limit', params.limit.toString());
    if (params.status) p.append('status', params.status);
    if (params.dateFrom) p.append('dateFrom', params.dateFrom);
    if (params.dateTo) p.append('dateTo', params.dateTo);
    const qs = p.toString();
    return `/api/clinic/chats${qs ? `?${qs}` : ''}`;
  },
};
