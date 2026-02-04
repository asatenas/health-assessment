'use client';

import { useState, useEffect, useActionState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { OnboardingForm } from '@/components/onboarding-form';
import {
  completeOnboarding,
  type CompleteOnboardingState,
} from '@/app/(auth)/onboard/actions';
import { validateAndHashPassword } from './actions';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state - Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hashedNewPassword, setHashedNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validatingPassword, setValidatingPassword] = useState(false);

  // Step 2 state - Onboarding
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction, isPending] = useActionState<
    CompleteOnboardingState,
    FormData
  >(completeOnboarding, { status: 'idle' });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    if (newPassword.length < 6) {
      setError('Nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Nova senha deve ser diferente da senha temporária');
      return;
    }

    // Validate password on server and get hash
    setValidatingPassword(true);
    try {
      const result = await validateAndHashPassword(
        currentPassword,
        newPassword,
      );

      if (result.status === 'failed') {
        setError(result.error || 'Erro ao validar senha');
        return;
      }

      if (result.hashedPassword) {
        setHashedNewPassword(result.hashedPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Move to step 2
        setStep(2);
      }
    } catch (error) {
      console.error('Error validating password:', error);
      setError('Erro ao validar senha');
    } finally {
      setValidatingPassword(false);
    }
  };

  // Handle onboarding completion (Step 2)
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

  const handleOnboardingSubmit = (formData: FormData) => {
    // Add the pre-hashed password and first access flag
    formData.set('hashedPassword', hashedNewPassword);
    formData.set('isFirstAccess', 'true'); // Flag to indicate this is first access flow
    formAction(formData);
  };

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show loading state when redirecting to dashboard
  if (isSuccessful) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {step === 1 ? (
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

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email || ''}
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
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite a senha temporária que você recebeu"
                  disabled={validatingPassword}
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
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                  disabled={validatingPassword}
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite novamente sua nova senha"
                  disabled={validatingPassword}
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

              <Button
                type="submit"
                disabled={validatingPassword}
                className="w-full"
              >
                {validatingPassword && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {validatingPassword ? 'Validando...' : 'Continuar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16 mb-8">
            <h3 className="text-2xl font-semibold dark:text-zinc-50">
              Primeiro Acesso
            </h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Precisamos de algumas informações para personalizar sua
              experiência
            </p>
          </div>

          <OnboardingForm
            onSubmit={handleOnboardingSubmit}
            isPending={isPending}
            isSuccessful={isSuccessful}
            showClinicName={false}
            errors={state.errors}
          />
        </div>
      )}
    </div>
  );
}
