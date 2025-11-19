import { auth } from '@/app/(auth)/auth';
import { getChatsByClinicUserId, getUserById } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserById({ id: session.user.id });

  if (!user?.emailVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chats = await getChatsByClinicUserId({ userId: session.user.id });
    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 },
    );
  }
}
