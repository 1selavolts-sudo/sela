'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { hashPassword } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';
import { staffCreateSchema, staffRoleSchema } from '@/lib/validation';

const listPath = '/admin/staff';

export async function createAdmin(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const parsed = staffCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    redirect(`${listPath}?error=exists`);
  }

  const role = await prisma.role.upsert({ where: { name: parsed.data.role }, update: {}, create: { name: parsed.data.role } });
  const user = await prisma.user.create({
    data: {
      email,
      fullName: parsed.data.fullName,
      passwordHash: await hashPassword(parsed.data.password),
      roles: { connect: { id: role.id } }
    }
  });

  await recordAudit(session, 'staff.create', 'User', user.id);
  revalidatePath('/', 'layout');
  redirect(`${listPath}?saved=created`);
}

export async function changeStaffRole(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const parsed = staffRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!user) {
    redirect(`${listPath}?error=not-found`);
  }
  // Nobody changes their own role, so the last super admin cannot lock everyone out by accident.
  if (user.email === session.email) {
    redirect(`${listPath}?error=self`);
  }

  const role = await prisma.role.upsert({ where: { name: parsed.data.role }, update: {}, create: { name: parsed.data.role } });
  await prisma.user.update({ where: { id }, data: { roles: { set: [{ id: role.id }] } } });

  await recordAudit(session, 'staff.role', 'User', id);
  revalidatePath('/', 'layout');
  redirect(`${listPath}?saved=role`);
}
