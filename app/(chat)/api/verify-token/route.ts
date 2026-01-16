import { isProductionEnvironment } from '@/lib/shared/constants';
import {
  updateChatStatusById,
  updateCheckpointByChatId,
} from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateChatAccess } from '@/lib/api/chat-guard';

export async function POST(request: Request) {
  try {
    const { chatId, token } = await request.json();

    const chat = await validateChatAccess(chatId, token);

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
