'use client';

import useSWR from 'swr';
import { fetcher } from './fetcher';
import { swrKeys } from './keys';

export function useWeeklySurgeries({ enabled = true }: { enabled?: boolean } = {}) {
  const { data, error, isLoading, mutate } = useSWR<{ surgeries: any[] }>(
    enabled ? swrKeys.weeklySurgeries() : null,
    fetcher,
  );

  return {
    surgeries: data?.surgeries ?? [],
    isLoading,
    error,
    mutate,
  };
}
