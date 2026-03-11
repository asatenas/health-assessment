'use client';

import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';

type NewChatBannerProps = {
  chatId: string;
  token: string;
  url: string;
  onClose: () => void;
};

export function NewChatBanner({ chatId, token, url, onClose }: NewChatBannerProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ type: 'success', description: 'Copiado para a área de transferência!' });
    } catch {
      toast({
        type: 'error',
        description: 'Falha ao copiar para a área de transferência. Verifique as permissões do navegador.',
      });
    }
  };

  return (
    <div className="mb-8 p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Nova avaliação criada</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="space-y-3">
        {[
          { label: 'ID da avaliação', value: chatId },
          { label: 'Token', value: token },
          { label: 'URL do paciente', value: url },
        ].map(({ label, value }) => (
          <div key={label}>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mt-1 items-center sm:items-stretch">
              <code className="w-full sm:flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm break-all">
                {value}
              </code>
              <Button
                onClick={() => copyToClipboard(value)}
                variant="outline"
                size="sm"
                className="w-auto"
              >
                Copiar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
