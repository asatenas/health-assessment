'use client';

import { useState } from 'react';
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

interface OnboardingFormProps {
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  isSuccessful: boolean;
  showClinicName?: boolean;
  errors?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    clinicName?: string;
    referralSource?: string;
  };
}

export function OnboardingForm({
  onSubmit,
  isPending,
  isSuccessful,
  showClinicName = true,
  errors,
}: OnboardingFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [otherReferral, setOtherReferral] = useState('');
  const [foundersConsent, setFoundersConsent] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
      toast({
        type: 'error',
        description: 'Por favor, selecione uma imagem válida.',
      });
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
      toast({
        type: 'error',
        description: 'Erro ao enviar foto. Tente novamente.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (formData: FormData) => {
    // Add computed values to formData
    formData.set('phoneNumber', phoneNumber);
    formData.set('profilePhotoUrl', profilePhotoUrl);
    formData.set(
      'referralSource',
      referralSource === 'other' ? otherReferral : referralSource,
    );
    formData.set('foundersConsent', foundersConsent.toString());

    onSubmit(formData);
  };

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    phoneNumber &&
    referralSource &&
    (referralSource !== 'other' || otherReferral.trim()) &&
    (showClinicName ? clinicName.trim() : true);

  return (
    <Form action={handleSubmit} className="flex flex-col gap-6 px-4 sm:px-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="firstName"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Nome
          </Label>
          <Input
            id="firstName"
            name="firstName"
            className="bg-muted text-md md:text-sm"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoFocus
          />
          {errors?.firstName && (
            <p className="text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="lastName"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Sobrenome
          </Label>
          <Input
            id="lastName"
            name="lastName"
            className="bg-muted text-md md:text-sm"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {errors?.lastName && (
            <p className="text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="phoneNumber"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
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
        {errors?.phoneNumber && (
          <p className="text-sm text-red-500">{errors.phoneNumber}</p>
        )}
      </div>

      {showClinicName && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="clinicName"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
            Nome da clínica ou hospital
          </Label>
          <Input
            id="clinicName"
            name="clinicName"
            className="bg-muted text-md md:text-sm"
            type="text"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            required
          />
          {errors?.clinicName && (
            <p className="text-sm text-red-500">{errors.clinicName}</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="profilePhoto"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
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
        {isUploading && (
          <p className="text-sm text-gray-500">Enviando foto...</p>
        )}
        {profilePhotoUrl && !isUploading && (
          <p className="text-sm text-green-600">Foto enviada com sucesso!</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="referralSource"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Como você nos conheceu?
        </Label>
        <Select
          value={referralSource}
          onValueChange={setReferralSource}
          required
        >
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
        {errors?.referralSource && (
          <p className="text-sm text-red-500">{errors.referralSource}</p>
        )}
      </div>

      {referralSource === 'other' && (
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="otherReferral"
            className="text-zinc-600 font-normal dark:text-zinc-400"
          >
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
          Aceito que os fundadores entrem em contato comigo para fins de
          feedback
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || isSuccessful || !isFormValid || isUploading}
      >
        {isPending || isSuccessful ? 'Finalizando...' : 'Finalizar Cadastro'}
      </Button>
    </Form>
  );
}
