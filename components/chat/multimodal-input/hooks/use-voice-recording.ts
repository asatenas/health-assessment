import {
  useState,
  useCallback,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toast } from 'sonner';
import {
  VoiceRecorder,
  requestMicrophonePermission,
} from '@/lib/chat/voice-recording';
import { stopSpeaking } from '@/lib/chat/tts';

export function useVoiceRecording(
  chatId: string,
  setInput: Dispatch<SetStateAction<string>>,
) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceRecorder] = useState(() => new VoiceRecorder());
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);
  const [pendingTranscription, setPendingTranscription] = useState('');
  const [hasSeenVoiceTip, setHasSeenVoiceTip] = useState(false);

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

  const handleCloseTranscriptionModal = useCallback(() => {
    setShowTranscriptionModal(false);
  }, []);

  const handleDiscardTranscription = useCallback(() => {
    setPendingTranscription('');
  }, []);

  return {
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
  };
}
