import { NextResponse } from 'next/server';
import { validateBasicAuth } from '@/lib/api/basic-auth-guard';
import { deleteUser } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/shared/errors';
import { signOut } from '@/app/(auth)/auth';

/**
 * DELETE /api/user/delete
 * Allow removed users to permanently delete their own account
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

    // Hard delete permanently
    await deleteUser({ userId: user.id });

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
