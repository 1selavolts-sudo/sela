'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminSession } from '@/lib/admin-auth';
import { verifyPassword } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';

const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'STATION_MANAGER', 'SUPPORT'];

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/admin/login?error=missing-credentials');
  }

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, include: { roles: true } });
  } catch (error) {
    console.error('Admin login database lookup failed:', error);
    redirect('/admin/login?error=service-unavailable');
  }

  const role = user?.roles.find((item) => adminRoles.includes(item.name));
  if (!user || !role || !verifyPassword(password, user.passwordHash)) {
    redirect('/admin/login?error=invalid-credentials');
  }

  const cookieStore = await cookies();
  const session = await createAdminSession(user.email, role.name);

  cookieStore.set('selavolt_admin_session', session, {
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
  cookieStore.delete('selavolt_admin_session');
  cookieStore.delete('selavolt_admin_role');
  redirect('/admin/login');
}
