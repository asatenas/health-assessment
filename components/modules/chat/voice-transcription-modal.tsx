'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Textarea } from '../../ui/textarea';
import { MicrophoneIcon } from '../../shared/icons';

interface VoiceTranscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
  onDiscard: () => void;
  transcription: string;
}

const CheckIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const XIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export function VoiceTranscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  onDiscard,
  transcription,
}: VoiceTranscriptionModalProps) {
  const [editedText, setEditedText] = useState(transcription);

  // Update edited text when transcription changes
  useEffect(() => {
    setEditedText(transcription);
  }, [transcription]);

  // Prevent viewport jumping on mobile
  useEffect(() => {
    if (isOpen) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Add a class to help with mobile viewport handling
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(editedText.trim());
    onClose();
  };

  const handleDiscard = () => {
    onDiscard();
    onClose();
  };

  const handleClose = () => {
    setEditedText(transcription); // Reset to original transcription
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md max-w-[95vw] max-h-[90vh] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MicrophoneIcon size={20} />
            Transcrição de Voz
          </AlertDialogTitle>
          <AlertDialogDescription>
            Revise o texto transcrito abaixo. Você pode editá-lo antes de enviar
            ou descartar a gravação.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-hidden">
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Texto transcrito aparecerá aqui..."
            className="min-h-[120px] max-h-[200px] resize-none w-full focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus={false}
          />
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleDiscard}
            className="flex items-center gap-2"
          >
            <XIcon size={16} />
            Descartar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!editedText.trim()}
            className="flex items-center gap-2"
          >
            <CheckIcon size={16} />
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
