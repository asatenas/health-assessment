import { NextResponse } from 'next/server';
import { validateBasicAuth } from '@/lib/api/basic-auth-guard';
import {
  getClinicByEmail,
  transferUserToExistingClinic,
} from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';

/**
 * POST /api/clinic/return-to-original
 * Allow removed users to return to their original clinic
 */
export async function POST() {
  try {
    const { user } = await validateBasicAuth();

    // Only removed users can return to their original clinic
    if (user.status !== 'removed') {
      throw new ChatSDKError(
        'forbidden:api',
        'Only removed users can return to their original clinic',
      );
    }

    // Find the original clinic by user's email
    const originalClinic = await getClinicByEmail({ email: user.email });

    if (!originalClinic) {
      throw new ChatSDKError(
        'not_found:api',
        'Original clinic not found. Please contact support.',
      );
    }

    // Transfer user back to their original clinic
    await transferUserToExistingClinic({
      userId: user.id,
      clinicId: originalClinic.id,
      role: 'owner',
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      clinicId: originalClinic.id,
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error returning to original clinic:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to return to original clinic',
    ).toResponse();
  }
}
