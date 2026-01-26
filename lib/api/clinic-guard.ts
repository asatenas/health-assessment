import { auth } from '@/app/(auth)/auth';
import { getChatById, getUserById, getClinicByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '../shared/errors';

export async function validateClinicAccess(chatId?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ChatSDKError('unauthorized:api');
  }

  // Determine which user to validate (target user if impersonating, otherwise session user)
  let effectiveUserId = session.user.id;

  // If impersonating, verify admin status and use target user
  if (session.impersonation) {
    // Verify original user is still a platform admin
    const adminUser = await getUserById({
      userId: session.impersonation.originalUserId,
    });
    if (!adminUser?.platformAdmin) {
      throw new ChatSDKError(
        'unauthorized:api',
        'Original admin user no longer has platform admin privileges',
      );
    }

    // Use target user for all subsequent checks
    effectiveUserId = session.impersonation.targetUserId;
  }

  const user = await getUserById({ userId: effectiveUserId });

  if (!user) {
    throw new ChatSDKError('unauthorized:api');
  }

  if (!user.emailVerified) {
    throw new ChatSDKError('unauthorized:api', 'Email not verified');
  }

  if (user.status !== 'active') {
    throw new ChatSDKError('unauthorized:api', 'User account is not active');
  }

  const userClinic = await getClinicByUserId({ userId: effectiveUserId });
  if (!userClinic?.authorized) {
    throw new ChatSDKError('unauthorized:api', 'Clinic not authorized');
  }

  if (chatId) {
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      throw new ChatSDKError('not_found:api');
    }

    if (chat.clinicId !== user.clinicId) {
      throw new ChatSDKError('unauthorized:api');
    }
  }

  return user;
}
