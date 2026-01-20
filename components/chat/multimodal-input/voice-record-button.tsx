import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { MicrophoneIcon, LoaderIcon } from '@/components/ui/icons';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/shared/types';

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

export const VoiceRecordButton = memo(PureVoiceRecordButton);
