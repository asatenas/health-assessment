'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { ChatHeader } from '@/components/chat/chat-header';
import { fetchWithErrorHandlers, generateUUID } from '@/lib/shared/utils';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from '../shared/visibility-selector';
import { toast } from '../ui/toast';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useChatReadonly } from '@/hooks/use-chat-readonly';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/shared/errors';
import type { Attachment, ChatMessage } from '@/lib/shared/types';
import { useDataStream } from '../providers/data-stream-provider';
import { regularPrompt } from '@/lib/ai/prompts';
import { PreChatForm, formatPacienteInfo } from './pre-chat-form';
import { NPSEvaluation } from './nps-evaluation';
import { PromptTester } from '../prompt-tester';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  autoResume,
  initialFormData,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  autoResume: boolean;
  initialFormData?: any;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { isReadonly: currentIsReadonly, setReadonly } = useChatReadonly({
    chatId: id,
    initialReadonly: isReadonly,
  });

  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>(regularPrompt);
  const [hasPromptChanges, setHasPromptChanges] = useState(false);

  // Use a ref to hold the current prompt so the closure in prepareSendMessagesRequest
  // always sees the latest value
  const customPromptRef = useRef<string>(customPrompt);

  // Update ref whenever customPrompt changes
  useEffect(() => {
    customPromptRef.current = customPrompt;
  }, [customPrompt]);

  // Warn user before leaving if they have unsaved prompt changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPromptChanges) {
        e.preventDefault();
        e.returnValue =
          'Você tem alterações do prompt não salvas. Tem certeza que deseja sair?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPromptChanges]);

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

        // Use the ref to get the current value
        const currentCustomPrompt = customPromptRef.current;

        return {
          body: {
            id,
            message: messages.at(-1),
            messages: isFirstUserMessage ? messages : undefined,
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            customPrompt: currentCustomPrompt,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
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

  const [hasCompletedForm, setHasCompletedForm] = useState(!!initialFormData);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [storedFormData, setStoredFormData] = useState(initialFormData);

  // tool calls for flow control - check initial messages for tool calls
  const [hasSuspendMedicationsCalled, setHasSuspendMedicationsCalled] =
    useState(
      checkAnyMessageForToolCall(initialMessages, 'tool-suspendMedications'),
    );
  const [hasFinalizeInterviewCalled, setHasFinalizeInterviewCalled] = useState(
    checkAnyMessageForToolCall(initialMessages, 'tool-finalizeInterview'),
  );

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

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader />

        {!isFormVisible && (
          <Messages
            chatId={id}
            status={status}
            messages={messages}
            setMessages={setMessages}
            regenerate={regenerate}
            isReadonly={currentIsReadonly}
          />
        )}

        {!hasCompletedForm && (
          <PreChatForm
            onComplete={async (formData) => {
              // Store form data for later saving
              setStoredFormData(formData);

              setHasCompletedForm(true);
              setIsFormVisible(false);

              sendMessage({
                role: 'user',
                parts: [
                  {
                    type: 'text',
                    text: formatPacienteInfo(formData),
                  },
                ],
              });
            }}
            onShowForm={() => setIsFormVisible(true)}
            isReadonly={currentIsReadonly}
          />
        )}

        {
          <div className="sticky bottom-0 flex gap-2 px-4 pb-2 mx-auto w-full bg-background md:max-w-3xl z-[1] border-t-0">
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
                selectedModelId={initialChatModel}
              />
            )}
            {currentIsReadonly &&
              hasFinalizeInterviewCalled &&
              status === 'ready' && <NPSEvaluation chatId={id} />}
          </div>
        }
      </div>

      <PromptTester
        onPromptChange={setCustomPrompt}
        hasChanges={hasPromptChanges}
        setHasChanges={setHasPromptChanges}
      />
    </>
  );
}
