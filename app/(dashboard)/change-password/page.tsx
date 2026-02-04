'use client';

import { useState, useEffect, useActionState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import { OnboardingSection } from '@/components/auth/onboarding-section';
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
        <ChangePasswordForm
          email={session?.user?.email || ''}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          error={error}
          isValidating={validatingPassword}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handlePasswordSubmit}
        />
      ) : (
        <OnboardingSection>
          <OnboardingForm
            onSubmit={handleOnboardingSubmit}
            isPending={isPending}
            isSuccessful={isSuccessful}
            showClinicName={false}
            errors={state.errors}
          />
        </OnboardingSection>
      )}
    </div>
  );
}
