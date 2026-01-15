import { cookies } from 'next/headers';
import { getChatById } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import type { Chat } from '../db/schema';

export async function validateChatAccess(chatId: string): Promise<Chat> {
  if (!chatId) {
    throw new ChatSDKError('bad_request:api', 'Parameter chatId is required.');
  }

  const cookieStore = await cookies();
  const chatTokenCookie = cookieStore.get(`chat_token_${chatId}`);

  if (!chatTokenCookie) {
    throw new ChatSDKError('unauthorized:chat');
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    throw new ChatSDKError('not_found:chat');
  }

  if (chat.status === 'finished') {
    throw new ChatSDKError('not_found:chat');
  }

  if (chat.readOnly) {
    throw new ChatSDKError('not_found:chat');
  }

  if (chat.token !== chatTokenCookie.value) {
    throw new ChatSDKError('unauthorized:chat');
  }

  if (new Date() > chat.tokenExpiresAt) {
    throw new ChatSDKError('unauthorized:chat');
  }

  return chat;
}
