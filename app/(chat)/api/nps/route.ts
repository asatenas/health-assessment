import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import {
  updateChatNpsById,
  getChatById,
  updateCheckpointByChatId,
} from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId } = body;

    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const chatTokenCookie = cookieStore.get(`chat_token_${chatId}`);

    if (!chatTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (chat.token !== chatTokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (new Date() > chat.tokenExpiresAt) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!chat.readOnly) {
      return NextResponse.json(
        { error: 'Chat is in progress' },
        { status: 400 },
      );
    }

    const { score } = body;

    if (
      typeof score !== 'number' ||
      score < 0 ||
      score > 10 ||
      !Number.isInteger(score)
    ) {
      return NextResponse.json(
        { error: 'Score must be an integer between 0 and 10' },
        { status: 400 },
      );
    }

    await updateChatNpsById({ chatId, nps: score });

    await updateCheckpointByChatId({ chatId, name: 'nps' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('NPS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
