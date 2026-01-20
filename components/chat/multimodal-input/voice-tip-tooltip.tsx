import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { ChatMessage } from '@/lib/shared/types';

interface VoiceTipTooltipProps {
  hasSeenVoiceTip: boolean;
  setHasSeenVoiceTip: (value: boolean) => void;
  isRecording: boolean;
  isTranscribing: boolean;
  input: string;
  uploadQueue: Array<string>;
  attachmentsLength: number;
  status: UseChatHelpers<ChatMessage>['status'];
}

export function VoiceTipTooltip({
  hasSeenVoiceTip,
  setHasSeenVoiceTip,
  isRecording,
  isTranscribing,
  input,
  uploadQueue,
  attachmentsLength,
  status,
}: VoiceTipTooltipProps) {
  return (
    <AnimatePresence>
      {!hasSeenVoiceTip &&
        !isRecording &&
        !isTranscribing &&
        (!input.trim() || uploadQueue.length > 0) &&
        attachmentsLength === 0 &&
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
  );
}
