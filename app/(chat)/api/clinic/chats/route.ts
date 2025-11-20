import { auth } from '@/app/(auth)/auth';
import { getChatsByClinicUserId, getUserById } from '@/lib/db/queries';
import { type NextRequest, NextResponse } from 'next/server';
import { CHAT_STATUSES, type ChatStatus } from '@/lib/db/chat-status';

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
  const statusParam = searchParams.get('status');
  const status =
    statusParam && (CHAT_STATUSES.includes(statusParam as ChatStatus) || statusParam === 'expired')
      ? statusParam
      : undefined;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  let page = Number.parseInt(searchParams.get('page') || '1', 10);
  let limit = Number.parseInt(searchParams.get('limit') || '20', 10);
  // Validate page and limit
  if (Number.isNaN(page) || page < 1) {
    page = 1;
  }
  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    limit = 20;
  }
  try {
    const result = await getChatsByClinicUserId({
      userId: session.user.id,
      status,
      dateFrom,
      dateTo,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 },
    );
  }
}
