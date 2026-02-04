'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';

interface ChangePasswordFormProps {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error?: string;
  isValidating: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChangePasswordForm({
  email,
  currentPassword,
  newPassword,
  confirmPassword,
  error,
  isValidating,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
}: ChangePasswordFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            readOnly
            className="bg-muted text-md md:text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="current-password"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Senha Temporária
          </Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => onCurrentPasswordChange(e.target.value)}
            placeholder="Digite a senha temporária que você recebeu"
            disabled={isValidating}
            required
            minLength={6}
            autoFocus
            className="bg-muted text-md md:text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="new-password"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Nova Senha
          </Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.target.value)}
            placeholder="Digite sua nova senha (mínimo 6 caracteres)"
            disabled={isValidating}
            required
            minLength={6}
            className="bg-muted text-md md:text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="confirm-password"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Confirmar Nova Senha
          </Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="Digite novamente sua nova senha"
            disabled={isValidating}
            required
            minLength={6}
            className="bg-muted text-md md:text-sm"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <Info className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isValidating} className="w-full">
          {isValidating && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isValidating ? 'Validando...' : 'Continuar'}
        </Button>
      </div>
    </form>
  );
}
