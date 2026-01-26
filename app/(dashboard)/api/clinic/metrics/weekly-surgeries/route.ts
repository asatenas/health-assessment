import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { getWeeklySurgeries } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(request: Request) {
  try {
    const user = await validateClinicAccess();

    // Get current week's date range (Sunday to Saturday)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday

    // Calculate start of week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const surgeries = await getWeeklySurgeries({
      clinicId: user.clinicId,
      startDate: startOfWeek,
      endDate: endOfWeek,
    });

    return Response.json({ surgeries });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching weekly surgeries:', error);
    return Response.json(
      { error: 'Failed to fetch weekly surgeries' },
      { status: 500 },
    );
  }
}
