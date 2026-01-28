'use server';

import { z } from 'zod/v3';

import { createUser, getClinicByUserId, getUser } from '@/lib/db/queries';

import { signIn } from './auth';
import { sendWebhook } from '@/lib/shared/utils';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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
      if (!user.emailVerified) {
        return { status: 'email_not_verified' };
      }
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

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }

    await createUser(validatedData.email, validatedData.password);

    await sendWebhook('user_signup', process.env.NEW_SIGNUPS_WEBHOOK_URL, {
      email: validatedData.email,
    });

    try {
      await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });
    } catch (error) {
      // let sign up fail
      // TODO: remove manual email verification
      return { status: 'success' };
    }

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
