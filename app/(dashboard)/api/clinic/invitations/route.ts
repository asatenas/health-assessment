import { NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { getClinicInvitations } from '@/lib/db/queries';

/**
 * GET /api/clinic/invitations
 * Get all pending clinic invitations for the current clinic
 */
export async function GET() {
  try {
    const user = await validateClinicAccess();

    const invitations = await getClinicInvitations({
      clinicId: user.clinicId,
    });

    return NextResponse.json({ invitations });
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
