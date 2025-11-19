import { getChatByIdAndToken } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { chatId, token } = await request.json();

    if (!chatId || !token) {
      return NextResponse.json(
        { error: 'Missing chatId or token' },
        { status: 400 },
      );
    }

    const chat = await getChatByIdAndToken({ id: chatId, token });

    if (!chat || chat.status === 'finished' || chat.status === 'expired') {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Set a secure cookie with the token for this specific chat
    const cookieStore = await cookies();
    cookieStore.set(`chat_token_${chatId}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 },
    );
  }
}
