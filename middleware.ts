import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';
  const isRecoveryRoute = pathname === '/admin/forgot-password' || pathname === '/admin/reset-password';
  const session = await verifyAdminSession(request.cookies.get('selavolt_admin_session')?.value);

  if (isAdminRoute && !isLoginRoute && !isRecoveryRoute && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginRoute && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
