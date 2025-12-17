'use client';

import { DefaultChatTransport } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ChatHeader } from '@/components/chat/chat-header';
import type { Vote } from '@/lib/db/schema';
import {
  fetcher,
  fetchWithErrorHandlers,
  generateUUID,
} from '@/lib/shared/utils';
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
import { PreChatForm } from './pre-chat-form';
import { NPSEvaluation } from './nps-evaluation';

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

  const { data: votes } = useSWR<Array<Vote>>(null, fetcher);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  function formatPacienteInfo(paciente: any) {
    const {
      idade,
      peso,
      altura,
      alergiaLatex,
      alergias,
      marcaPasso,
      cdi,
      bombaMedicamentos,
      dispositivosOutros,
      itensUso,
      itensUsoOutros,
      drogasRecreativas,
      drogasRecreativasOutros,
      exames,
    } = paciente;

    const formatBool = (value: boolean) => (value ? 'Sim' : 'Não');

    const infoBasica = [
      `Idade: ${idade || '—'} anos`,
      `Peso: ${peso || '—'} kg`,
      `Altura: ${altura || '—'} m`,
    ].join(' | ');

    const alergiasTexts = [`Alergia a látex: ${formatBool(alergiaLatex)}`];
    if (alergias) {
      alergiasTexts.push(`Outras: ${alergias}`);
    }
    const alergiasTxt = `Alergias: ${alergiasTexts.join(' | ')}`;

    const dispositivos = [
      `Dispositivos: Marca-passo: ${formatBool(marcaPasso)}`,
      `CDI: ${formatBool(cdi)}`,
      `Bomba de medicamentos: ${formatBool(bombaMedicamentos)}`,
    ];
    if (dispositivosOutros) {
      dispositivos.push(`Outros: ${dispositivosOutros}`);
    }
    const dispositivosTxt = dispositivos.join(' | ');

    const itensLabels: any = {
      megaHair: 'Mega Hair',
      apliques: 'Apliques',
      unhaGel: 'Unha de Gel',
      ciliosPosticos: 'Cílios Postiços',
      piercings: 'Piercings',
      lenteContato: 'Lente de contato',
    };

    const itensUsoParts = itensUso
      ? Object.entries(itensUso).map(
          ([key, value]) =>
            `• ${itensLabels[key]}: ${formatBool(value as boolean)}`,
        )
      : [];

    if (itensUsoOutros) {
      itensUsoParts.push(`• Outros: ${itensUsoOutros}`);
    }

    const itensUsoTxt =
      itensUsoParts.length > 0
        ? `Itens de uso: ${itensUsoParts.join(' | ')}`
        : '';

    const drogasLabels: any = {
      cocaina: 'Cocaína',
      maconha: 'Maconha',
      crack: 'Crack',
      opiaceos: 'Opiáceos',
      metanfetamina: 'Metanfetamina',
    };

    const drogasRecreativasParts = drogasRecreativas
      ? Object.entries(drogasRecreativas).map(
          ([key, value]) =>
            `• ${drogasLabels[key]}: ${formatBool(value as boolean)}`,
        )
      : [];

    if (drogasRecreativasOutros) {
      drogasRecreativasParts.push(`• Outros: ${drogasRecreativasOutros}`);
    }

    const drogasRecreativasTxt =
      drogasRecreativasParts.length > 0
        ? `Drogas recreativas: ${drogasRecreativasParts.join(' | ')}`
        : '';

    const unidades: Record<string, string> = {
      hemoglobina: 'g/dL',
      creatinina: 'mg/dL',
      ecocardiograma: '',
    };

    const examesTxt = `Exames: ${Object.entries(exames)
      .map(([key, dados]) => {
        const nome = key.charAt(0).toUpperCase() + key.slice(1);
        const dadosTyped = dados as { valor?: string; tipo: string };
        return `${nome}: ${dadosTyped.valor || '—'} ${unidades[key]}`;
      })
      .join(' | ')}`;

    const sections = [infoBasica, alergiasTxt, dispositivosTxt, examesTxt];

    if (itensUsoTxt) {
      sections.splice(3, 0, itensUsoTxt);
    }

    if (drogasRecreativasTxt) {
      sections.splice(itensUsoTxt ? 4 : 3, 0, drogasRecreativasTxt);
    }

    return sections.join(' | ');
  }

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

        {hasCompletedForm && (
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
        )}
      </div>
    </>
  );
}
