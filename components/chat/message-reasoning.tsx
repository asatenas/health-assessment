'use client';

import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from '../elements/reasoning';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoningText: string;
}

export function MessageReasoning({
  isLoading,
  reasoningText,
}: MessageReasoningProps) {
  return (
    <Reasoning
      isStreaming={isLoading}
      defaultOpen={true}
      data-testid="message-reasoning"
    >
      <ReasoningTrigger />
      <ReasoningContent>{reasoningText}</ReasoningContent>
    </Reasoning>
  );
}
