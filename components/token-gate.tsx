'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/toast';
import { ChatHeader } from '@/components/chat-header';

export function TokenGate({ chatId }: { chatId: string }) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, token }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        toast({
          type: 'error',
          // English: 'Invalid token. Please check and try again.'
          description: 'Token inválido. Verifique e tente novamente.',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        // English: 'Failed to verify token'
        description: 'Falha ao verificar o token',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative h-dvh w-screen bg-background">
      <div className="absolute top-0 inset-x-0 z-10">
        <ChatHeader />
      </div>
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">
              {/* English: 'Enter Access Token' */} Inserir token de acesso
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {/* English: 'Please enter the token provided by your clinic to access this chat' */}
              Insira o token fornecido pela sua clínica para acessar a avaliação
              pré-operatória
            </p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-4 sm:px-16"
          >
            <div>
              <Input
                type="text"
                // English: 'Enter token'
                placeholder="Insira o token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full"
                disabled={isVerifying}
              />
            </div>
            <Button type="submit" disabled={isVerifying || !token}>
              {isVerifying
                ? // English: 'Verifying...'
                  'Verificando...'
                : // English: 'Access'
                  'Acessar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
