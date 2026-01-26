import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { getMonthlySurgeries } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET(request: Request) {
  try {
    const user = await validateClinicAccess();

    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    const month = monthParam ? Number.parseInt(monthParam, 10) : undefined;
    const year = yearParam ? Number.parseInt(yearParam, 10) : undefined;

    const monthlySurgeries = await getMonthlySurgeries({
      clinicId: user.clinicId,
      month,
      year,
    });

    return Response.json(monthlySurgeries);
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching monthly surgeries:', error);
    return Response.json(
      { error: 'Failed to fetch monthly surgeries' },
      { status: 500 },
    );
  }
}
