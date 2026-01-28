import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import {
  getUserById,
  updateUserRole,
  countActiveOwners,
} from '@/lib/db/queries';

/**
 * PATCH /api/clinic/members/[userId]/role
 * Change a user's role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const currentUser = await validateClinicAccess(undefined, {
      permissions: ['roles.assign'],
    });

    const body = await request.json();
    const { newRole } = body;

    // Validate input
    if (!newRole) {
      return new ChatSDKError(
        'bad_request:api',
        'New role is required',
      ).toResponse();
    }

    const validRoles = ['secretary', 'clinician', 'admin', 'owner'];
    if (!validRoles.includes(newRole)) {
      return new ChatSDKError('bad_request:api', 'Invalid role').toResponse();
    }

    // Cannot change own role
    if (userId === currentUser.id) {
      return new ChatSDKError(
        'forbidden:api',
        'Você não pode alterar seu próprio papel',
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

    // Admin restrictions
    if (currentUser.role === 'admin') {
      // Cannot promote to owner
      if (newRole === 'owner') {
        return new ChatSDKError(
          'forbidden:api',
          'Apenas proprietários podem promover outros usuários a proprietário',
        ).toResponse();
      }

      // Cannot modify owners
      if (targetUser.role === 'owner') {
        return new ChatSDKError(
          'forbidden:api',
          'Apenas proprietários podem modificar outros proprietários',
        ).toResponse();
      }
    }

    // Last owner protection: if demoting from owner, check count
    if (targetUser.role === 'owner' && newRole !== 'owner') {
      const ownerCount = await countActiveOwners({
        clinicId: currentUser.clinicId,
      });

      if (ownerCount <= 1) {
        return new ChatSDKError(
          'bad_request:api',
          'Não é possível rebaixar o último proprietário. Promova outro usuário primeiro.',
        ).toResponse();
      }
    }

    // Update role
    const updatedUser = await updateUserRole({ userId, newRole });

    return NextResponse.json({
      userId: updatedUser.id,
      email: updatedUser.email,
      oldRole: targetUser.role,
      newRole: updatedUser.role,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error updating user role:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to update user role',
    ).toResponse();
  }
}
