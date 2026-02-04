'use client';

import Link from 'next/link';
import Form from 'next/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface RegisterFormProps {
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  isSuccessful: boolean;
  defaultEmail?: string;
}

export function RegisterForm({
  onSubmit,
  isPending,
  isSuccessful,
  defaultEmail = '',
}: RegisterFormProps) {
  return (
    <Form action={onSubmit} className="flex flex-col gap-6 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Endereço de e-mail
        </Label>
        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          placeholder="usuario@exemplo.com"
          autoComplete="email"
          required
          autoFocus
          defaultValue={defaultEmail}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Senha
        </Label>
        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
          minLength={6}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="confirmPassword"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Confirmar Senha
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          className="bg-muted text-md md:text-sm"
          type="password"
          required
          minLength={6}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending || isSuccessful ? 'Verificando...' : 'Cadastrar'}
      </Button>

      <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
        Já tem uma conta?{' '}
        <Link
          href="/login"
          className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
        >
          Entrar
        </Link>{' '}
        em vez disso.
      </p>
    </Form>
  );
}
