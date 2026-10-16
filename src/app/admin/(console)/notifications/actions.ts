'use server';

import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { notificationSchema } from '@/lib/validation';

const listPath = '/admin/notifications';

export async function updateNotification(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.notification.findUnique({ where: { id }, select: { id: true, readAt: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = notificationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  // Keep the original read time when the notification stays read.
  const readAt = parsed.data.read ? (existing.readAt ?? new Date()) : null;
  await prisma.notification.update({
    where: { id },
    data: { title: parsed.data.title, message: parsed.data.message, channel: parsed.data.channel, readAt }
  });

  await recordAudit(session, 'notification.update', 'Notification', id);
  redirect(`${listPath}/${id}?saved=1`);
}

export async function deleteNotification(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.notification.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  await prisma.notification.delete({ where: { id } });
  await recordAudit(session, 'notification.delete', 'Notification', id);
  redirect(`${listPath}?saved=deleted`);
}
