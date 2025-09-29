'use client';

import useSWR from 'swr';

export function useChatReadonly({
  chatId,
  initialReadonly,
}: {
  chatId: string;
  initialReadonly: boolean;
}) {
  const { data: isReadonly, mutate: setReadonly } = useSWR(
    `${chatId}-readonly`,
    null,
    {
      fallbackData: initialReadonly,
    },
  );

  return { isReadonly, setReadonly };
}