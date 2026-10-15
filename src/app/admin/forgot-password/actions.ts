'use server';

import type { RoleName } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminRole } from '@/lib/admin-access';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { isEmailConfigured, sendAppEmail } from '@/lib/email';
import { createResetToken, hashPassword, hashResetToken } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';
import { getClientIp, hitRateLimit } from '@/lib/rate-limit';

const eligibleRole = (roles: { name: RoleName }[]) => roles.some((role) => isAdminRole(role.name));

function appUrl() {
  return (process.env.APP_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:3000'}`).replace(/\/$/, '');
}

async function getOrCreateBootstrapAdmin(email: string) {
  let user = await prisma.user.findUnique({ where: { email }, include: { roles: true } });
  if (user) return user;

  const bootstrapEmail = (process.env.ADMIN_EMAIL || 'denysmahoro@gmail.com').trim().toLowerCase();
  if (email !== bootstrapEmail) return null;

  const role = await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: { name: 'SUPER_ADMIN' }
  });

  try {
    user = await prisma.user.create({
      data: {
        email,
        fullName: email.split('@')[0],
        passwordHash: await hashPassword(createResetToken()),
        roles: { connect: { id: role.id } }
      },
      include: { roles: true }
    });
    return user;
  } catch {
    return prisma.user.findUnique({ where: { email }, include: { roles: true } });
  }
}

export async function requestAdminPasswordResetAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    redirect('/admin/forgot-password?error=invalid-email');
  }
  // The per-email cap stops anyone from flooding an admin's inbox with reset emails.
  const ip = await getClientIp();
  const ipLimited = ip !== null && hitRateLimit(`admin-reset:ip:${ip}`, 5, 15 * 60 * 1000);
  if (ipLimited || hitRateLimit(`admin-reset:email:${email}`, 3, 60 * 60 * 1000)) {
    redirect('/admin/forgot-password?error=too-many-requests');
  }
  if (!isEmailConfigured()) {
    redirect('/admin/forgot-password?error=email-unconfigured');
  }

  let user = await prisma.user.findUnique({ where: { email }, include: { roles: true } });
  if (!user && email === (process.env.ADMIN_EMAIL || 'denysmahoro@gmail.com').trim().toLowerCase()) {
    user = await getOrCreateBootstrapAdmin(email);
  }

  if (!user || !eligibleRole(user.roles)) {
    redirect('/admin/forgot-password?status=sent');
  }

  const recentToken = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - 60_000) } },
    select: { id: true }
  });
  if (recentToken) redirect('/admin/forgot-password?status=sent');

  const rawToken = createResetToken();
  const tokenHash = hashResetToken(rawToken);
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
  await prisma.passwordResetToken.create({
    data: { tokenHash, userId: user.id, expiresAt: new Date(Date.now() + 30 * 60 * 1000) }
  });

  try {
    await sendAppEmail({
      to: user.email,
      subject: 'Reset your SELA ENERGY admin password',
      text: `Use this link within 30 minutes to set a new password:\n\n${appUrl()}/admin/reset-password?token=${rawToken}\n\nIf you did not request this, ignore this email.`
    });
  } catch (error) {
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
    console.error('Admin password reset email failed:', error);
    redirect('/admin/forgot-password?error=email-delivery');
  }

  redirect('/admin/forgot-password?status=sent');
}

export async function resetAdminPasswordAction(formData: FormData) {
  const rawToken = String(formData.get('token') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');

  if (password.length < 12 || password.length > 128) {
    redirect(`/admin/reset-password?token=${encodeURIComponent(rawToken)}&error=weak-password`);
  }
  if (password !== confirmation) {
    redirect(`/admin/reset-password?token=${encodeURIComponent(rawToken)}&error=password-mismatch`);
  }
  if (!/^[a-f0-9]{64}$/i.test(rawToken)) redirect('/admin/forgot-password?error=invalid-token');

  const tokenHash = hashResetToken(rawToken);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { roles: true } } }
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date() || !eligibleRole(resetToken.user.roles)) {
    redirect('/admin/forgot-password?error=invalid-token');
  }

  // Hash before opening the transaction so it isn't held open during the slow key derivation.
  const passwordHash = await hashPassword(password);
  const now = new Date();
  try {
    await prisma.$transaction(async (transaction) => {
      const consumed = await transaction.passwordResetToken.updateMany({
        where: { id: resetToken.id, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now }
      });
      if (consumed.count !== 1) throw new Error('Reset token has already been used.');

      await transaction.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash }
      });
      await transaction.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId, id: { not: resetToken.id } }
      });
    });
  } catch (error) {
    console.error('Admin password reset failed:', error);
    redirect('/admin/forgot-password?error=invalid-token');
  }

  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  try {
    await sendAppEmail({
      to: resetToken.user.email,
      subject: 'Your SELA ENERGY admin password was changed',
      text: 'Your admin password was changed. If you did not make this change, contact the system administrator immediately.'
    });
  } catch (error) {
    console.error('Password change notification email failed:', error);
  }

  redirect('/admin/login?status=password-updated');
}