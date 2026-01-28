import { type NextRequest, NextResponse } from 'next/server';
import { validateBasicAuth } from '@/lib/api/basic-auth-guard';
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
    const { userId, email } = await validateBasicAuth();

    // Accept invitation (with ownership check)
    const { user: updatedUser } = await acceptClinicInvitation({
      invitationId,
      userId,
      email,
    });

    // Get new clinic details
    const newClinic = await getClinicByUserId({ userId });

    // Update session will happen on next request
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
