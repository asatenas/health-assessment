import { auth } from '@/app/(auth)/auth';
import {
  getDashboardMetrics,
  getTimelineData,
  getHighPriorityNotifications,
  getThisWeeksSurgeries,
} from '@/lib/db/queries';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    const period = searchParams.get('period');

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    // Handle period presets
    if (period) {
      const now = new Date();
      switch (period) {
        case '1d':
          dateFrom = new Date(now);
          dateFrom.setHours(0, 0, 0, 0);
          dateTo = new Date(now);
          dateTo.setHours(23, 59, 59, 999);
          break;
        case '7d':
          dateFrom = new Date(now);
          dateFrom.setDate(now.getDate() - 7);
          dateTo = now;
          break;
        case '30d':
          dateFrom = new Date(now);
          dateFrom.setMonth(now.getMonth() - 1);
          dateTo = now;
          break;
        case '60d':
          dateFrom = new Date(now);
          dateFrom.setMonth(now.getMonth() - 2);
          dateTo = now;
          break;
        case '90d':
          dateFrom = new Date(now);
          dateFrom.setMonth(now.getMonth() - 3);
          dateTo = now;
          break;
        case 'custom':
          // Use explicit date parameters
          if (dateFromParam) {
            dateFrom = new Date(dateFromParam);
          }
          if (dateToParam) {
            dateTo = new Date(dateToParam);
          }
          break;
        case 'all':
          // No date filter
          break;
      }
    }

    // Get metrics
    const metrics = await getDashboardMetrics({
      userId: session.user.id,
      dateFrom,
      dateTo,
    });

    // Get timeline data (default to last 30 days if no filter)
    const timelineFrom =
      dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const timelineTo = dateTo || new Date();

    const timeline = await getTimelineData({
      userId: session.user.id,
      dateFrom: timelineFrom,
      dateTo: timelineTo,
    });

    // Get notifications
    const notifications = await getHighPriorityNotifications({
      userId: session.user.id,
    });

    // Get this week's surgeries
    const thisWeeksSurgeries = await getThisWeeksSurgeries({
      userId: session.user.id,
    });

    return Response.json({
      metrics,
      timeline,
      notifications,
      thisWeeksSurgeries,
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 },
    );
  }
}
