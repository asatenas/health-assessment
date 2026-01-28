import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { rejectClinicInvitation } from '@/lib/db/queries';

/**
 * POST /api/user/clinic-invitations/[invitationId]/reject
 * Reject a clinic invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  try {
    const { invitationId } = await params;
    await validateClinicAccess();

    // Reject invitation
    await rejectClinicInvitation({ invitationId });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error rejecting clinic invitation:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to reject clinic invitation',
    ).toResponse();
  }
}
