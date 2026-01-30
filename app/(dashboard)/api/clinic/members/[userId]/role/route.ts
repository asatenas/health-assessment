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
        'Você não pode alterar seu próprio perfil',
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

    if (newRole === 'owner') {
      return new ChatSDKError(
        'forbidden:api',
        'Não é possível promover usuários a proprietário.',
      ).toResponse();
    }

    if (currentUser.role === 'admin') {
      // Cannot modify owners
      if (targetUser.role === 'owner') {
        return new ChatSDKError(
          'forbidden:api',
          'Você não tem permissão para essa operação',
        ).toResponse();
      }
    }

    if (targetUser.role === 'owner' && newRole !== 'owner') {
      const ownerCount = await countActiveOwners({
        clinicId: currentUser.clinicId,
      });

      if (ownerCount <= 1) {
        return new ChatSDKError(
          'bad_request:api',
          'Não é possível remover o único proprietário. Para transferência da clínica, entre em contato com o suporte.',
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
