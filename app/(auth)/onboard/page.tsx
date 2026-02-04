'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/toast';
import { OnboardingSection } from '@/components/auth/onboarding-section';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import {
  completeOnboarding,
  type CompleteOnboardingState,
} from '@/app/(auth)/actions';

export default function OnboardPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
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
        description: 'Cadastro completo! Bem-vindo.',
      });
      update({ trigger: 'update' }).then(() => {
        router.push('/dashboard');
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
  }, [state.status, update, router, isSuccessful]);

  return (
    <>
      <OnboardingSection>
        <OnboardingForm
          onSubmit={formAction}
          isPending={isPending}
          isSuccessful={isSuccessful}
          showClinicName={session?.user?.role === 'owner'}
          errors={state.errors}
        />
      </OnboardingSection>
    </>
  );
}
