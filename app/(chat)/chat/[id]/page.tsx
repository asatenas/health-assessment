import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
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

  if (!chat || chat.readOnly) {
    notFound();
  }

  if (!chat.token) {
    return notFound();
  }

  if (chat.visibility !== 'private') {
    return notFound();
  }

  if (chat.status === 'expired' || chat.status === 'finished') {
    return notFound();
  }

  const cookieStore = await cookies();

  const chatTokenCookie = cookieStore.get(`chat_token_${id}`);

  if (!chatTokenCookie || chatTokenCookie.value !== chat.token) {
    return <TokenGate chatId={id} />;
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  const uiMessages = convertToUIMessages(messagesFromDb);

  const chatModelFromCookie = cookieStore.get('chat-model');
  const chatModel = chatModelFromCookie?.value || DEFAULT_CHAT_MODEL;

  const initialFormData = await getChatFormById({ id });
  const hasInitialMessages = uiMessages.length > 1;

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={chatModel}
        initialVisibilityType={chat.visibility}
        isReadonly={chat.readOnly}
        autoResume={true}
        initialFormData={initialFormData}
        hasInitialMessages={hasInitialMessages}
      />
      <DataStreamHandler />
    </>
  );
}
