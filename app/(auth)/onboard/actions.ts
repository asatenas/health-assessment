'use server';

import { z } from 'zod/v3';
import { updateUserOnboarding, updateClinicName } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

const onboardingSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório'),
  lastName: z.string().min(1, 'Sobrenome é obrigatório'),
  phoneNumber: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10 || val.length === 11, {
      message: 'Telefone deve ter 10 ou 11 dígitos',
    }),
  clinicName: z.string().min(1, 'Nome da clínica é obrigatório'),
  profilePhotoUrl: z.string().optional(),
  referralSource: z.string().min(1, 'Como você nos conheceu é obrigatório'),
  foundersConsent: z.boolean(),
});

export interface CompleteOnboardingState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  errors?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    clinicName?: string;
    referralSource?: string;
  };
}

export const completeOnboarding = async (
  _: CompleteOnboardingState,
  formData: FormData,
): Promise<CompleteOnboardingState> => {
  try {
    // Get current session
    const session = await auth();
    if (!session?.user?.id || !session?.clinic?.id) {
      return { status: 'failed' };
    }

    // Validate form data
    const validatedData = onboardingSchema.parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phoneNumber: formData.get('phoneNumber'),
      clinicName: formData.get('clinicName'),
      profilePhotoUrl: formData.get('profilePhotoUrl') || undefined,
      referralSource: formData.get('referralSource'),
      foundersConsent: formData.get('foundersConsent') === 'true',
    });

    // Concatenate first and last name
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`;

    // Update user onboarding info
    await updateUserOnboarding({
      userId: session.user.id,
      name: fullName,
      phoneNumber: validatedData.phoneNumber,
      profilePhotoUrl: validatedData.profilePhotoUrl,
      referralSource: validatedData.referralSource,
      foundersConsent: validatedData.foundersConsent,
      onboardingCompleted: true,
    });

    // Update clinic name
    await updateClinicName({
      clinicId: session.clinic.id,
      clinicName: validatedData.clinicName,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: CompleteOnboardingState['errors'] = {};
      for (const issue of error.issues) {
        const path = issue.path[0] as string;
        if (
          path === 'firstName' ||
          path === 'lastName' ||
          path === 'phoneNumber' ||
          path === 'clinicName' ||
          path === 'referralSource'
        ) {
          errors[path] = issue.message;
        }
      }
      return { status: 'invalid_data', errors };
    }

    console.error('Onboarding error:', error);
    return { status: 'failed' };
  }
};
