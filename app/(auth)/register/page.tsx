'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { toast } from '@/components/ui/toast';
import { RegisterForm } from '@/components/auth/register-form';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import { OnboardingSection } from '@/components/auth/onboarding-section';
import {
  validateRegistrationStep1,
  completeRegistration,
  type ValidateStep1State,
  type CompleteRegistrationState,
} from '../actions';

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step1IsSuccessful, setStep1IsSuccessful] = useState(false);
  const [step1State, step1Action, isStep1Pending] = useActionState<
    ValidateStep1State,
    FormData
  >(validateRegistrationStep1, { status: 'idle' });

  // Step 2 state
  const [step2IsSuccessful, setStep2IsSuccessful] = useState(false);
  const [step2State, step2Action, isStep2Pending] = useActionState<
    CompleteRegistrationState,
    FormData
  >(completeRegistration, { status: 'idle' });

  // Handle step 1 validation result
  useEffect(() => {
    if (step1State.status === 'user_exists') {
      toast({ type: 'error', description: 'Conta já existe!' });
    } else if (step1State.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Falha na validação. Verifique os campos.',
      });
    } else if (step1State.status === 'success') {
      setStep1IsSuccessful(true);
      setStep(2);
    }
  }, [step1State]);

  // Handle step 2 registration result
  useEffect(() => {
    if (step2State.status === 'failed') {
      toast({ type: 'error', description: 'Falha ao criar a conta!' });
    } else if (step2State.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Falha na validação. Verifique os campos.',
      });
    } else if (step2State.status === 'success') {
      setStep2IsSuccessful(true);
      toast({
        type: 'success',
        description:
          'Conta criada com sucesso! Aguarde a autorização da clínica. Você receberá um e-mail quando sua conta for ativada.',
      });
      setTimeout(() => router.push('/login'), 2000);
    }
  }, [step2State, router]);

  const handleStep1Submit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    setPassword(formData.get('password') as string);
    setConfirmPassword(formData.get('confirmPassword') as string);
    step1Action(formData);
  };

  const handleStep2Submit = (formData: FormData) => {
    // Add step 1 data
    formData.set('email', email);
    formData.set('password', password);

    // Step 2 data is already added by OnboardingForm component
    step2Action(formData);
  };

  return step === 1 ? (
    <OnboardingSection
      title="Cadastre-se"
      description="Crie uma conta com seu e-mail e senha"
      wide={false}
    >
      <RegisterForm
        onSubmit={handleStep1Submit}
        isPending={isStep1Pending}
        isSuccessful={step1IsSuccessful}
        defaultEmail={email}
      />
    </OnboardingSection>
  ) : (
    <OnboardingSection>
      <OnboardingForm
        onSubmit={handleStep2Submit}
        isPending={isStep2Pending}
        isSuccessful={step2IsSuccessful}
        showClinicName={true}
        errors={step2State.errors}
      />
    </OnboardingSection>
  );
}
