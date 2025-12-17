// import { useSWRConfig } from 'swr';
// import { useCopyToClipboard } from 'usehooks-ts';

// import type { Vote } from '@/lib/db/schema';

// import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from './icons';
import { SpeakerIcon } from '../../shared/icons';
import { Actions, Action } from '../../elements/actions';
import { memo, useEffect, useState } from 'react';
// import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/shared/types';
import { speakText } from '@/lib/chat/tts';

export function PureMessageActions({
  chatId,
  message,
  // vote,
  isLoading,
}: {
  chatId: string;
  message: ChatMessage;
  // vote: Vote | undefined;
  isLoading: boolean;
}) {
  // const { mutate } = useSWRConfig();
  // const [_, copyToClipboard] = useCopyToClipboard();
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
      {/* <Action
          tooltip="Copy"
          onClick={async () => {
            const textFromParts = message.parts
              ?.filter((part) => part.type === 'text')
              .map((part) => part.text)
              .join('\n')
              .trim();

            if (!textFromParts) {
              toast.error("There's no text to copy!");
              return;
            }

            await copyToClipboard(textFromParts);
            toast.success('Copied to clipboard!');
          }}
        >
          <CopyIcon />
        </Action>

        <Action
          tooltip="Upvote Response"
          data-testid="message-upvote"
          disabled={vote?.isUpvoted}
              onClick={async () => {
                const upvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId: message.id,
                    type: 'up',
                  }),
                });

                toast.promise(upvote, {
                  loading: 'Upvoting Response...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.messageId !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            isUpvoted: true,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return 'Upvoted Response!';
                  },
                  error: 'Failed to upvote response.',
                });
              }}
        >
          <ThumbUpIcon />
        </Action>

        <Action
          tooltip="Downvote Response"
          data-testid="message-downvote"
          disabled={vote && !vote.isUpvoted}
              onClick={async () => {
                const downvote = fetch('/api/vote', {
                  method: 'PATCH',
                  body: JSON.stringify({
                    chatId,
                    messageId: message.id,
                    type: 'down',
                  }),
                });

                toast.promise(downvote, {
                  loading: 'Downvoting Response...',
                  success: () => {
                    mutate<Array<Vote>>(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (vote) => vote.messageId !== message.id,
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            isUpvoted: false,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    return 'Downvoted Response!';
                  },
                  error: 'Failed to downvote response.',
                });
              }}
        >
          <ThumbDownIcon />
        </Action> */}
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
