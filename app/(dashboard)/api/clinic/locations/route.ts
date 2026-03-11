import { validateClinicAccess } from '@/lib/api/clinic-guard';
import {
  getClinicLocations,
  createClinicLocations,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function GET() {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['org.manage'],
    });

    const locations = await getClinicLocations(user.clinicId);

    return Response.json({ locations });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { error: 'Failed to fetch locations' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['org.manage'],
    });

    const body = await request.json();
    const { locations } = body;

    if (
      !Array.isArray(locations) ||
      locations.length === 0 ||
      !locations.every(
        (l: any) => typeof l.name === 'string' && l.name.trim(),
      )
    ) {
      return Response.json(
        { error: 'Invalid locations data' },
        { status: 400 },
      );
    }

    const created = await createClinicLocations(
      user.clinicId,
      locations.map((l: any) => ({ name: l.name.trim() })),
    );

    return Response.json({ locations: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { error: 'Failed to create locations' },
      { status: 500 },
    );
  }
}
