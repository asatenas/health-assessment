import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { StopIcon } from '@/components/ui/icons';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/shared/types';

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

export const StopButton = memo(PureStopButton);
