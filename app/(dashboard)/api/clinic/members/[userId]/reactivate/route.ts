import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { getUserById, reactivateUser } from '@/lib/db/queries';

/**
 * POST /api/clinic/members/[userId]/reactivate
 * Reactivate a removed user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const currentUser = await validateClinicAccess(undefined, {
      permissions: ['users.invite'],
    });

    // Get target user
    const targetUser = await getUserById({ userId });
    if (!targetUser) {
      return new ChatSDKError(
        'not_found:api',
        'Usuário não encontrado',
      ).toResponse();
    }

    // Verify user belongs to same clinic
    if (targetUser.clinicId !== currentUser.clinicId) {
      return new ChatSDKError('forbidden:api').toResponse();
    }

    // Check if user is removed
    if (targetUser.status !== 'removed') {
      return new ChatSDKError(
        'bad_request:api',
        'Usuário não está removido',
      ).toResponse();
    }

    // Reactivate user
    const reactivatedUserResult = await reactivateUser({ userId });

    return NextResponse.json({
      userId: reactivatedUserResult.id,
      email: reactivatedUserResult.email,
      status: 'active',
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error reactivating user:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to reactivate user',
    ).toResponse();
  }
}
