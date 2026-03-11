'use client';

import { useSWRConfig } from 'swr';

export function useSurgeryStatusMutation() {
  const { mutate } = useSWRConfig();

  const updateSurgeryStatus = async (
    chatId: string,
    status: 'completed' | 'rescheduled' | 'cancelled',
  ) => {
    const response = await fetch(`/api/clinic/chats/${chatId}/surgery-details`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surgeryCompleted: status === 'completed',
        surgeryRescheduled: status === 'rescheduled',
        surgeryCancelled: status === 'cancelled',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update surgery status');
    }

    // Invalidate only metrics keys
    await mutate(
      (key: string) =>
        typeof key === 'string' && key.startsWith('/api/clinic/metrics'),
      undefined,
      { revalidate: true },
    );
  };

  return { updateSurgeryStatus };
}
