'use client';

import useSWR from 'swr';
import { fetcher } from './fetcher';
import { swrKeys } from './keys';

type ClinicInvitationsResponse = {
  invitations: any[];
};

export function useClinicInvitations() {
  const { data, error, isLoading, mutate } =
    useSWR<ClinicInvitationsResponse>(
      swrKeys.clinicInvitations(),
      fetcher,
      { revalidateOnFocus: false },
    );

  return {
    invitations: data?.invitations ?? [],
    isLoading,
    error,
    mutate,
  };
}
