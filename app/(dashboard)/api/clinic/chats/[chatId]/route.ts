import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { getChatWithSurgeryById } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;

    const user = await validateClinicAccess(chatId, {
      permissions: ['assessments.read'], // Only full read access
    });

    const chat = await getChatWithSurgeryById({ id: chatId });

    return Response.json({
      id: chat.id,
      createdAt: chat.createdAt,
      status: chat.status,
      form: chat.form,
      results: chat.results,
      medications: chat.medications,
      score_rcri: chat.score_rcri,
      score_aub_has2: chat.score_aub_has2,
      surgery: chat.surgery,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching chat details:', error);
    return Response.json(
      { error: 'Failed to fetch chat details' },
      { status: 500 },
    );
  }
}
