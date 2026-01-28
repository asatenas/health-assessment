import { type NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt-ts';
import { z } from 'zod';
import { ChatSDKError } from '@/lib/shared/errors';
import {
  getUserById,
  updateUserPassword,
  reactivateUser,
} from '@/lib/db/queries';
import { generateHashedPassword } from '@/lib/db/utils';
import { auth } from '@/app/(auth)/auth';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

/**
 * PATCH /api/user/password
 * Change the current user's password
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return new ChatSDKError('unauthorized:api').toResponse();
    }

    const user = await getUserById({ userId: currentUserId });

    if (!user || !user.password) {
      return new ChatSDKError(
        'not_found:api',
        'Usuário não encontrado',
      ).toResponse();
    }

    if (!user.emailVerified) {
      return new ChatSDKError(
        'unauthorized:api',
        'Email not verified',
      ).toResponse();
    }

    if (user.status === 'disabled') {
      return new ChatSDKError(
        'unauthorized:api',
        'User account is not active',
      ).toResponse();
    }

    const body = await request.json();

    // Validate request body
    const validationResult = passwordChangeSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return new ChatSDKError(
        'bad_request:api',
        firstError.message,
      ).toResponse();
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      return new ChatSDKError(
        'bad_request:api',
        'Nova senha deve ser diferente da senha atual',
      ).toResponse();
    }

    // Fetch user from database
    if (!user || !user.password) {
      return new ChatSDKError(
        'not_found:api',
        'Usuário não encontrado',
      ).toResponse();
    }

    // Verify current password
    const passwordsMatch = await compare(currentPassword, user.password);
    if (!passwordsMatch) {
      return new ChatSDKError(
        'bad_request:api',
        'Senha atual incorreta',
      ).toResponse();
    }

    // Hash new password
    const hashedPassword = generateHashedPassword(newPassword);

    // Update password in database
    await updateUserPassword({
      userId: currentUserId,
      hashedPassword,
    });

    // If user is in 'invited' status, activate them after password change
    if (user.status === 'invited') {
      await reactivateUser({ userId: currentUserId });
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
      statusChanged: user.status === 'invited',
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error updating password:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Falha ao atualizar senha',
    ).toResponse();
  }
}
