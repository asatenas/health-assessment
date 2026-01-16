import {
  deleteAssistantMessagesAfterLastUser,
  deleteSequentialAssistantMessages,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import { validateChatAccess } from '@/lib/api/chat-guard';

export async function POST(request: Request) {
  try {
    const { chatId, mode }: { chatId: string; mode?: 'all' | 'sequential' } =
      await request.json();

    await validateChatAccess(chatId);

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
