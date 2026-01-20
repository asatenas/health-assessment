import {
  useCallback,
  type Dispatch,
  type SetStateAction,
  type RefObject,
} from 'react';
import { useWindowSize } from 'usehooks-ts';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { Attachment, ChatMessage } from '@/lib/shared/types';

export function useFormSubmission(
  chatId: string,
  input: string,
  setInput: Dispatch<SetStateAction<string>>,
  attachments: Array<Attachment>,
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>,
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'],
  setLocalStorageInput: (value: string) => void,
  textareaRef: RefObject<HTMLTextAreaElement>,
  wasAutoStopped: boolean,
  setWasAutoStopped: Dispatch<SetStateAction<boolean>>,
) {
  const { width } = useWindowSize();

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
    textareaRef,
  ]);

  const handleConfirmTranscription = useCallback(
    (confirmedText: string) => {
      setInput(confirmedText);

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

  return {
    submitForm,
    handleConfirmTranscription,
  };
}
