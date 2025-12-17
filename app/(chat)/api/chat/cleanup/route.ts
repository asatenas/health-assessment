import { cookies } from 'next/headers';
import {
  getChatById,
  deleteAssistantMessagesAfterLastUser,
  deleteSequentialAssistantMessages,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function POST(request: Request) {
  try {
    const { chatId, mode }: { chatId: string; mode?: 'all' | 'sequential' } =
      await request.json();

    if (!chatId) {
      return new ChatSDKError(
        'bad_request:api',
        'Parameter chatId is required.',
      ).toResponse();
    }

    const cookieStore = await cookies();
    const chatTokenCookie = cookieStore.get(`chat_token_${chatId}`);

    if (!chatTokenCookie) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return new ChatSDKError('not_found:chat').toResponse();
    }

    if (chat.token !== chatTokenCookie.value) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    // Delete based on mode
    if (mode === 'sequential') {
      // Delete sequential assistant messages (keep the most recent one)
      await deleteSequentialAssistantMessages({ chatId });
    } else {
      // Default: delete all assistant messages after the last user message
      await deleteAssistantMessagesAfterLastUser({ chatId });
    }

    return new Response('Messages cleaned up', { status: 200 });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error('Unhandled error in cleanup API:', error);
    return new ChatSDKError('offline:chat').toResponse();
  }
}
