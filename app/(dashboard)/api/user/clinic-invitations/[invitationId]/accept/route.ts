import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { acceptClinicInvitation, getClinicByUserId } from '@/lib/db/queries';

/**
 * POST /api/user/clinic-invitations/[invitationId]/accept
 * Accept a clinic invitation and switch to the new clinic
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  try {
    const { invitationId } = await params;
    const user = await validateClinicAccess();

    // Accept invitation
    const { user: updatedUser, invitation } = await acceptClinicInvitation({
      invitationId,
      userId: user.id,
    });

    // Verify invitation belongs to current user
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return new ChatSDKError(
        'forbidden:api',
        'Este convite não pertence a você',
      ).toResponse();
    }

    // Get new clinic details
    const newClinic = await getClinicByUserId({ userId: user.id });

    // Update session will happen on next request via validateClinicAccess
    return NextResponse.json({
      success: true,
      newClinicId: updatedUser.clinicId,
      newClinicName: newClinic?.clinicName,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error accepting clinic invitation:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to accept clinic invitation',
    ).toResponse();
  }
}
