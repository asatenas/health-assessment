import { getChatsByClinicUserId } from '@/lib/db/queries';
import { type NextRequest, NextResponse } from 'next/server';
import { CHAT_STATUSES, type ChatStatus } from '@/lib/db/chat-status';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(request: NextRequest) {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['assessments.read', 'assessments.read.summary'],
      requireAll: false, // Accept any of these permissions
    });

    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');

    const status =
      statusParam &&
      (CHAT_STATUSES.includes(statusParam as ChatStatus) ||
        statusParam === 'expired')
        ? (statusParam as ChatStatus | 'expired')
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

    const result = await getChatsByClinicUserId({
      clinicId: user.clinicId,
      status,
      dateFrom,
      dateTo,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 },
    );
  }
}
