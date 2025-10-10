import { auth } from '@/app/(auth)/auth';
import {
  getChatById,
  updateChatFormById,
  updateChatResultsById,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { form, results }: { form?: any; results?: string } =
    await request.json();
  const chatId = params.id;

  if (!chatId) {
    return new ChatSDKError(
      'bad_request:api',
      'Parameter chatId is required.',
    ).toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  if (form !== undefined) {
    await updateChatFormById({
      chatId,
      form,
    });
  }

  if (results !== undefined) {
    await updateChatResultsById({
      chatId,
      results,
    });
  }

  return new Response('Chat updated', { status: 200 });
}
