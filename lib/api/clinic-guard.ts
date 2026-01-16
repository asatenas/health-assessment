import { auth } from '@/app/(auth)/auth';
import { getChatById, getUserById } from '@/lib/db/queries';
import { ChatSDKError } from '../shared/errors';

export async function validateClinicAccess(chatId?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ChatSDKError('unauthorized:api');
  }

  const user = await getUserById({ id: session.user.id });

  if (!user?.emailVerified) {
    throw new ChatSDKError('unauthorized:api');
  }

  if (chatId) {
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      throw new ChatSDKError('not_found:api');
    }

    if (chat.userId !== session.user.id) {
      throw new ChatSDKError('unauthorized:api');
    }
  }

  return user;
}
