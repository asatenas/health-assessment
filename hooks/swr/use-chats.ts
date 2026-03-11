'use client';

import useSWR from 'swr';
import { fetcher } from './fetcher';
import { swrKeys } from './keys';
import type { Chat } from '@/components/dashboard/chat-list-view/types';

type ChatsParams = {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  enabled?: boolean;
};

type ChatsResponse = {
  chats: Chat[];
  pagination: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
};

export function useChats({
  page = 1,
  limit = 20,
  status,
  dateFrom,
  dateTo,
  enabled = true,
}: ChatsParams = {}) {
  const key = enabled
    ? swrKeys.chats({ page, limit, status, dateFrom, dateTo })
    : null;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<ChatsResponse>(key, fetcher, { keepPreviousData: true });

  return {
    chats: data?.chats ?? [],
    totalPages: data?.pagination?.totalPages ?? 1,
    totalChats: data?.pagination?.total ?? 0,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
