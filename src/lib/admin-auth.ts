import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'selavolt_admin_session';

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === 'authenticated';
}

export async function getAdminRole() {
  const cookieStore = await cookies();
  return cookieStore.get('selavolt_admin_role')?.value ?? 'SUPER_ADMIN';
}
