'use server';

import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { customerSchema } from '@/lib/validation';

const listPath = '/admin/customers';

export async function updateCustomer(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const profile = await prisma.customerProfile.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!profile) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  const email = parsed.data.email.toLowerCase();
  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken && taken.id !== profile.userId) {
    redirect(`${listPath}/${id}?error=exists`);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: profile.userId },
      data: { fullName: parsed.data.fullName, email, phoneNumber: parsed.data.phoneNumber }
    }),
    prisma.customerProfile.update({
      where: { id },
      data: {
        accountStatus: parsed.data.accountStatus,
        preferredConnector: parsed.data.preferredConnector,
        vehicleMake: parsed.data.vehicleMake,
        vehicleModel: parsed.data.vehicleModel,
        licensePlate: parsed.data.licensePlate
      }
    })
  ]);

  await recordAudit(session, 'customer.update', 'CustomerProfile', id);
  redirect(`${listPath}/${id}?saved=1`);
}
