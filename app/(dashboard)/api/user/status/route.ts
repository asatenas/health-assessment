import { NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { getUserById } from '@/lib/db/queries';

/**
 * GET /api/user/status
 * Get current user's status
 */
export async function GET() {
  try {
    const currentUser = await validateClinicAccess();

    // Fetch fresh user data from database
    const user = await getUserById({ userId: currentUser.id });

    if (!user) {
      return new ChatSDKError(
        'not_found:api',
        'Usuário não encontrado',
      ).toResponse();
    }

    return NextResponse.json({
      status: user.status,
      email: user.email,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching user status:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to fetch user status',
    ).toResponse();
  }
}
