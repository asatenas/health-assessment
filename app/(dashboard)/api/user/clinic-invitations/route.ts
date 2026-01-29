import { NextResponse } from 'next/server';
import { validateBasicAuth } from '@/lib/api/basic-auth-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { getClinicInvitationsByEmail } from '@/lib/db/queries';

/**
 * GET /api/user/clinic-invitations
 * Get pending clinic invitations for the current user
 */
export async function GET() {
  try {
    const { email } = await validateBasicAuth();

    const invitations = await getClinicInvitationsByEmail({
      email,
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
