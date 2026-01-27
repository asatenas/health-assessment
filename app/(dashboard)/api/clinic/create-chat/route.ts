import { isDevelopmentEnvironment } from '@/lib/shared/constants';
import { createChatWithToken } from '@/lib/db/queries';
import { generateUUID, sendWebhook } from '@/lib/shared/utils';
import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';

export async function POST() {
  const chatId = generateUUID();
  const token = `${generateAlphanumeric(4)}-${generateAlphanumeric(4)}`;

  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['assessments.create'],
    });

    await createChatWithToken({
      id: chatId,
      clinicId: user.clinicId,
      token,
    });

    await sendWebhook(
      'chat_created',
      process.env.INTERVIEW_CREATED_WEBHOOK_URL,
      {
        chatId,
        user: user.email,
      },
    );

    const APP_URL = isDevelopmentEnvironment
      ? `http://${process.env.APP_URL}`
      : `https://${process.env.APP_URL}`;

    return NextResponse.json({
      chatId,
      token,
      url: `${APP_URL}/chat/${chatId}`,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 },
    );
  }
}

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
