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

    // Validate chatId is a valid UUID (v4)
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4Regex.test(chatId)) {
      return NextResponse.json(
        { error: 'Invalid chatId format' },
        { status: 400 },
      );
    }

    // Validate token matches XX-XX pattern (uppercase letters/digits)
    const tokenRegex = /^[A-Z0-9]{2}-[A-Z0-9]{2}$/;
    if (!tokenRegex.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
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
