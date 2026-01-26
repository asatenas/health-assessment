import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Chat } from '@/components/chat/chat';
import {
  getChatById,
  getChatFormById,
  getMessagesByChatId,
  getClinicFormConfigByClinicId,
} from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/providers/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { initialMessage } from '@/lib/ai/prompts';
import { convertToUIMessages, generateUUID } from '@/lib/shared/utils';
import { TokenGate } from '@/components/auth/token-gate';
import { UUID_REGEX } from '@/lib/shared/validation';
import type { FormConfiguration } from '@/lib/types/clinic-config';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  if (!UUID_REGEX.test(id)) {
    return notFound();
  }

  const chat = await getChatById({ id });

  if (!chat || chat.readOnly) {
    return notFound();
  }

  if (!chat.token) {
    return notFound();
  }

  if (chat.visibility !== 'private') {
    return notFound();
  }

  const isExpired = new Date(chat.tokenExpiresAt) < new Date();
  if (chat.status === 'finished' || isExpired) {
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

  uiMessages.unshift({
    id: generateUUID(),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: initialMessage,
      },
    ],
    metadata: {
      createdAt: new Date(0).toISOString(),
    },
  });

  const chatModelFromCookie = cookieStore.get('chat-model');
  const chatModel = chatModelFromCookie?.value || DEFAULT_CHAT_MODEL;

  const initialFormData = await getChatFormById({ id });

  const formConfig = await getClinicFormConfigByClinicId({
    clinicId: chat.clinicId,
  });

  // Filter config to only include enabled sections and fields (security)
  const enabledConfig: FormConfiguration = {
    version: formConfig.version,
    sections: Object.fromEntries(
      Object.entries(formConfig.sections)
        .filter(([_, section]) => section.enabled)
        .map(([key, section]) => [
          key,
          {
            enabled: true,
            fields: Object.fromEntries(
              Object.entries(section.fields).filter(
                ([_, field]) => field.enabled,
              ),
            ),
          },
        ]),
    ) as FormConfiguration['sections'],
  };

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={chatModel}
        initialVisibilityType={chat.visibility}
        isReadonly={chat.readOnly}
        autoResume={false}
        initialFormData={initialFormData}
        formConfig={enabledConfig}
      />
      <DataStreamHandler />
    </>
  );
}
