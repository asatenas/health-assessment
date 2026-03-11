'use client';

import useSWR from 'swr';
import { fetcher } from './fetcher';
import { swrKeys } from './keys';

type MetricsParams = {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
};

export function useDashboardMetrics({
  period,
  dateFrom,
  dateTo,
  enabled = true,
}: MetricsParams = {}) {
  const key = enabled
    ? swrKeys.dashboardMetrics({ period, dateFrom, dateTo })
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(
    key,
    fetcher,
  );

  return {
    metrics: data?.metrics ?? null,
    timeline: data?.timeline ?? [],
    notifications: data?.notifications ?? [],
    todaysSurgeries: data?.todaysSurgeries ?? [],
    monthlySurgeries: data?.monthlySurgeries ?? {},
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
