import { validateClinicAccess } from '@/lib/api/clinic-guard';
import {
  getDashboardMetrics,
  getTimelineData,
  getHighPriorityNotifications,
  getMonthlySurgeries,
  getTodaysSurgeriesForSwipe,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(request: Request) {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['org.manage'],
    });

    const { searchParams } = new URL(request.url);
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    const period = searchParams.get('period');
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

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
      clinicId: user.clinicId,
      dateFrom,
      dateTo,
    });

    // Get timeline data (default to last 30 days if no filter)
    const timelineFrom =
      dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const timelineTo = dateTo || new Date();

    const timeline = await getTimelineData({
      clinicId: user.clinicId,
      dateFrom: timelineFrom,
      dateTo: timelineTo,
    });

    // Get notifications
    const notifications = await getHighPriorityNotifications({
      clinicId: user.clinicId,
    });

    // Get monthly surgeries (defaults to current month)
    const month = monthParam ? Number.parseInt(monthParam, 10) : undefined;
    const year = yearParam ? Number.parseInt(yearParam, 10) : undefined;
    const monthlySurgeries = await getMonthlySurgeries({
      clinicId: user.clinicId,
      month,
      year,
    });

    // Get today's surgeries
    const todaysSurgeries = await getTodaysSurgeriesForSwipe({
      clinicId: user.clinicId,
    });

    return Response.json({
      metrics,
      timeline,
      notifications,
      monthlySurgeries,
      todaysSurgeries,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching dashboard metrics:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 },
    );
  }
}
