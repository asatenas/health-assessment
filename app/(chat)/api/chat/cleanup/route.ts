import { cookies } from 'next/headers';
import {
  getChatById,
  deleteAssistantMessagesAfterLastUser,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const { chatId }: { chatId: string } = await request.json();

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

    // Delete assistant messages after the last user message
    await deleteAssistantMessagesAfterLastUser({ chatId });

    return new Response('Partial messages cleaned up', { status: 200 });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }

    console.error('Unhandled error in cleanup-partial API:', error);
    return new ChatSDKError('offline:chat').toResponse();
  }
}
