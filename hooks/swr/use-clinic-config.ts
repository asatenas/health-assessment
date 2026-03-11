'use client';

import useSWR from 'swr';
import { fetcher } from './fetcher';
import { swrKeys } from './keys';
import type { DashboardConfiguration } from '@/lib/types/clinic-config';
import { DEFAULT_DASHBOARD_CONFIG } from '@/lib/config/default-dashboard-config';

type ClinicConfigResponse = {
  clinicName: string;
  dashboardConfig?: DashboardConfiguration;
};

export function useClinicConfig() {
  const { data, error, isLoading, mutate } = useSWR<ClinicConfigResponse>(
    swrKeys.clinicConfig(),
    fetcher,
    {
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
    },
  );

  return {
    clinicName: data?.clinicName ?? '',
    dashboardConfig: data?.dashboardConfig ?? DEFAULT_DASHBOARD_CONFIG,
    isLoading,
    error,
    mutate,
  };
}
