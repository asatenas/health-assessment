'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/ui/toast';

import { AuthForm } from '@/components/auth/auth-form';
import { SubmitButton } from '@/components/auth/submit-button';

import { login, type LoginActionState } from '../actions';
import { useSession } from 'next-auth/react';

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
    if (state.status === 'failed') {
      // English: 'Invalid credentials or email not verified. Please contact support if you need verification.'
      toast({
        type: 'error',
        description:
          'Credenciais inválidas ou e-mail não verificado. Contate suporte@asatenas.com.br se precisar de verificação.',
      });
    } else if (state.status === 'invalid_data') {
      // English: 'Failed validating your submission!'
      toast({
        type: 'error',
        description: 'Falha na validação do seu envio!',
      });
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      (async () => {
        await updateSession();
        router.push('/dashboard');
      })();
    }
    // Reset status back to idle after showing error
    state.status = 'idle';
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            {/* English: 'Sign In' */}
            Entrar
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {/* English: 'Use your email and password to sign in' */}
            Use seu e-mail e senha para entrar
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>
            {/* English: 'Sign in' */}
            Entrar
          </SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {/* English: "Don't have an account? " */} Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              {/* English: 'Sign up' */} Cadastre-se
            </Link>{' '}
            {/* English: 'for free.' */} grátis.
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
