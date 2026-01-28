import { auth } from '@/app/(auth)/auth';
import { ChatSDKError } from '@/lib/shared/errors';
import { getUserById } from '@/lib/db/queries';

/**
 * Basic authentication guard for user-level operations.
 * Only verifies user is authenticated and exists - does NOT check:
 * - Email verification
 * - User status (active/invited/disabled)
 * - Clinic authorization
 * - Permissions
 *
 * Use for user account operations like password change, viewing invitations, etc.
 * For clinic operations that require full authorization, use validateClinicAccess instead.
 */
export async function validateBasicAuth(): Promise<{
  userId: string;
  email: string;
}> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ChatSDKError('unauthorized:api', 'Authentication required');
  }

  // Verify user exists in database
  const user = await getUserById({ userId: session.user.id });

  if (!user) {
    throw new ChatSDKError('unauthorized:api', 'User not found');
  }

  return {
    userId: user.id,
    email: user.email,
  };
}
