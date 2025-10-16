'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, fetchWithErrorHandlers, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
// import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useChatReadonly } from '@/hooks/use-chat-readonly';
import { isProductionEnvironment } from '@/lib/constants';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { useMessages } from '@/hooks/use-messages';
import { initialMessage } from '@/lib/ai/prompts';
import { PreChatForm } from './pre-chat-form';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  initialFormData,
  hasInitialMessages: hasInitialMessagesFromServer,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
  initialFormData?: any;
  hasInitialMessages?: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { isReadonly: currentIsReadonly, setReadonly } = useChatReadonly({
    chatId: id,
    initialReadonly: isReadonly,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        const userMessages = messages.filter((m) => m.role === 'user');
        const isFirstUserMessage = userMessages.length === 1;

        return {
          body: {
            id,
            message: messages.at(-1),
            messages: isFirstUserMessage ? messages : undefined,
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        toast({
          type: 'error',
          description: error.message,
        });
      }
    },
  });

  const { setHasSentMessage } = useMessages({
    chatId: id,
    status,
  });

  // Helper function to check if any message contains a specific tool call
  const checkAnyMessageForToolCall = (
    messages: ChatMessage[],
    toolName: string,
  ) => {
    return messages.some(
      (msg) =>
        msg.role === 'assistant' &&
        msg.parts?.some((part: any) => part.type === toolName),
    );
  };

  // Initialize state based on database data
  const [hasInitialMessage, setHasInitialMessage] = useState(
    hasInitialMessagesFromServer || false,
  );
  const [hasCompletedForm, setHasCompletedForm] = useState(
    !!initialFormData || false,
  );
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [storedFormData, setStoredFormData] = useState<any>(
    initialFormData || null,
  );

  // tool calls for flow control - check initial messages for tool calls
  const [hasSuspendMedicationsCalled, setHasSuspendMedicationsCalled] =
    useState(
      checkAnyMessageForToolCall(initialMessages, 'tool-suspendMedications'),
    );
  const [hasFinalizeInterviewCalled, setHasFinalizeInterviewCalled] = useState(
    checkAnyMessageForToolCall(initialMessages, 'tool-finalizeInterview'),
  );

  // useEffect(() => {
  //   if (query && !hasAppendedQuery) {
  //     sendMessage({
  //       role: 'user' as const,
  //       parts: [{ type: 'text', text: query }],
  //     });

  //     setHasAppendedQuery(true);
  //     window.history.replaceState({}, '', `/chat/${id}`);
  //   }
  // }, [query, sendMessage, hasAppendedQuery, id]);

  useEffect(() => {
    // run only when initiating chat
    if (hasInitialMessage || currentIsReadonly) {
      return;
    }

    if (isProductionEnvironment) {
      fetch('/api/notify', { method: 'POST' }); // simple notification for new chats
    }

    setMessages([
      {
        id: generateUUID(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: initialMessage,
          },
        ],
        metadata: {
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    setHasInitialMessage(true);
    setHasSentMessage(true);
  }, [
    messages.length,
    hasInitialMessage,
    setMessages,
    currentIsReadonly,
    setHasSentMessage,
    hasCompletedForm,
  ]);

  function checkToolCall(lastMessage: ChatMessage, toolName: string) {
    return (
      lastMessage.role === 'assistant' &&
      lastMessage.parts?.some((part: any) => part.type === toolName)
    );
  }

  // check for tool calls
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (!lastMessage) {
      return;
    }

    if (!hasSuspendMedicationsCalled) {
      if (checkToolCall(lastMessage, 'tool-suspendMedications')) {
        setHasSuspendMedicationsCalled(true);
      }
    }

    if (!hasFinalizeInterviewCalled) {
      if (checkToolCall(lastMessage, 'tool-finalizeInterview')) {
        setReadonly(true);
        setHasFinalizeInterviewCalled(true);
      }
    }
  }, [
    id,
    messages,
    hasSuspendMedicationsCalled,
    setHasSuspendMedicationsCalled,
    hasFinalizeInterviewCalled,
    setHasFinalizeInterviewCalled,
    currentIsReadonly,
    setReadonly,
    storedFormData,
  ]);

  const { data: votes } = useSWR<Array<Vote>>(
    // `/api/vote?chatId=${id}`,
    null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={currentIsReadonly}
          session={session}
        />

        {!isFormVisible && (
          <Messages
            chatId={id}
            status={status}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            regenerate={regenerate}
            isReadonly={currentIsReadonly}
            isArtifactVisible={isArtifactVisible}
          />
        )}

        {!hasCompletedForm && hasInitialMessage && (
          <PreChatForm
            onComplete={async (formData) => {
              // Store form data for later saving
              setStoredFormData(formData);

              setHasCompletedForm(true);
              setIsFormVisible(false);

              window.history.replaceState({}, '', `/chat/${id}`);

              sendMessage({
                role: 'user',
                parts: [
                  {
                    type: 'text',
                    text: JSON.stringify(formData), // TODO: not send as stringified JSON
                  },
                ],
              });
            }}
            onShowForm={() => setIsFormVisible(true)}
            isReadonly={currentIsReadonly}
          />
        )}

        {hasCompletedForm && (
          <div className="sticky bottom-0 flex gap-2 px-4 pb-4 mx-auto w-full bg-background md:pb-6 md:max-w-3xl z-[1] border-t-0">
            {!currentIsReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                status={status}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                sendMessage={sendMessage}
                selectedVisibilityType={visibilityType}
                selectedModelId={initialChatModel}
              />
            )}
          </div>
        )}
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={currentIsReadonly}
        selectedVisibilityType={visibilityType}
        selectedModelId={initialChatModel}
      />
    </>
  );
}
