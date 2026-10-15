import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { canAccessAdminPath } from '@/lib/admin-access';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/admin-auth';

// Optimistic checks from the session cookie only. Pages and Server Functions repeat
// them with requireAdminAccess, because the proxy can't be the only line of defense.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';
  const isRecoveryRoute = pathname === '/admin/forgot-password' || pathname === '/admin/reset-password';
  const session = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (isAdminRoute && !isLoginRoute && !isRecoveryRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (!canAccessAdminPath(session.role, pathname)) {
      return NextResponse.redirect(new URL('/admin?error=forbidden', request.url));
    }
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
