import { isProductionEnvironment } from '@/lib/shared/constants';
import {
  getChatByIdAndToken,
  updateChatStatusById,
  updateCheckpointByChatId,
} from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UUID_REGEX, TOKEN_REGEX } from '@/lib/shared/validation';

export async function POST(request: Request) {
  try {
    const { chatId, token } = await request.json();

    if (!chatId || !token) {
      return NextResponse.json(
        { error: 'Missing chatId or token' },
        { status: 400 },
      );
    }

    if (!UUID_REGEX.test(chatId)) {
      return NextResponse.json(
        { error: 'Invalid chatId format' },
        { status: 400 },
      );
    }

    if (!TOKEN_REGEX.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 },
      );
    }
    const chat = await getChatByIdAndToken({ id: chatId, token });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const isExpired = new Date(chat.tokenExpiresAt) < new Date();
    if (chat.status === 'finished' || isExpired) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Set a secure cookie with the token for this specific chat
    const cookieStore = await cookies();
    cookieStore.set(`chat_token_${chatId}`, token, {
      httpOnly: true,
      secure: isProductionEnvironment,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 2, // 48 hours
      path: '/',
    });

    // update chat status to initialized if it's new
    if (chat.status === 'active') {
      await updateChatStatusById({ chatId, status: 'initialized' });
      await updateCheckpointByChatId({
        chatId,
        name: 'opened',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 },
    );
  }
}
