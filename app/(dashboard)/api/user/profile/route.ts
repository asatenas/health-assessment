import { auth } from '@/app/(auth)/auth';
import { updateUserProfile } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { z } from 'zod/v3';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'Nome é obrigatório').optional(),
  lastName: z.string().min(1, 'Sobrenome é obrigatório').optional(),
  phoneNumber: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 10 || val.length === 11, {
      message: 'Telefone deve ter 10 ou 11 dígitos',
    })
    .optional(),
  profilePhotoUrl: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado', cause: 'Usuário não autenticado' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate the request body
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return NextResponse.json(
        { message: 'Dados inválidos', cause: firstError.message },
        { status: 400 },
      );
    }

    const { firstName, lastName, phoneNumber, profilePhotoUrl } =
      validationResult.data;

    // Combine first and last name if both are provided
    let fullName: string | undefined;
    if (firstName !== undefined || lastName !== undefined) {
      // Get current user to get existing name parts
      const currentFirstName =
        firstName ?? session.user.name?.split(' ')[0] ?? '';
      const currentLastName =
        lastName ?? session.user.name?.split(' ').slice(1).join(' ') ?? '';
      fullName = `${currentFirstName} ${currentLastName}`.trim();
    }

    // Update user profile
    await updateUserProfile({
      userId: session.user.id,
      name: fullName,
      phoneNumber,
      profilePhotoUrl,
    });

    return NextResponse.json(
      { message: 'Perfil atualizado com sucesso' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      {
        message: 'Erro ao atualizar perfil',
        cause: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 },
    );
  }
}
