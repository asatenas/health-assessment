export const PERMISSIONS = [
  // org / security
  'org.manage',
  'users.invite',
  'users.remove',
  'roles.assign',
  'audit.read',

  // billing
  'billing.read',
  'billing.write',

  // clinical domain
  'surgeries.read',
  'surgeries.write',

  // assessments
  'assessments.create',
  'assessments.read',
  'assessments.read.summary', // Limited read access for secretaries
  'assessments.update',
  'assessments.delete',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  owner: PERMISSIONS, // All permissions
  admin: PERMISSIONS, // All permissions
  clinician: [
    'surgeries.read',
    'surgeries.write',
    'assessments.create',
    'assessments.read',
    'assessments.update',
  ],
  secretary: [
    'assessments.create',
    'assessments.read.summary', // Limited read access - list view with basic columns only
  ],
};

export function getPermissionsForRole(role: string): readonly Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(role: string, permission: Permission): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(
  role: string,
  permissions: Permission[],
): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return permissions.some((p) => rolePermissions.includes(p));
}

export function hasAllPermissions(
  role: string,
  permissions: Permission[],
): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return permissions.every((p) => rolePermissions.includes(p));
}
