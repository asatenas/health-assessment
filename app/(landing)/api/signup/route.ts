import { NextResponse } from 'next/server';
import { createEarlyAccessSignup } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const variant = cookieStore.get('landing-variant')?.value || 'Unknown';

    await createEarlyAccessSignup({
      email,
      variant,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving early access signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
