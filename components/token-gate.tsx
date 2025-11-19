'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/toast';

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
          description: 'Invalid token. Please check and try again.',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to verify token',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            Enter Access Token
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Please enter the token provided by your clinic to access this chat
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4 sm:px-16"
        >
          <div>
            <Input
              type="text"
              placeholder="Enter token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              className="w-full"
              disabled={isVerifying}
            />
          </div>
          <Button type="submit" disabled={isVerifying || !token}>
            {isVerifying ? 'Verifying...' : 'Access Chat'}
          </Button>
        </form>
      </div>
    </div>
  );
}
