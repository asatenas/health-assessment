import { SpeakerIcon } from '../../ui/icons';
import { Actions, Action } from '../../elements/actions';
import { memo, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/shared/types';
import { speakText } from '@/lib/chat/tts';

export function PureMessageActions({
  chatId,
  message,
  isLoading,
}: {
  chatId: string;
  message: ChatMessage;
  isLoading: boolean;
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textFromParts, setTextFromParts] = useState('');

  useEffect(() => {
    setTextFromParts(
      message.parts
        ?.filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('\n')
        .trim(),
    );
  }, [message]);

  if (isLoading) return null;
  if (message.role === 'user') return null;

  return (
    <Actions>
      {textFromParts && (
        <Action
          tooltip="Ouvir"
          disabled={isSpeaking}
          onClick={async () => {
            setIsSpeaking(true);
            try {
              await speakText(textFromParts, chatId);
            } catch (error) {
              console.error('TTS error:', error);
              toast.error('Erro ao reproduzir o áudio. Tente novamente.');
            } finally {
              setIsSpeaking(false);
            }
          }}
        >
          <SpeakerIcon />
        </Action>
      )}
    </Actions>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    // if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
