'use server';

import { z } from 'zod/v3';
import { compare } from 'bcrypt-ts';

import {
  createUser,
  getClinicByUserId,
  getUser,
  getUserById,
  updateUserOnboarding,
  updateClinicName,
  reactivateUser,
  updateUserPassword,
} from '@/lib/db/queries';
import { generateHashedPassword } from '@/lib/db/utils';

import { signIn, auth } from './auth';
import { sendWebhook } from '@/lib/shared/utils';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export interface LoginActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'email_not_verified'
    | 'clinic_not_authorized';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // Check if user exists and has unverified email
    const users = await getUser(validatedData.email);
    if (users.length > 0) {
      const [user] = users;
      // TODO: currently disable email verification since we don't send emails
      // if (!user.emailVerified) {
      //   return { status: 'email_not_verified' };
      // }
      const clinic = await getClinicByUserId({ userId: user.id });
      if (!clinic?.authorized) {
        return { status: 'clinic_not_authorized' };
      }
    }

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    return { status: 'failed' };
  }
};

// Step 1: Validate email and passwords
export interface ValidateStep1State {
  status: 'idle' | 'success' | 'user_exists' | 'invalid_data';
}

export const validateRegistrationStep1 = async (
  _: ValidateStep1State,
  formData: FormData,
): Promise<ValidateStep1State> => {
  try {
    const validatedData = registerFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' };
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'invalid_data' };
  }
};

// Step 2: Complete registration with all data
const completeRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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

export interface CompleteRegistrationState {
  status: 'idle' | 'success' | 'failed' | 'invalid_data';
  errors?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    clinicName?: string;
    referralSource?: string;
  };
}

export const completeRegistration = async (
  _: CompleteRegistrationState,
  formData: FormData,
): Promise<CompleteRegistrationState> => {
  try {
    const validatedData = completeRegistrationSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
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

    // Create user with all onboarding data
    await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.clinicName,
      fullName,
      validatedData.phoneNumber,
      validatedData.profilePhotoUrl,
      validatedData.referralSource,
      validatedData.foundersConsent,
    );

    await sendWebhook('user_signup', process.env.NEW_SIGNUPS_WEBHOOK_URL, {
      email: validatedData.email,
      name: fullName,
      clinicName: validatedData.clinicName,
    });

    // Don't auto-login - user needs clinic authorization
    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: CompleteRegistrationState['errors'] = {};
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

    console.error('Registration error:', error);
    return { status: 'failed' };
  }
};

// Validate and hash password for first access flow
const passwordValidationSchema = z.object({
  currentPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

export interface ValidatePasswordState {
  status: 'idle' | 'success' | 'failed';
  hashedPassword?: string;
  error?: string;
}

export const validateAndHashPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<ValidatePasswordState> => {
  try {
    // Get current session
    const session = await auth();
    if (!session?.user?.id) {
      return { status: 'failed', error: 'Não autorizado' };
    }

    // Validate input
    const validationResult = passwordValidationSchema.safeParse({
      currentPassword,
      newPassword,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return { status: 'failed', error: firstError.message };
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return {
        status: 'failed',
        error: 'Nova senha deve ser diferente da senha temporária',
      };
    }

    // Get user from database
    const user = await getUserById({ userId: session.user.id });

    if (!user || !user.password) {
      return { status: 'failed', error: 'Usuário não encontrado' };
    }

    // Verify current password
    const passwordsMatch = await compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return { status: 'failed', error: 'Senha temporária incorreta' };
    }

    // Hash the new password
    const hashedPassword = generateHashedPassword(newPassword);

    return {
      status: 'success',
      hashedPassword,
    };
  } catch (error) {
    console.error('Password validation error:', error);
    return { status: 'failed', error: 'Erro ao validar senha' };
  }
};

// Complete onboarding for existing users
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
  clinicName: z.string().nullable().optional(), // Optional - not required for invited users
  profilePhotoUrl: z.string().optional(),
  referralSource: z.string().min(1, 'Como você nos conheceu é obrigatório'),
  foundersConsent: z.boolean(),
  hashedPassword: z.string().optional(),
});

export interface CompleteOnboardingState {
  status: 'idle' | 'success' | 'failed' | 'invalid_data';
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

    // Check if this is first access flow
    const isFirstAccess = formData.get('isFirstAccess') === 'true';

    // Validate form data
    const validatedData = onboardingSchema.parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phoneNumber: formData.get('phoneNumber'),
      clinicName: formData.get('clinicName'),
      profilePhotoUrl: formData.get('profilePhotoUrl') || undefined,
      referralSource: formData.get('referralSource'),
      foundersConsent: formData.get('foundersConsent') === 'true',
      hashedPassword: formData.get('hashedPassword') || undefined,
    });

    // If this is first access flow, update password with pre-hashed password
    if (isFirstAccess && validatedData.hashedPassword) {
      await updateUserPassword({
        userId: session.user.id,
        hashedPassword: validatedData.hashedPassword,
      });
    }

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

    // Update clinic name only if provided (new users only, not invited)
    if (validatedData.clinicName) {
      await updateClinicName({
        clinicId: session.clinic.id,
        clinicName: validatedData.clinicName,
      });
    }

    // If this is first access flow, activate the user
    if (isFirstAccess && session.user.status === 'invited') {
      await reactivateUser({ userId: session.user.id });
    }

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
