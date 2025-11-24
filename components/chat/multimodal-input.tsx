'use client';

import type { UIMessage } from 'ai';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import {
  ArrowUpIcon,
  PaperclipIcon,
  StopIcon,
  MicrophoneIcon,
  LoaderIcon,
} from '../ui/icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from '../ui/button';
import { SuggestedActions } from './suggested-actions';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
} from '../elements/prompt-input';
import { SelectItem } from '@/components/ui/select';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, X } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { Attachment, ChatMessage } from '@/lib/shared/types';
import { chatModels } from '@/lib/ai/models';
import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { startTransition } from 'react';
import {
  VoiceRecorder,
  requestMicrophonePermission,
} from '@/lib/chat/voice-recording';
import { VoiceTranscriptionModal } from './voice-transcription-modal';
import { stopSpeaking } from '@/lib/chat/tts';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  selectedModelId,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedModelId: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    // If AI is processing and user starts typing, stop the AI
    if (status === 'submitted' || status === 'streaming') {
      stop();
      setWasAutoStopped(true);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  // Track if AI was auto-stopped by user typing
  const [wasAutoStopped, setWasAutoStopped] = useState(false);

  // Cleanup sequential assistant messages when response completes
  useEffect(() => {
    if (status === 'ready' && messages.length >= 2) {
      // Check if there are multiple sequential assistant messages
      let sequentialAssistantCount = 0;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
          sequentialAssistantCount++;
        } else {
          break; // Stop when we hit a non-assistant message
        }
      }

      // If there's more than 1 sequential assistant message, cleanup the extras (keep most recent)
      if (sequentialAssistantCount > 1) {
        fetch('/api/chat/cleanup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, mode: 'sequential' }),
        }).catch((error) => {
          console.error(
            'Failed to cleanup sequential assistant messages:',
            error,
          );
        });
      }
    }
  }, [status, messages, chatId]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorder] = useState(() => new VoiceRecorder());
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Transcription modal state
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const [pendingTranscription, setPendingTranscription] = useState('');

  // Voice tip state
  const [hasSeenVoiceTip, setHasSeenVoiceTip] = useState(false);

  const submitForm = useCallback(async () => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // If user interrupted AI, cleanup partial messages in background (don't await)
    if (wasAutoStopped) {
      fetch('/api/chat/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId }),
      }).catch((error) => {
        console.error('Failed to cleanup partial messages:', error);
      });
    }

    sendMessage({
      role: 'user',
      parts: [
        ...attachments.map((attachment) => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: 'text',
          text: input
            ? input
            : attachments.map((attachment) => attachment.name).join(' '),
        },
      ],
    });

    setAttachments([]);
    setLocalStorageInput('');
    setInput('');
    setWasAutoStopped(false);

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    wasAutoStopped,
    setWasAutoStopped,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      // English: 'Failed to upload file, please try again!'
      toast.error('Falha ao enviar o arquivo, por favor tente novamente!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  // Voice recording handlers
  const handleVoiceRecording = useCallback(async () => {
    // Dismiss the voice tip when user clicks the microphone
    if (!hasSeenVoiceTip) {
      setHasSeenVoiceTip(true);
    }

    if (isRecording) {
      // Stop recording
      voiceRecorder.stopRecording();
      return;
    }

    // Stop any ongoing text-to-speech before recording
    stopSpeaking();

    // Request microphone permission (this will show the browser permission dialog)
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      toast.error(
        'Acesso ao microfone negado. Por favor, permita o acesso ao microfone nas configurações do navegador.',
      );
      return;
    }

    // Start recording
    voiceRecorder.startRecording();
  }, [isRecording, voiceRecorder, hasSeenVoiceTip, setHasSeenVoiceTip]);

  // Set up voice recorder callbacks
  useEffect(() => {
    voiceRecorder.options = {
      onRecordingStart: () => {
        setIsRecording(true);
        toast.success('Gravação iniciada!');
      },
      onRecordingStop: () => {
        setIsRecording(false);
      },
      onDataAvailable: async (audioBlob) => {
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'voice-message.webm');
          formData.append('chatId', chatId);

          const response = await fetch('/api/voice-message', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Falha na transcrição');
          }

          const { transcription } = await response.json();

          // Show transcription in modal instead of directly setting input
          setPendingTranscription(transcription);
          setShowTranscriptionModal(true);
        } catch (error) {
          console.error('Voice transcription error:', error);
          toast.error('Erro ao transcrever o áudio. Tente novamente.');
        } finally {
          setIsTranscribing(false);
        }
      },
      onError: (error) => {
        console.error('Voice recording error:', error);
        toast.error('Erro na gravação. Tente novamente.');
        setIsRecording(false);
        setIsTranscribing(false);
      },
    };
  }, [chatId, voiceRecorder, setInput]);

  // Cleanup voice recorder on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        voiceRecorder.cancelRecording();
      }
    };
  }, [voiceRecorder, isRecording]);

  // Transcription modal handlers
  const handleConfirmTranscription = useCallback(
    (confirmedText: string) => {
      setInput(confirmedText);
      setPendingTranscription('');

      // Auto-send the confirmed transcription
      setTimeout(async () => {
        window.history.replaceState({}, '', `/chat/${chatId}`);

        // If user interrupted AI, cleanup partial messages in background (don't await)
        if (wasAutoStopped) {
          fetch('/api/chat/cleanup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chatId }),
          }).catch((error) => {
            console.error('Failed to cleanup partial messages:', error);
          });
        }

        sendMessage({
          role: 'user',
          parts: [
            ...attachments.map((attachment) => ({
              type: 'file' as const,
              url: attachment.url,
              name: attachment.name,
              mediaType: attachment.contentType,
            })),
            {
              type: 'text',
              text: confirmedText,
            },
          ],
        });

        setAttachments([]);
        setLocalStorageInput('');
        setInput('');
        setWasAutoStopped(false);

        if (width && width > 768) {
          textareaRef.current?.focus();
        }
      }, 100); // Small delay to ensure state updates
    },
    [
      setInput,
      chatId,
      sendMessage,
      attachments,
      setAttachments,
      setLocalStorageInput,
      width,
      textareaRef,
      wasAutoStopped,
      setWasAutoStopped,
    ],
  );

  const handleDiscardTranscription = useCallback(() => {
    setPendingTranscription('');
  }, []);

  const handleCloseTranscriptionModal = useCallback(() => {
    setShowTranscriptionModal(false);
  }, []);

  return (
    <div className="flex relative flex-col gap-4 w-full">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute bottom-28 left-1/2 z-50 -translate-x-1/2"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full hover:bg-accent hover:text-accent-foreground"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice tip tooltip */}
      <AnimatePresence>
        {!hasSeenVoiceTip &&
          !isRecording &&
          !isTranscribing &&
          (!input.trim() || uploadQueue.length > 0) &&
          attachments.length === 0 &&
          status === 'ready' && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              className="absolute bottom-[72px] right-0 z-50"
            >
              <div className="relative bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg max-w-[280px] text-sm">
                <button
                  type="button"
                  onClick={() => setHasSeenVoiceTip(true)}
                  className="absolute top-2 right-2 p-0.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Fechar dica"
                >
                  <X size={14} />
                </button>
                <p className="pr-4">
                  Prefere falar? Clique aqui e transforme sua voz em texto, no
                  idioma que você quiser!
                </p>
                {/* Arrow pointing down to the button */}
                <div className="absolute top-full right-6 size-0 border-x-8 border-t-8 border-x-transparent border-t-primary" />
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      <SuggestedActions
        sendMessage={sendMessage}
        chatId={chatId}
        disabled={status !== 'ready'}
      />

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <PromptInput
        className="bg-gray-50 rounded-3xl border border-gray-300 shadow-none transition-all duration-200 dark:bg-sidebar dark:border-sidebar-border hover:ring-1 hover:ring-primary/30 focus-within:ring-1 focus-within:ring-primary/50"
        onSubmit={(event) => {
          event.preventDefault();
          submitForm();
        }}
      >
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            data-testid="attachments-preview"
            className="flex overflow-x-scroll flex-row gap-2 items-end px-3 py-2"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment
                key={attachment.url}
                attachment={attachment}
                onRemove={() => {
                  setAttachments((currentAttachments) =>
                    currentAttachments.filter((a) => a.url !== attachment.url),
                  );
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  url: '',
                  name: filename,
                  contentType: '',
                }}
                isUploading={true}
              />
            ))}
          </div>
        )}

        <PromptInputTextarea
          data-testid="multimodal-input"
          ref={textareaRef}
          placeholder={
            (status === 'submitted' || status === 'streaming') &&
            !wasAutoStopped
              ? 'Digite para interromper a análise...'
              : 'Envie uma mensagem para continuar...'
          }
          value={input}
          onChange={handleInput}
          allowEmptySubmit={attachments.length > 0}
          className="text-sm resize-none p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-transparent !border-0 !border-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none !h-[36px] !min-h-[36px] md:!h-[48px] md:!min-h-[48px]"
          autoFocus
        />
        <PromptInputToolbar className="px-3 py-1 !border-t-0 !border-top-0 shadow-none dark:!border-transparent dark:border-0">
          <PromptInputTools className="gap-2">
            {/* <AttachmentsButton fileInputRef={fileInputRef} status={status} /> */}
            <ModelSelectorCompact selectedModelId={selectedModelId} />
          </PromptInputTools>
          {status === 'submitted' || status === 'streaming' ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (!input.trim() || uploadQueue.length > 0) &&
            attachments.length === 0 ? (
            <VoiceRecordButton
              isRecording={isRecording}
              isTranscribing={isTranscribing}
              onToggleRecording={handleVoiceRecording}
              status={status}
            />
          ) : (
            <PromptInputSubmit
              status={status}
              disabled={
                (!input.trim() || uploadQueue.length > 0) &&
                attachments.length === 0
              }
              className="p-2 text-foreground bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowUpIcon size={20} />
            </PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </PromptInput>

      <VoiceTranscriptionModal
        isOpen={showTranscriptionModal}
        onClose={handleCloseTranscriptionModal}
        onConfirm={handleConfirmTranscription}
        onDiscard={handleDiscardTranscription}
        transcription={pendingTranscription}
      />
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>['status'];
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureModelSelectorCompact({
  selectedModelId,
}: {
  selectedModelId: string;
}) {
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);

  const selectedModel = chatModels.find(
    (model) => model.id === optimisticModelId,
  );

  return (
    <PromptInputModelSelect
      value={selectedModel?.name}
      onValueChange={(modelName) => {
        const model = chatModels.find((m) => m.name === modelName);
        if (model) {
          setOptimisticModelId(model.id);
          startTransition(() => {
            saveChatModelAsCookie(model.id);
          });
        }
      }}
    >
      <PromptInputModelSelectTrigger
        type="button"
        className="text-xs focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=closed]:ring-0"
      >
        {selectedModel?.name ||
          /* English: 'Select model' */ 'Selecionar modelo'}
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {chatModels.map((model) => (
          <SelectItem key={model.id} value={model.name}>
            <div className="flex flex-col gap-1 items-start py-1">
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-muted-foreground">
                {model.description}
              </div>
            </div>
          </SelectItem>
        ))}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="p-3 text-foreground bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={20} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureVoiceRecordButton({
  isRecording,
  isTranscribing,
  onToggleRecording,
  status,
}: {
  isRecording: boolean;
  isTranscribing: boolean;
  onToggleRecording: () => void;
  status: UseChatHelpers<ChatMessage>['status'];
}) {
  const getButtonState = () => {
    if (isTranscribing)
      return { icon: <LoaderIcon size={20} />, tooltip: 'Transcrevendo...' };
    if (isRecording)
      return { icon: <MicrophoneIcon size={20} />, tooltip: 'Parar gravação' };
    return {
      icon: <MicrophoneIcon size={20} />,
      tooltip: 'Gravar mensagem de voz',
    };
  };

  const buttonState = getButtonState();

  return (
    <Button
      data-testid="voice-record-button"
      className={`p-3 rounded-full transition-colors ${
        isRecording
          ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          : 'text-foreground bg-secondary hover:bg-accent hover:text-accent-foreground'
      }`}
      onClick={(event) => {
        event.preventDefault();
        onToggleRecording();
      }}
      disabled={status !== 'ready' || isTranscribing}
      title={buttonState.tooltip}
    >
      {buttonState.icon}
    </Button>
  );
}

const VoiceRecordButton = memo(PureVoiceRecordButton);
