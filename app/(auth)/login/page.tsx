'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, Suspense } from 'react';
import { toast } from '@/components/ui/toast';

import { AuthForm } from '@/components/auth/auth-form';
import { SubmitButton } from '@/components/auth/submit-button';
import { PasswordChangedNotification } from '@/components/auth/password-changed-notification';

import { login, type LoginActionState } from '../actions';
import { useSession } from 'next-auth/react';
import { OnboardingSection } from '@/components/auth/onboarding-section';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    switch (state.status) {
      case 'success':
        setIsSuccessful(true);
        updateSession();
        router.push('/dashboard');
        return;
      case 'email_not_verified':
        // English: 'Email not verified. Send an email to suporte@asatenas.com.br for verification.'
        toast({
          type: 'error',
          description:
            'E-mail não verificado. Envie um email para suporte@asatenas.com.br para verificação do email.',
        });
        break;
      case 'clinic_not_authorized':
        // English: 'Clinic not verified. Send an email to suporte@asatenas.com.br for verification.';
        toast({
          type: 'error',
          description:
            'Usuário não verificado. Envie um email para suporte@asatenas.com.br para verificação do email.',
        });
        break;
      case 'failed':
        // English: 'Invalid credentials!'
        toast({
          type: 'error',
          description: 'Credenciais inválidas!',
        });
        break;
    }
    // Reset status back to idle after showing error
    state.status = 'idle';
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <OnboardingSection
      title="Entrar"
      description="Use seu e-mail e senha para entrar"
    >
      <Suspense fallback={null}>
        <PasswordChangedNotification />
      </Suspense>

      <AuthForm action={handleSubmit} defaultEmail={email}>
        <SubmitButton isSuccessful={isSuccessful}>Entrar</SubmitButton>
        <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
          Não tem uma conta?
          <Link
            href="/register"
            className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          >
            {' '}
            Cadastre-se{' '}
          </Link>
          grátis
        </p>
      </AuthForm>
    </OnboardingSection>
  );
}
