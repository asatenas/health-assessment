'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [open, onOpenChange]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={() => onOpenChange(false)}
        aria-label="Close modal"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-semibold">Como Usar</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Fechar"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content - PDF Viewer with controls */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src="/web/viewer.html?file=/help/manual.pdf"
            className="size-full border-0"
            title="Manual de Ajuda"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 sm:p-6 border-t dark:border-gray-800">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
