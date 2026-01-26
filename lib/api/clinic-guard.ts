import { auth } from '@/app/(auth)/auth';
import { getChatById, getUserById, getClinicByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '../shared/errors';

export async function validateClinicAccess(chatId?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ChatSDKError('unauthorized:api');
  }

  const user = await getUserById({ userId: session.user.id });

  if (!user) {
    throw new ChatSDKError('unauthorized:api');
  }

  if (!user.emailVerified) {
    throw new ChatSDKError('unauthorized:api', 'Email not verified');
  }

  if (user.status !== 'active') {
    throw new ChatSDKError('unauthorized:api', 'User account is not active');
  }

  const userClinic = await getClinicByUserId({ userId: session.user.id });
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
