'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import Form from 'next/form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import {
  validateRegistrationStep1,
  completeRegistration,
  type ValidateStep1State,
  type CompleteRegistrationState,
} from '../actions';

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const BASE_REFERRAL_OPTIONS = [
  { value: 'colleague', label: 'Indicação de colega/amigo' },
  { value: 'google', label: 'Busca no Google' },
  { value: 'social', label: 'Redes sociais' },
  { value: 'event', label: 'Evento ou conferência' },
  { value: 'ad', label: 'Anúncio online' },
];

const OTHER_OPTION = { value: 'other', label: 'Outro' };

// Randomize options but keep "Outro" at the end
const REFERRAL_OPTIONS = [...shuffleArray(BASE_REFERRAL_OPTIONS), OTHER_OPTION];

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step1State, step1Action] = useActionState<ValidateStep1State, FormData>(
    validateRegistrationStep1,
    { status: 'idle' },
  );

  // Step 2 state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [otherReferral, setOtherReferral] = useState('');
  const [foundersConsent, setFoundersConsent] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [step2State, step2Action] = useActionState<CompleteRegistrationState, FormData>(
    completeRegistration,
    { status: 'idle' },
  );

  // Handle step 1 validation result
  useEffect(() => {
    if (step1State.status === 'user_exists') {
      toast({ type: 'error', description: 'Conta já existe!' });
    } else if (step1State.status === 'invalid_data') {
      toast({ type: 'error', description: 'Falha na validação. Verifique os campos.' });
    } else if (step1State.status === 'success') {
      setStep(2);
    }
  }, [step1State]);

  // Handle step 2 registration result
  useEffect(() => {
    if (step2State.status === 'failed') {
      toast({ type: 'error', description: 'Falha ao criar a conta!' });
    } else if (step2State.status === 'invalid_data') {
      toast({ type: 'error', description: 'Falha na validação. Verifique os campos.' });
    } else if (step2State.status === 'success') {
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

    // Add step 2 computed values
    formData.set('phoneNumber', phoneNumber);
    formData.set('profilePhotoUrl', profilePhotoUrl);
    formData.set(
      'referralSource',
      referralSource === 'other' ? otherReferral : referralSource,
    );
    formData.set('foundersConsent', foundersConsent.toString());

    step2Action(formData);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      }
      if (value.length > 10) {
        value = `${value.slice(0, 10)}-${value.slice(10)}`;
      } else if (value.length > 9) {
        value = `${value.slice(0, 9)}-${value.slice(9)}`;
      }
      setPhoneNumber(value);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ type: 'error', description: 'Por favor, selecione uma imagem válida.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ type: 'error', description: 'A imagem deve ter no máximo 5MB.' });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setProfilePhotoUrl(data.url);
      toast({ type: 'success', description: 'Foto enviada com sucesso!' });
    } catch (error) {
      toast({ type: 'error', description: 'Erro ao enviar foto. Tente novamente.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16 mb-8">
          <h3 className="text-2xl font-semibold dark:text-zinc-50">
            {step === 1 ? 'Cadastre-se' : 'Complete seu cadastro'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {step === 1
              ? 'Crie uma conta com seu e-mail e senha'
              : 'Precisamos de algumas informações para personalizar sua experiência'}
          </p>
        </div>

        {step === 1 ? (
          <Form action={handleStep1Submit} className="flex flex-col gap-4 px-4 sm:px-16">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-zinc-600 font-normal dark:text-zinc-400">
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
                defaultValue={email}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-zinc-600 font-normal dark:text-zinc-400">
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

            <Button type="submit" className="w-full" disabled={step1State.status === 'in_progress'}>
              {step1State.status === 'in_progress' ? 'Verificando...' : 'Continuar'}
            </Button>

            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-semibold text-gray-800 hover:underline dark:text-zinc-200">
                Entrar
              </Link>{' '}
              em vez disso.
            </p>
          </Form>
        ) : (
          <Form action={handleStep2Submit} className="flex flex-col gap-6 px-4 sm:px-16">
            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Nome
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  className="bg-muted text-md md:text-sm"
                  type="text"
                  required
                  autoFocus
                />
                {step2State.errors?.firstName && (
                  <p className="text-sm text-red-500">{step2State.errors.firstName}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Sobrenome
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  className="bg-muted text-md md:text-sm"
                  type="text"
                  required
                />
                {step2State.errors?.lastName && (
                  <p className="text-sm text-red-500">{step2State.errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Phone number */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="phoneNumber" className="text-zinc-600 font-normal dark:text-zinc-400">
                Celular
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                className="bg-muted text-md md:text-sm"
                type="text"
                placeholder="(00) 00000-0000"
                value={phoneNumber}
                onChange={handlePhoneChange}
                required
              />
              {step2State.errors?.phoneNumber && (
                <p className="text-sm text-red-500">{step2State.errors.phoneNumber}</p>
              )}
            </div>

            {/* Clinic name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="clinicName" className="text-zinc-600 font-normal dark:text-zinc-400">
                Nome da clínica ou hospital
              </Label>
              <Input
                id="clinicName"
                name="clinicName"
                className="bg-muted text-md md:text-sm"
                type="text"
                required
              />
              {step2State.errors?.clinicName && (
                <p className="text-sm text-red-500">{step2State.errors.clinicName}</p>
              )}
            </div>

            {/* Profile photo */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="profilePhoto" className="text-zinc-600 font-normal dark:text-zinc-400">
                Foto de perfil (opcional)
              </Label>
              <Input
                id="profilePhoto"
                name="profilePhoto"
                className="bg-muted text-md md:text-sm"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploading}
              />
              {isUploading && <p className="text-sm text-gray-500">Enviando foto...</p>}
              {profilePhotoUrl && !isUploading && (
                <p className="text-sm text-green-600">Foto enviada com sucesso!</p>
              )}
            </div>

            {/* Referral source */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="referralSource" className="text-zinc-600 font-normal dark:text-zinc-400">
                Como você nos conheceu?
              </Label>
              <Select value={referralSource} onValueChange={setReferralSource} required>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {REFERRAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {step2State.errors?.referralSource && (
                <p className="text-sm text-red-500">{step2State.errors.referralSource}</p>
              )}
            </div>

            {/* Other referral text field */}
            {referralSource === 'other' && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="otherReferral" className="text-zinc-600 font-normal dark:text-zinc-400">
                  Por favor, especifique
                </Label>
                <Input
                  id="otherReferral"
                  name="otherReferral"
                  className="bg-muted text-md md:text-sm"
                  type="text"
                  value={otherReferral}
                  onChange={(e) => setOtherReferral(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Founders consent */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="foundersConsent"
                checked={foundersConsent}
                onCheckedChange={(checked) => setFoundersConsent(checked === true)}
              />
              <Label
                htmlFor="foundersConsent"
                className="text-sm text-zinc-600 font-normal dark:text-zinc-400 cursor-pointer"
              >
                Aceito que os fundadores entrem em contato comigo para feedbacks
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep(1)}
                disabled={step2State.status === 'in_progress'}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  step2State.status === 'in_progress' ||
                  !phoneNumber ||
                  !referralSource ||
                  (referralSource === 'other' && !otherReferral) ||
                  isUploading
                }
              >
                {step2State.status === 'in_progress' ? 'Criando conta...' : 'Finalizar Cadastro'}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}
