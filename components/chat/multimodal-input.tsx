'use client';

import { useRef, useEffect, useState, memo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import equal from 'fast-deep-equal';

import { ArrowUpIcon } from '../ui/icons';
import { PreviewAttachment } from './preview-attachment';
import { SuggestedActions } from './suggested-actions';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
} from '../elements/prompt-input';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { VoiceTranscriptionModal } from './voice-transcription-modal';

import type { MultimodalInputProps } from './multimodal-input/types';
import { useFileUpload } from './multimodal-input/hooks/use-file-upload';
import { useVoiceRecording } from './multimodal-input/hooks/use-voice-recording';
import { useFormSubmission } from './multimodal-input/hooks/use-form-submission';
import { ScrollToBottomButton } from './multimodal-input/scroll-to-bottom-button';
import { VoiceTipTooltip } from './multimodal-input/voice-tip-tooltip';
import { StopButton } from './multimodal-input/stop-button';
import { VoiceRecordButton } from './multimodal-input/voice-record-button';

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
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  const [wasAutoStopped, setWasAutoStopped] = useState(false);

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

  // File upload hook
  const { uploadQueue, handleFileChange } = useFileUpload(setAttachments);

  // Voice recording hook
  const {
    isRecording,
    isTranscribing,
    hasSeenVoiceTip,
    setHasSeenVoiceTip,
    showTranscriptionModal,
    pendingTranscription,
    handleVoiceRecording,
    handleCloseTranscriptionModal,
    handleDiscardTranscription,
    setPendingTranscription,
  } = useVoiceRecording(chatId, setInput);

  // Form submission hook
  const { submitForm, handleConfirmTranscription } = useFormSubmission(
    chatId,
    input,
    setInput,
    attachments,
    setAttachments,
    sendMessage,
    setLocalStorageInput,
    textareaRef,
    wasAutoStopped,
    setWasAutoStopped,
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div className="flex relative flex-col gap-4 w-full">
      <ScrollToBottomButton
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
      />

      <VoiceTipTooltip
        hasSeenVoiceTip={hasSeenVoiceTip}
        setHasSeenVoiceTip={setHasSeenVoiceTip}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        input={input}
        uploadQueue={uploadQueue}
        attachmentsLength={attachments.length}
        status={status}
      />

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
            {/* <ModelSelectorCompact selectedModelId={selectedModelId} /> */}
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
        onConfirm={(text) => {
          handleConfirmTranscription(text);
          setPendingTranscription('');
        }}
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
