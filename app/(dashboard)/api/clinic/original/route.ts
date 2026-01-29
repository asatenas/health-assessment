import { NextResponse } from 'next/server';
import { validateBasicAuth } from '@/lib/api/basic-auth-guard';
import { getClinicByEmail } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

/**
 * GET /api/clinic/original
 * Get the original clinic for a removed user (clinic with their email)
 */
export async function GET() {
  try {
    const { user } = await validateBasicAuth();

    // Only removed users need to access this
    if (user.status !== 'removed') {
      return NextResponse.json({ clinic: null });
    }

    // Find the original clinic by user's email
    const originalClinic = await getClinicByEmail({ email: user.email });

    return NextResponse.json({ clinic: originalClinic || null });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching original clinic:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to fetch original clinic',
    ).toResponse();
  }
}
