import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { deleteClinicInvitation } from '@/lib/db/queries';

/**
 * DELETE /api/clinic/invitations/[invitationId]
 * Delete a pending clinic invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  try {
    const { invitationId } = await params;
    const user = await validateClinicAccess(undefined, {
      permissions: ['users.invite'],
    });

    await deleteClinicInvitation({
      invitationId,
      clinicId: user.clinicId,
    });

    return NextResponse.json({
      success: true,
      message: 'Convite deletado com sucesso',
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error deleting clinic invitation:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to delete clinic invitation',
    ).toResponse();
  }
}
