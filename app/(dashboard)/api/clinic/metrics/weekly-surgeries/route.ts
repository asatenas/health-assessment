import { auth } from '@/app/(auth)/auth';
import { getWeeklySurgeries } from '@/lib/db/queries';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
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
      userId: session.user.id,
      startDate: startOfWeek,
      endDate: endOfWeek,
    });

    return Response.json({ surgeries });
  } catch (error) {
    console.error('Error fetching weekly surgeries:', error);
    return Response.json(
      { error: 'Failed to fetch weekly surgeries' },
      { status: 500 },
    );
  }
}
