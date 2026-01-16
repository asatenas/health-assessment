import { validateChatAccess } from '@/lib/api/chat-guard';
import { updateChatFormById, updateChatResultsById } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: chatId } = await context.params;

    await validateChatAccess(chatId);

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
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.log('Error updating chat', error);
    return new Response('Failed to update chat', { status: 500 });
  }
}
