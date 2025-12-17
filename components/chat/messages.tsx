import { PreviewMessage } from './message';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { useMessages } from '@/hooks/use-messages';
import type { ChatMessage } from '@/lib/shared/types';
import { useDataStream } from '../providers/data-stream-provider';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '../elements/conversation';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<ChatMessage>['status'];
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
}

function PureMessages({
  chatId,
  status,
  messages,
  setMessages,
  regenerate,
  isReadonly,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  useDataStream();

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
      <Conversation className="flex flex-col min-w-0 gap-2 pt-4 pb-2 px-4 max-w-4xl mx-auto">
        <ConversationContent className="flex flex-col gap-2">
          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={chatId}
              message={message}
              status={status}
              isLoading={
                messages.length - 1 === index && // only check status from the last message
                (status === 'submitted' || status === 'streaming')
              }
              setMessages={setMessages}
              regenerate={regenerate}
              isReadonly={isReadonly}
              requiresScrollPadding={
                hasSentMessage && index === messages.length - 1
              }
            />
          ))}

          <motion.div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px]"
            onViewportLeave={onViewportLeave}
            onViewportEnter={onViewportEnter}
          />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return false;
});
