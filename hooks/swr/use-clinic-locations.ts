'use client';

import useSWR from 'swr';
import { fetcher } from './fetcher';
import type { SurgeryLocation } from '@/lib/db/schema';

type LocationsResponse = {
  locations: SurgeryLocation[];
};

export function useClinicLocations() {
  const { data, error, isLoading, mutate } = useSWR<LocationsResponse>(
    '/api/clinic/locations',
    fetcher,
    {
      dedupingInterval: 60_000,
      revalidateOnFocus: false,
    },
  );

  return {
    locations: data?.locations ?? [],
    isLoading,
    error,
    mutate,
  };
}
