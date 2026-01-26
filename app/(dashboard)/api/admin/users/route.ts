import { getAllActiveUsers } from '@/lib/db/queries';
import { type NextRequest, NextResponse } from 'next/server';
import { validatePlatformAdmin } from '@/lib/api/admin-guard';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(request: NextRequest) {
  try {
    await validatePlatformAdmin();

    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('search') || undefined;

    let page = Number.parseInt(searchParams.get('page') || '1', 10);
    let limit = Number.parseInt(searchParams.get('limit') || '50', 10);

    // Validate page and limit
    if (Number.isNaN(page) || page < 1) {
      page = 1;
    }
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      limit = 50;
    }

    const result = await getAllActiveUsers({
      page,
      limit,
      searchQuery,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
