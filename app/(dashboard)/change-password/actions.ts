'use server';

import { z } from 'zod';
import { compare } from 'bcrypt-ts';
import { getUserById } from '@/lib/db/queries';
import { generateHashedPassword } from '@/lib/db/utils';
import { auth } from '@/app/(auth)/auth';

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
