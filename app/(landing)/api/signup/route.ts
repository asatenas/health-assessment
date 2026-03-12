import { NextResponse } from 'next/server';
import { createEarlyAccessSignup } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      throw new ChatSDKError('bad_request:api', 'Email is obrigatório');
    }

    const cookieStore = await cookies();
    const variant = cookieStore.get('landing-variant')?.value || 'Unknown';

    await createEarlyAccessSignup({ email, variant });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error saving early access signup:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to save early access signup',
    ).toResponse();
  }
}
