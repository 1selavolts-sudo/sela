'use server';

import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { kigaliDateTime, paymentSchema } from '@/lib/validation';

const listPath = '/admin/payments';

// Changes one payment record. Session totals are separate, so change them on the Sessions page too if needed.
export async function updatePayment(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.payment.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  const timestamp = kigaliDateTime(parsed.data.timestamp);
  if (!timestamp) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  await prisma.payment.update({
    where: { id },
    data: {
      status: parsed.data.status,
      amount: parsed.data.amount,
      paymentMethod: parsed.data.paymentMethod,
      energyKwh: parsed.data.energyKwh,
      timestamp
    }
  });

  await recordAudit(session, 'payment.update', 'Payment', id);
  redirect(`${listPath}/${id}?saved=1`);
}
