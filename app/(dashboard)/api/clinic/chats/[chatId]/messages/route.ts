import { auth } from '@/app/(auth)/auth';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import { convertToUIMessages } from '@/lib/shared/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await auth();

  if (!session || !session.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  try {
    const { chatId } = await params;

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return new ChatSDKError('not_found:chat').toResponse();
    }

    if (chat.userId !== session.user.id) {
      return new ChatSDKError('forbidden:chat').toResponse();
    }

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
    console.error('Error fetching messages:', error);
    return Response.json(
      { error: 'Failed to fetch messages' },
      { status: 500 },
    );
  }
}
