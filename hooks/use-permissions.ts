'use client';

import { useSession } from 'next-auth/react';
import type { Permission } from '@/lib/permissions';

export function usePermissions() {
  const { data: session } = useSession();

  const hasPermission = (permission: Permission): boolean => {
    if (!session?.user?.permissions) return false;
    return session.user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!session?.user?.permissions) return false;
    return permissions.some((p) => session.user.permissions?.includes(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!session?.user?.permissions) return false;
    return permissions.every((p) => session.user.permissions?.includes(p));
  };

  const isPlatformAdmin = session?.user?.platformAdmin === true;
  const isImpersonating = !!session?.impersonation;
  const role = session?.user?.role;
  const clinic = session?.clinic;

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isPlatformAdmin,
    isImpersonating,
    role,
    clinic,
    permissions: session?.user?.permissions || [],
  };
}
