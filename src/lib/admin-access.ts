// Ordered from most to least privileged, so a user with several roles signs in with the strongest one.
export const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'STATION_MANAGER', 'SUPPORT'] as const;

export type AdminRole = (typeof adminRoles)[number];

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === 'string' && (adminRoles as readonly string[]).includes(value);
}

// Roles allowed into each Control Center section. A section missing from this list is
// limited to SUPER_ADMIN, so a new page stays locked until someone decides who sees it.
const sectionRoles: Record<string, readonly AdminRole[]> = {
  '/admin': adminRoles,
  '/admin/stations': ['SUPER_ADMIN', 'ADMIN', 'STATION_MANAGER'],
  '/admin/chargers': ['SUPER_ADMIN', 'ADMIN', 'STATION_MANAGER'],
  '/admin/live-operations': adminRoles,
  '/admin/sessions': adminRoles,
  '/admin/customers': ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
  '/admin/payments': ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
  '/admin/pricing': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/analytics': ['SUPER_ADMIN', 'ADMIN', 'STATION_MANAGER'],
  '/admin/support': adminRoles,
  '/admin/notifications': adminRoles,
  '/admin/audit-logs': ['SUPER_ADMIN', 'ADMIN'],
  '/admin/staff': ['SUPER_ADMIN'],
  '/admin/settings': ['SUPER_ADMIN', 'ADMIN']
};

export function canAccessAdminPath(role: AdminRole, pathname: string) {
  const section = pathname.split('/')[2];
  const allowedRoles = sectionRoles[section ? `/admin/${section}` : '/admin'] ?? ['SUPER_ADMIN'];
  return allowedRoles.includes(role);
}
