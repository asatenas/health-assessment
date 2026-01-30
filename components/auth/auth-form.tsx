import Form from 'next/form';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

export function AuthForm({
  action,
  children,
  defaultEmail = '',
  showPasswordConfirmation = false,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  showPasswordConfirmation?: boolean;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          {/* English: 'Email Address' */}
          Endereço de e-mail
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm"
          type="email"
          // English: 'user@acme.com'
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
          {/* English: 'Password' */}
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

      {showPasswordConfirmation && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="confirmPassword"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            {/* English: 'Confirm Password' */}
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
      )}

      {children}
    </Form>
  );
}
