import { NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { getClinicInvitationsByEmail } from '@/lib/db/queries';

/**
 * GET /api/user/clinic-invitations
 * Get pending clinic invitations for the current user
 */
export async function GET() {
  try {
    const user = await validateClinicAccess();

    const invitations = await getClinicInvitationsByEmail({
      email: user.email,
    });

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        id: inv.id,
        clinicName: inv.clinicName,
        role: inv.role,
        invitedBy: inv.invitedByEmail,
        createdAt: inv.createdAt,
        expiresAt: inv.expiresAt,
      })),
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching clinic invitations:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to fetch clinic invitations',
    ).toResponse();
  }
}
