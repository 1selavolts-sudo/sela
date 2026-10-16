'use server';

import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { kigaliDateTime, sessionSchema } from '@/lib/validation';

const listPath = '/admin/sessions';

// Changes one session record. Payments are separate records, so change them on the Payments page too if needed.
export async function updateSession(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.chargingSession.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = sessionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  const startTime = kigaliDateTime(parsed.data.startTime);
  const endTime = parsed.data.endTime ? kigaliDateTime(parsed.data.endTime) : null;
  if (!startTime || (parsed.data.endTime && !endTime)) {
    redirect(`${listPath}/${id}?error=invalid`);
  }
  if (endTime && endTime < startTime) {
    redirect(`${listPath}/${id}?error=dates`);
  }

  await prisma.chargingSession.update({
    where: { id },
    data: {
      status: parsed.data.status,
      paymentStatus: parsed.data.paymentStatus,
      startTime,
      endTime,
      energyDeliveredKwh: parsed.data.energyDeliveredKwh,
      totalAmount: parsed.data.totalAmount,
      notes: parsed.data.notes
    }
  });

  await recordAudit(session, 'session.update', 'ChargingSession', id);
  redirect(`${listPath}/${id}?saved=1`);
}
