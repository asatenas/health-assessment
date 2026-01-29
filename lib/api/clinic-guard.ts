import { auth } from '@/app/(auth)/auth';
import { getChatById, getUserById, getClinicByUserId } from '@/lib/db/queries';
import { ChatSDKError } from '../shared/errors';
import {
  hasAnyPermission,
  hasAllPermissions,
  type Permission,
} from '../permissions';

export interface PermissionCheckOptions {
  permissions: Permission[];
  requireAll?: boolean; // Default: false (require any)
}

export async function validateClinicAccess(
  chatId?: string,
  permissionOptions?: PermissionCheckOptions,
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new ChatSDKError('unauthorized:api');
  }

  // If impersonating, verify original admin is still a platform admin
  if (session.impersonation) {
    const adminUser = await getUserById({
      userId: session.impersonation.user.id,
    });
    if (!adminUser?.platformAdmin) {
      throw new ChatSDKError(
        'unauthorized:api',
        'Original admin user no longer has platform admin privileges',
      );
    }
  }

  const user = await getUserById({ userId: session.user.id });

  if (!user) {
    throw new ChatSDKError('unauthorized:api');
  }

  // TODO: currently disable email verification since we don't send emails
  // if (!user.emailVerified) {
  //   throw new ChatSDKError('unauthorized:api', 'Email not verified');
  // }

  if (user.status === 'removed') {
    throw new ChatSDKError(
      'forbidden:api',
      'Removed users cannot access clinic resources',
    );
  }

  if (user.status !== 'active') {
    throw new ChatSDKError('unauthorized:api', 'User account is not active');
  }

  // Permission check if provided
  if (permissionOptions) {
    const hasPermission = permissionOptions.requireAll
      ? hasAllPermissions(user.role, permissionOptions.permissions)
      : hasAnyPermission(user.role, permissionOptions.permissions);

    if (!hasPermission) {
      throw new ChatSDKError('forbidden:api');
    }
  }

  const userClinic = await getClinicByUserId({ userId: session.user.id });
  if (!userClinic?.authorized) {
    throw new ChatSDKError(
      'unauthorized:api',
      'Clinic not authorized. Please wait for support approval.',
    );
  }

  if (chatId) {
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      throw new ChatSDKError('not_found:api');
    }

    if (chat.clinicId !== user.clinicId) {
      throw new ChatSDKError('unauthorized:api');
    }
  }

  return user;
}
