import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import {
  getUserById,
  disableUser,
  deleteUser,
  countActiveOwners,
} from '@/lib/db/queries';

/**
 * DELETE /api/clinic/members/[userId]?permanent=true
 * Remove a user (soft or hard delete)
 * - For invited users: always hard delete
 * - For disabled users with ?permanent=true: hard delete
 * - For active users: soft delete (change status to disabled)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const currentUser = await validateClinicAccess(undefined, {
      permissions: ['users.remove'],
    });

    // Cannot remove yourself
    if (userId === currentUser.id) {
      return new ChatSDKError(
        'forbidden:api',
        'Você não pode remover a si mesmo',
      ).toResponse();
    }

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

    // Admin restrictions: cannot remove owners
    if (currentUser.role === 'admin' && targetUser.role === 'owner') {
      return new ChatSDKError(
        'forbidden:api',
        'Apenas proprietários podem remover outros proprietários',
      ).toResponse();
    }

    // Last owner protection
    if (targetUser.role === 'owner') {
      const ownerCount = await countActiveOwners({
        clinicId: currentUser.clinicId,
      });

      if (ownerCount <= 1) {
        return new ChatSDKError(
          'bad_request:api',
          'Não é possível remover o último proprietário. Promova outro usuário primeiro.',
        ).toResponse();
      }
    }

    // Determine deletion strategy based on status and permanent flag
    if (
      targetUser.status === 'invited' ||
      (targetUser.status === 'disabled' && permanent)
    ) {
      // Hard delete invited users or disabled users with permanent flag
      const deletedUserResult = await deleteUser({ userId });

      return NextResponse.json({
        userId: deletedUserResult.id,
        email: deletedUserResult.email,
        status: 'deleted',
        message:
          targetUser.status === 'invited'
            ? 'Convite deletado com sucesso'
            : 'Usuário deletado permanentemente',
      });
    } else if (targetUser.status === 'active') {
      // Soft delete for active users
      const disabledUserResult = await disableUser({ userId });

      return NextResponse.json({
        userId: disabledUserResult.id,
        email: disabledUserResult.email,
        status: 'disabled',
      });
    } else {
      // Disabled user without permanent flag - cannot delete
      return new ChatSDKError(
        'bad_request:api',
        'Use o parâmetro permanent=true para deletar permanentemente um usuário desativado',
      ).toResponse();
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error removing user:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to remove user',
    ).toResponse();
  }
}
