import { auth } from '@/app/(auth)/auth';
import { isDevelopmentEnvironment } from '@/lib/constants';
import { createChatWithToken, getUserById } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserById({ id: session.user.id });

  if (!user?.emailVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chatId = generateUUID();
  const token = `${randomBytes(2).toString('hex').toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;

  try {
    await createChatWithToken({
      id: chatId,
      userId: session.user.id,
      token,
    });

    const APP_URL = isDevelopmentEnvironment
      ? `http://${process.env.APP_URL}`
      : `https://${process.env.APP_URL}`;

    return NextResponse.json({
      chatId,
      token,
      url: `${APP_URL}/chat/${chatId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 },
    );
  }
}
