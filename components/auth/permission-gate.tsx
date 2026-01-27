'use client';

import { usePermissions } from '@/hooks/use-permissions';
import type { Permission } from '@/lib/permissions';
import type { ReactNode } from 'react';

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let authorized = false;

  if (permission) {
    authorized = hasPermission(permission);
  } else if (permissions) {
    authorized = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  return authorized ? <>{children}</> : <>{fallback}</>;
}
