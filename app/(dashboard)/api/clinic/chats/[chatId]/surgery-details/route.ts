import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { updateChatSurgeryDetails } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> },
) {
  try {
    const { chatId } = await params;

    await validateClinicAccess(chatId);

    // Parse request body
    const body = await request.json();

    const {
      surgeryDate,
      surgeryCompleted,
      surgeryRescheduled,
      surgeryCancelled,
      surgeryStatusReason,
      medicalInterventionRequired,
      interventionNotes,
      adjustmentsRequired,
      adjustmentNotes,
    } = body;

    // Update surgery details
    const updatedChat = await updateChatSurgeryDetails({
      chatId,
      surgeryDate: surgeryDate ? new Date(surgeryDate) : undefined,
      surgeryCompleted,
      surgeryRescheduled,
      surgeryCancelled,
      surgeryStatusReason,
      medicalInterventionRequired,
      interventionNotes,
      adjustmentsRequired,
      adjustmentNotes,
    });

    return Response.json({
      success: true,
      chat: updatedChat,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error updating surgery details:', error);
    return Response.json(
      { error: 'Failed to update surgery details' },
      { status: 500 },
    );
  }
}
