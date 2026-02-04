'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Info, AlertTriangle } from 'lucide-react';

interface ChangePasswordFormProps {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  error: string | null;
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Primeiro Acesso</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Por favor, altere sua senha temporária para continuar
        </p>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            Para sua segurança, você precisa criar uma nova senha antes de
            acessar o sistema.
          </AlertDescription>
        </Alert>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Temporária</Label>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Digite sua nova senha (mínimo 6 caracteres)"
              disabled={isValidating}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              placeholder="Digite novamente sua nova senha"
              disabled={isValidating}
              required
              minLength={6}
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
        </form>
      </CardContent>
    </Card>
  );
}
