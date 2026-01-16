import { cookies } from 'next/headers';
import { getChatById } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import type { Chat } from '../db/schema';
import { UUID_REGEX, TOKEN_REGEX } from '@/lib/shared/validation';

export async function validateChatAccess(
  chatId: string,
  token?: string,
): Promise<Chat> {
  if (!chatId) {
    throw new ChatSDKError('bad_request:api', 'Parameter chatId is required.');
  }

  if (!UUID_REGEX.test(chatId)) {
    throw new ChatSDKError('unauthorized:chat');
  }

  let validatedToken: string | undefined;

  if (token) {
    validatedToken = token;
  } else {
    const cookieStore = await cookies();
    const chatTokenCookie = cookieStore.get(`chat_token_${chatId}`);
    validatedToken = chatTokenCookie?.value;

    if (!validatedToken) {
      throw new ChatSDKError('unauthorized:chat');
    }
  }

  if (!TOKEN_REGEX.test(validatedToken)) {
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

  if (chat.token !== validatedToken) {
    throw new ChatSDKError('unauthorized:chat');
  }

  if (new Date() > chat.tokenExpiresAt) {
    throw new ChatSDKError('unauthorized:chat');
  }

  return chat;
}
