import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { canAccessAdminPath } from './admin-access';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from './admin-auth';

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

// Call this at the top of every Control Center page and admin Server Function.
// The proxy redirects too, but layouts don't re-run on navigation and Server
// Functions can be called directly, so the proxy can't be the only check.
export async function requireAdminAccess(pathname: string) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (!canAccessAdminPath(session.role, pathname)) redirect('/admin?error=forbidden');
  return session;
}

// Changes only a super admin may make, wherever the section menu shows them.
export async function requireSuperAdmin(pathname: string) {
  const session = await requireAdminAccess(pathname);
  if (session.role !== 'SUPER_ADMIN') redirect('/admin?error=forbidden');
  return session;
}
