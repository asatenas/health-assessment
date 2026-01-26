import { auth } from '@/app/(auth)/auth';
import { getUserById } from '@/lib/db/queries';
import { ChatSDKError } from '../shared/errors';

/**
 * Validates that the user is a platform admin and not currently impersonating.
 * Use this guard for platform admin-only endpoints.
 */
export async function validatePlatformAdmin() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ChatSDKError('unauthorized:api', 'Not authenticated');
  }

  // Block access if currently impersonating
  if (session.impersonation) {
    throw new ChatSDKError(
      'unauthorized:api',
      'Cannot access admin features while impersonating. Exit impersonation first.',
    );
  }

  // Verify user has platformAdmin flag
  if (!session.user.platformAdmin) {
    throw new ChatSDKError(
      'unauthorized:api',
      'Not authorized as platform admin',
    );
  }

  // Double-check with database
  const user = await getUserById({ userId: session.user.id });

  if (!user?.platformAdmin) {
    throw new ChatSDKError(
      'unauthorized:api',
      'Not authorized as platform admin',
    );
  }

  return user;
}
