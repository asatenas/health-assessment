'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from '@/components/ui/toast';

export function PasswordChangedNotification() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('passwordChanged') === 'true') {
      toast({
        type: 'success',
        description:
          'Senha alterada com sucesso! Por favor, faça login com sua nova senha.',
      });
      router.replace('/login');
    }
  }, [searchParams, router]);

  return null;
}
