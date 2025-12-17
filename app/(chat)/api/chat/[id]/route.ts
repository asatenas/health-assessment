import { auth } from '@/app/(auth)/auth';
import {
  getChatById,
  updateChatFormById,
  updateChatResultsById,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await context.params;

  const {
    form,
    results,
    score_rcri,
    score_aub_has2,
  }: {
    form?: any;
    results?: string;
    score_rcri?: number;
    score_aub_has2?: number;
  } = await request.json();

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

  if (
    results !== undefined &&
    score_rcri !== undefined &&
    score_aub_has2 !== undefined
  ) {
    await updateChatResultsById({
      chatId,
      results,
      score_rcri,
      score_aub_has2,
    });
  }

  return new Response('Chat updated', { status: 200 });
}
