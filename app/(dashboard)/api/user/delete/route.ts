import { NextResponse } from 'next/server';
import { validateBasicAuth } from '@/lib/api/basic-auth-guard';
import { deleteUser, getClinicByEmail, deleteClinic } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import { signOut } from '@/app/(auth)/auth';

/**
 * DELETE /api/user/delete
 * Allow removed users to permanently delete their own account and original clinic
 */
export async function DELETE() {
  try {
    const { user } = await validateBasicAuth();

    // Only removed users can delete their account
    if (user.status !== 'removed') {
      throw new ChatSDKError(
        'forbidden:api',
        'Only removed users can delete their account',
      );
    }

    // Find and delete the original clinic (if it exists)
    const originalClinic = await getClinicByEmail({ email: user.email });
    if (originalClinic) {
      // Delete the clinic (this will cascade delete all users in that clinic)
      await deleteClinic({ clinicId: originalClinic.id });
    }

    // Hard delete user permanently (if not already deleted by cascade)
    try {
      await deleteUser({ userId: user.id });
    } catch (error) {
      // User might already be deleted by cascade, ignore error
    }

    // Sign out
    await signOut({ redirect: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error deleting account:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to delete account',
    ).toResponse();
  }
}
