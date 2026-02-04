'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

import { toast } from '@/components/ui/toast';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import {
  completeOnboarding,
  type CompleteOnboardingState,
} from '@/app/(auth)/actions';

export default function OnboardPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction, isPending] = useActionState<
    CompleteOnboardingState,
    FormData
  >(completeOnboarding, { status: 'idle' });

  useEffect(() => {
    if (state.status === 'success' && !isSuccessful) {
      setIsSuccessful(true);
      toast({
        type: 'success',
        description:
          'Cadastro completo! Você será desconectado para fazer login com sua nova senha.',
      });
      // Wait for session update before navigating to avoid redirect loop
      updateSession({ trigger: 'update' }).then(() => {
        setTimeout(() => router.push('/dashboard'), 2000);
      });
    } else if (state.status === 'failed') {
      toast({
        type: 'error',
        description: 'Erro ao completar cadastro. Tente novamente.',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Por favor, verifique os campos e tente novamente.',
      });
    }
  }, [state.status, updateSession, router, isSuccessful]);

  // Show loading state when redirecting to dashboard
  if (isSuccessful) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16 mb-8">
          <h3 className="text-2xl font-semibold dark:text-zinc-50">
            Complete seu cadastro
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Precisamos de algumas informações para personalizar sua experiência
          </p>
        </div>

        <OnboardingForm
          onSubmit={formAction}
          isPending={isPending}
          isSuccessful={isSuccessful}
          showClinicName={session?.user?.role === 'owner'}
          errors={state.errors}
        />
      </div>
    </div>
  );
}
