import { NextResponse } from 'next/server';
import { validateBasicAuth } from '@/lib/api/basic-auth-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { signOut } from '@/app/(auth)/auth';
import { createClinicAndTransferUser } from '@/lib/db/queries';

/**
 * POST /api/clinic/create
 * Allow removed users to create a new clinic and transfer to it
 */
export async function POST(request: Request) {
  try {
    const authUser = await validateBasicAuth();

    if (authUser.user.status !== 'removed') {
      throw new ChatSDKError(
        'forbidden:api',
        'Only removed users can create new clinic',
      );
    }

    const { clinicName } = await request.json();

    // Validation
    if (!clinicName || clinicName.trim().length < 3) {
      throw new ChatSDKError(
        'bad_request:api',
        'Clinic name must be at least 3 characters',
      );
    }

    // Create new clinic and transfer user
    const { clinicId } = await createClinicAndTransferUser({
      clinicName: clinicName.trim(),
      userEmail: authUser.user.email,
      userId: authUser.user.id,
    });

    // Sign out and request new login (to update session with new clinicId)
    await signOut({ redirect: false });

    return NextResponse.json({
      success: true,
      clinicId,
      message: 'Clinic created. Please log in again.',
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error creating clinic:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to create clinic',
    ).toResponse();
  }
}
