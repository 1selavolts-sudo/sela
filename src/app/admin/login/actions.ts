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

  // Every attempt counts against the account; a successful login clears it.
  const accountKey = `admin-login:email:${email}`;
  if (hitRateLimit(`admin-login:ip:${await getClientIp()}`, 30, loginWindowMs) || hitRateLimit(accountKey, 10, loginWindowMs)) {
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
  const cookieStore = await cookies();
  const session = await createAdminSession(user.email, role);

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
