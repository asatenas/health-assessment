import { auth } from '@/app/(auth)/auth';
import { getChatsByClinicUserId, getUserById } from '@/lib/db/queries';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserById({ id: session.user.id });

  if (!user?.emailVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || undefined;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  try {
    const chats = await getChatsByClinicUserId({
      userId: session.user.id,
      status: status as
        | 'active'
        | 'in_progress'
        | 'expired'
        | 'finished'
        | undefined,
      dateFrom,
      dateTo,
    });
    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 },
    );
  }
}
