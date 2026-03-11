'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';

type CreateChatResponse = {
  chatId: string;
  token: string;
  url: string;
};

export function useCreateChat() {
  const { mutate } = useSWRConfig();
  const [isCreating, setIsCreating] = useState(false);
  const [newChatData, setNewChatData] = useState<CreateChatResponse | null>(
    null,
  );

  const createChat = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/clinic/create-chat', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data: CreateChatResponse = await response.json();
      setNewChatData(data);

      // Invalidate both metrics and chats
      await Promise.all([
        mutate(
          (key: string) =>
            typeof key === 'string' && key.startsWith('/api/clinic/metrics'),
          undefined,
          { revalidate: true },
        ),
        mutate(
          (key: string) =>
            typeof key === 'string' && key.startsWith('/api/clinic/chats'),
          undefined,
          { revalidate: true },
        ),
      ]);

      return data;
    } finally {
      setIsCreating(false);
    }
  };

  const clearNewChatData = () => setNewChatData(null);

  return { createChat, isCreating, newChatData, clearNewChatData };
}
