'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

import { AuthForm } from '@/components/modules/auth/auth-form';
import { SubmitButton } from '@/components/shared/submit-button';

import { register, type RegisterActionState } from '../actions';
import { toast } from '@/components/shared/toast';
import { useSession } from 'next-auth/react';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: 'idle',
    },
  );

  const { update: updateSession } = useSession();

  useEffect(() => {
    if (state.status === 'user_exists') {
      // English: 'Account already exists!'
      toast({ type: 'error', description: 'Conta já existe!' });
    } else if (state.status === 'failed') {
      // English: 'Failed to create account!'
      toast({ type: 'error', description: 'Falha ao criar a conta!' });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        // English: 'Failed validating your submission!'
        description: 'Falha na validação do seu envio!',
      });
    } else if (state.status === 'success') {
      // English: 'Account created successfully!'
      // toast({ type: 'success', description: 'Conta criada com sucesso!' });
      toast({
        type: 'success',
        description:
          'Conta criada com sucesso. Nosso time foi notificado e realizará a verificação do email.',
      });

      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">
            {/* English: 'Sign Up' */}
            Cadastre-se
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {/* English: 'Create an account with your email and password' */}
            Crie uma conta com seu e-mail e senha
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>
            {/* English: 'Sign Up' */}
            Cadastre-se
          </SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {/* English: 'Already have an account? ' */} Já tem uma conta?{' '}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              {/* English: 'Sign in' */} Entrar
            </Link>{' '}
            {/* English: 'instead.' */} em vez disso.
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
