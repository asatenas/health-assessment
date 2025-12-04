import { auth } from '@/app/(auth)/auth';
import { getChatById, updateChatSurgeryDetails } from '@/lib/db/queries';

export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } },
) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { chatId } = params;

    // Verify the chat belongs to the user
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return Response.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return Response.json(
        { error: 'Forbidden - You do not own this chat' },
        { status: 403 },
      );
    }

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
    console.error('Error updating surgery details:', error);
    return Response.json(
      { error: 'Failed to update surgery details' },
      { status: 500 },
    );
  }
}
