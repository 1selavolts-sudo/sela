'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminRoles, type AdminRole } from '@/lib/admin-access';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { requireSuperAdmin } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { hashPassword } from '@/lib/passwords';
import { prisma } from '@/lib/prisma';
import { staffCreateSchema, staffProfileSchema, staffRoleSchema } from '@/lib/validation';

const listPath = '/admin/staff';

type StaffChoice = AdminRole | 'NONE';

// NONE removes admin access: the account keeps only the customer role, so it leaves the staff list.
async function roleRecord(choice: StaffChoice) {
  const name = choice === 'NONE' ? 'CUSTOMER' : choice;
  return prisma.role.upsert({ where: { name }, update: {}, create: { name } });
}

async function isSuperAdmin(userId: string) {
  return (await prisma.user.count({ where: { id: userId, roles: { some: { name: 'SUPER_ADMIN' } } } })) > 0;
}

// The last super admin cannot be demoted, so someone can always reach the Staff page.
async function demotingLastSuperAdmin(userId: string, nextRole: StaffChoice) {
  if (nextRole === 'SUPER_ADMIN' || !(await isSuperAdmin(userId))) return false;
  const others = await prisma.user.count({ where: { id: { not: userId }, roles: { some: { name: 'SUPER_ADMIN' } } } });
  return others === 0;
}

// The signed-in cookie still holds the old role and email, so after changing your own access, sign in again.
async function signOutAfterOwnChange(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect('/admin/login?status=access-changed');
}

export async function createAdmin(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const parsed = staffCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    redirect(`${listPath}?error=exists`);
  }

  const role = await roleRecord(parsed.data.role);
  const user = await prisma.user.create({
    data: {
      email,
      fullName: parsed.data.fullName,
      passwordHash: await hashPassword(parsed.data.password),
      roles: { connect: { id: role.id } }
    }
  });

  await recordAudit(session, 'staff.create', 'User', user.id);
  redirect(`${listPath}?saved=created`);
}

export async function changeStaffRole(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const parsed = staffRoleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!user) {
    redirect(`${listPath}?error=not-found`);
  }
  if (await demotingLastSuperAdmin(user.id, parsed.data.role)) {
    redirect(`${listPath}?error=last-super-admin`);
  }

  const role = await roleRecord(parsed.data.role);
  await prisma.user.update({ where: { id }, data: { roles: { set: [{ id: role.id }] } } });

  await recordAudit(session, 'staff.role', 'User', id);
  revalidatePath('/', 'layout');

  if (user.email === session.email) {
    await signOutAfterOwnChange();
  }
  redirect(`${listPath}?saved=role`);
}

export async function updateStaff(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, roles: { select: { name: true } } } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = staffProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  const email = parsed.data.email.toLowerCase();
  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken && taken.id !== id) {
    redirect(`${listPath}/${id}?error=exists`);
  }
  if (await demotingLastSuperAdmin(id, parsed.data.role)) {
    redirect(`${listPath}/${id}?error=last-super-admin`);
  }

  const role = await roleRecord(parsed.data.role);
  await prisma.user.update({
    where: { id },
    data: {
      fullName: parsed.data.fullName,
      email,
      ...(parsed.data.password ? { passwordHash: await hashPassword(parsed.data.password) } : {}),
      roles: { set: [{ id: role.id }] }
    }
  });

  await recordAudit(session, 'staff.update', 'User', id);
  revalidatePath('/', 'layout');

  const currentRole = existing.roles.map((item) => item.name).find((name) => (adminRoles as readonly string[]).includes(name)) ?? 'NONE';
  const accessChanged = currentRole !== parsed.data.role || existing.email !== email;
  if (existing.email === session.email && accessChanged) {
    await signOutAfterOwnChange();
  }
  redirect(`${listPath}/${id}?saved=1`);
}
