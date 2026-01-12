import { auth } from '@/app/(auth)/auth';
import { getChatWithSurgeryById } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { chatId } = await params;

    // Fetch the chat with surgery details
    const chat = await getChatWithSurgeryById({ id: chatId });

    if (!chat) {
      return Response.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Verify the chat belongs to the user
    if (chat.userId !== session.user.id) {
      return Response.json(
        { error: 'Forbidden - You do not own this chat' },
        { status: 403 },
      );
    }

    // Return the chat details
    return Response.json({
      id: chat.id,
      createdAt: chat.createdAt,
      status: chat.status,
      form: chat.form,
      results: chat.results,
      medications: chat.medications,
      score_rcri: chat.score_rcri,
      score_aub_has2: chat.score_aub_has2,
      surgery: chat.surgery,
    });
  } catch (error) {
    console.error('Error fetching chat details:', error);
    return Response.json(
      { error: 'Failed to fetch chat details' },
      { status: 500 },
    );
  }
}
