import { validateClinicAccess } from '@/lib/api/clinic-guard';
import {
  updateClinicLocation,
  deleteClinicLocation,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> },
) {
  try {
    await validateClinicAccess(undefined, {
      permissions: ['org.manage'],
    });

    const { locationId } = await params;
    const body = await request.json();
    const { name, enabled } = body;

    const data: { name?: string; enabled?: boolean } = {};
    if (typeof name === 'string') data.name = name.trim();
    if (typeof enabled === 'boolean') data.enabled = enabled;

    if (Object.keys(data).length === 0) {
      return Response.json(
        { error: 'No valid fields to update' },
        { status: 400 },
      );
    }

    const updated = await updateClinicLocation(locationId, data);

    if (!updated) {
      return Response.json(
        { error: 'Location not found' },
        { status: 404 },
      );
    }

    return Response.json({ location: updated });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { error: 'Failed to update location' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ locationId: string }> },
) {
  try {
    await validateClinicAccess(undefined, {
      permissions: ['org.manage'],
    });

    const { locationId } = await params;
    await deleteClinicLocation(locationId);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    return Response.json(
      { error: 'Failed to delete location' },
      { status: 500 },
    );
  }
}
