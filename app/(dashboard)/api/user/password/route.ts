import { type NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt-ts';
import { z } from 'zod';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import { getUserById, updateUserPassword } from '@/lib/db/queries';
import { generateHashedPassword } from '@/lib/db/utils';

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
    const currentUser = await validateClinicAccess();

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
    const user = await getUserById({ userId: currentUser.id });
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
      userId: currentUser.id,
      hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
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
