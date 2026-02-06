import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { getSurgeryByAssessmentId } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const { assessmentId } = await params;

    // Validate clinic access using the assessment/chat ID
    await validateClinicAccess(assessmentId, {
      permissions: ['surgeries.read'],
    });

    // Fetch surgery details
    const surgery = await getSurgeryByAssessmentId({ assessmentId });

    return Response.json(surgery);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching surgery details:', error);
    return Response.json(
      { error: 'Failed to fetch surgery details' },
      { status: 500 },
    );
  }
}
