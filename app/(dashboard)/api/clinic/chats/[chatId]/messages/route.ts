import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { getMessagesByChatId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import { convertToUIMessages } from '@/lib/shared/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;

    await validateClinicAccess(chatId);

    const messagesFromDb = await getMessagesByChatId({ id: chatId });

    const uiMessages = convertToUIMessages(messagesFromDb);

    const conversationMessages = uiMessages.map((msg) => ({
      role: msg.role,
      text: msg.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(''),
      createdAt: msg.metadata?.createdAt,
    }));

    return Response.json({ messages: conversationMessages });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching messages:', error);
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 },
    );
  }
}
