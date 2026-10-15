'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminRoles } from '@/lib/admin-access';
import { ADMIN_SESSION_COOKIE, createAdminSession } from '@/lib/admin-auth';
import { placeholderPasswordHash, verifyPassword } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';
import { clearRateLimit, getClientIp, hitRateLimit } from '@/lib/rate-limit';

const loginWindowMs = 15 * 60 * 1000;

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/admin/login?error=missing-credentials');
  }
  // Long values would become long rate-limit keys, so reject them before counting.
  if (email.length > 254) {
    redirect('/admin/login?error=invalid-credentials');
  }

  // Every attempt counts against the account; a successful login clears it.
  const accountKey = `admin-login:email:${email}`;
  const ip = await getClientIp();
  const ipLimited = ip !== null && hitRateLimit(`admin-login:ip:${ip}`, 30, loginWindowMs);
  if (ipLimited || hitRateLimit(accountKey, 10, loginWindowMs)) {
    redirect('/admin/login?error=too-many-attempts');
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email }, include: { roles: true } });
  } catch (error) {
    console.error('Admin login database lookup failed:', error);
    redirect('/admin/login?error=service-unavailable');
  }

  const passwordMatches = await verifyPassword(password, user?.passwordHash ?? placeholderPasswordHash);
  const role = adminRoles.find((candidate) => user?.roles.some((item) => item.name === candidate));
  if (!user || !role || !passwordMatches) {
    redirect('/admin/login?error=invalid-credentials');
  }

  clearRateLimit(accountKey);
  let session: string;
  try {
    session = await createAdminSession(user.email, role);
  } catch (error) {
    // Usually means ADMIN_SESSION_SECRET is not set on the server.
    console.error('Admin session could not be created:', error);
    redirect('/admin/login?error=service-unavailable');
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8
  });

  redirect('/admin');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  cookieStore.delete('selavolt_admin_role');
  redirect('/admin/login');
}
