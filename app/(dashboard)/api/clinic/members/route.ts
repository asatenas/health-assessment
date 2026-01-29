import { type NextRequest, NextResponse } from 'next/server';
import { validateClinicAccess } from '@/lib/api/clinic-guard';
import { ChatSDKError } from '@/lib/shared/errors';
import {
  getClinicMembers,
  getUserByEmailGlobal,
  createClinicInvitation,
  getUser,
} from '@/lib/db/queries';
import { generateHashedPassword } from '@/lib/db/utils';
import crypto from 'node:crypto';

/**
 * GET /api/clinic/members
 * List all members of the clinic with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['users.invite', 'users.remove', 'roles.assign'],
    });

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get('page') || '1', 10);
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') as
      | 'active'
      | 'invited'
      | 'removed'
      | undefined;
    const role = searchParams.get('role') as
      | 'secretary'
      | 'clinician'
      | 'admin'
      | 'owner'
      | undefined;

    const { members, total } = await getClinicMembers({
      clinicId: user.clinicId,
      page,
      limit,
      search,
      status,
      role,
    });

    return NextResponse.json({
      members,
      total,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error fetching clinic members:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to fetch clinic members',
    ).toResponse();
  }
}

/**
 * POST /api/clinic/members/invite
 * Invite a new user or create a clinic switching invitation
 */
export async function POST(request: NextRequest) {
  try {
    const user = await validateClinicAccess(undefined, {
      permissions: ['users.invite'],
    });

    const body = await request.json();
    const { email, role } = body;

    // Validate input
    if (!email || !role) {
      return new ChatSDKError(
        'bad_request:api',
        'Email and role are required',
      ).toResponse();
    }

    const validRoles = ['secretary', 'clinician', 'admin', 'owner'];
    if (!validRoles.includes(role)) {
      return new ChatSDKError('bad_request:api', 'Invalid role').toResponse();
    }

    // Check if admin is trying to invite an owner
    if (user.role === 'admin' && role === 'owner') {
      return new ChatSDKError(
        'forbidden:api',
        'Apenas proprietários podem convidar outros proprietários',
      ).toResponse();
    }

    // Check if email already exists in current clinic
    const existingUsersInClinic = await getUser(email);
    const userInCurrentClinic = existingUsersInClinic.find(
      (u) => u.clinicId === user.clinicId,
    );

    if (userInCurrentClinic) {
      return new ChatSDKError(
        'bad_request:api',
        'Este email já está cadastrado na clínica',
      ).toResponse();
    }

    // Check if user is inviting themselves
    if (email.toLowerCase() === user.email.toLowerCase()) {
      return new ChatSDKError(
        'bad_request:api',
        'Você já é membro desta clínica',
      ).toResponse();
    }

    // Check if user exists globally (case-insensitive)
    const existingUser = await getUserByEmailGlobal({ email });

    // Generate temporary password for new users only
    const temporaryPassword = !existingUser
      ? crypto.randomBytes(8).toString('hex')
      : undefined;

    const hashedPassword = temporaryPassword
      ? await generateHashedPassword(temporaryPassword)
      : undefined;

    // Create invitation for ALL users (new and existing)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invitation = await createClinicInvitation({
      email,
      clinicId: user.clinicId,
      role,
      invitedBy: user.id,
      expiresAt,
      temporaryPassword: hashedPassword,
    });

    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;

    // Return appropriate response based on user type
    if (existingUser) {
      return NextResponse.json({
        type: 'clinic_switch',
        invitationId: invitation.id,
        email,
        role,
        message:
          'Convite enviado! Este usuário já possui conta e verá o convite ao fazer login.',
      });
    } else {
      return NextResponse.json({
        type: 'new_user',
        invitationId: invitation.id,
        email,
        role,
        temporaryPassword, // Plain text for display to admin
        invitationUrl,
        expiresAt,
      });
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error inviting user:', error);
    return new ChatSDKError(
      'bad_request:database',
      'Failed to invite user',
    ).toResponse();
  }
}
