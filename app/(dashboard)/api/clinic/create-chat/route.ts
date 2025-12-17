import { auth } from '@/app/(auth)/auth';
import { isDevelopmentEnvironment } from '@/lib/shared/constants';
import { createChatWithToken, getUserById } from '@/lib/db/queries';
import { generateUUID } from '@/lib/shared/utils';
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';

/**
 * Generate a cryptographically secure random alphanumeric string
 * Uses A-Z and 0-9 (excludes lowercase for better readability)
 *
 * This implementation uses rejection sampling to avoid modulo bias,
 * ensuring truly uniform distribution across all characters.
 */
function generateAlphanumeric(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charsLength = chars.length;
  const maxValidValue = 256 - (256 % charsLength); // 252 for 36 chars

  let result = '';

  while (result.length < length) {
    // Generate more bytes than needed to account for rejections
    const bytes = randomBytes(length * 2);

    for (let i = 0; i < bytes.length && result.length < length; i++) {
      const byte = bytes[i];

      // Reject values >= maxValidValue to avoid modulo bias
      if (byte < maxValidValue) {
        result += chars[byte % charsLength];
      }
    }
  }

  return result;
}

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
  const token = `${generateAlphanumeric(4)}-${generateAlphanumeric(4)}`;

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
