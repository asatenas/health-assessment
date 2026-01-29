import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import {
  getUserById,
  removeUser,
  deleteUser,
  countActiveOwners,
  deleteInvitationsByInviter,
} from '@/lib/db/queries';

/**
 * DELETE /api/clinic/members/[userId]
 * Remove a user from the clinic
 * - For invited users: hard delete
 * - For active users: set status to 'removed'
 * - Deleted invitations created by the removed user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

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

    // Delete invitations created by this user
    await deleteInvitationsByInviter({ invitedBy: userId });

    // Determine removal strategy based on status
    if (targetUser.status === 'invited') {
      // Hard delete invited users
      const deletedUserResult = await deleteUser({ userId });

      return NextResponse.json({
        userId: deletedUserResult.id,
        email: deletedUserResult.email,
        status: 'deleted',
        message: 'Convite deletado com sucesso',
      });
    } else {
      // Set status to 'removed' for active users
      const removedUserResult = await removeUser({ userId });

      return NextResponse.json({
        userId: removedUserResult.id,
        email: removedUserResult.email,
        status: 'removed',
        message: 'Usuário removido com sucesso',
      });
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
