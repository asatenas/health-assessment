import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import {
  getChatById,
  getChatFormById,
  getMessagesByChatId,
} from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';
import { TokenGate } from '@/components/token-gate';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const cookieStore = await cookies();

  // Check if this is a patient chat (has a token)
  if (chat.token) {
    // Check if chat status allows access
    if (chat.status === 'expired' || chat.status === 'finished') {
      return notFound();
    }

    // Check if user has provided the correct token
    const chatTokenCookie = cookieStore.get(`chat_token_${id}`);

    if (!chatTokenCookie || chatTokenCookie.value !== chat.token) {
      return <TokenGate chatId={id} />;
    }

    const messagesFromDb = await getMessagesByChatId({ id });
    const uiMessages = convertToUIMessages(messagesFromDb);
    const chatModelFromCookie = cookieStore.get('chat-model');
    const initialFormData = await getChatFormById({ id });
    const hasInitialMessages = uiMessages.length > 1;

    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={uiMessages}
          initialChatModel={chatModelFromCookie?.value || DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={chat.status !== 'active'}
          // session={null}
          autoResume={true}
          initialFormData={initialFormData}
          hasInitialMessages={hasInitialMessages}
        />
        <DataStreamHandler />
      </>
    );
  }

  // Regular authenticated chat (clinic users)
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  if (chat.visibility === 'private') {
    if (!session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  if (chat.readOnly) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const chatModelFromCookie = cookieStore.get('chat-model');

  const isReadOnly = chat.readOnly || session?.user?.id !== chat.userId;

  const initialFormData = await getChatFormById({ id });
  const hasInitialMessages = uiMessages.length > 1;

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          id={chat.id}
          initialMessages={uiMessages}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={isReadOnly}
          // session={session}
          autoResume={true}
          initialFormData={initialFormData}
          hasInitialMessages={hasInitialMessages}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={chat.visibility}
        isReadonly={isReadOnly}
        // session={session}
        autoResume={true}
        initialFormData={initialFormData}
        hasInitialMessages={hasInitialMessages}
      />
      <DataStreamHandler />
    </>
  );
}
