'use server';

import { redirect } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { ticketStatusSchema } from '@/lib/validation';

const listPath = '/admin/support';

export async function setTicketStatus(formData: FormData) {
  const session = await requireAdminAccess(listPath);
  const id = String(formData.get('id') ?? '');
  const parsed = ticketStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}?error=invalid`);
  }

  const result = await prisma.supportTicket.updateMany({ where: { id }, data: { status: parsed.data.status } });
  if (result.count === 0) {
    redirect(`${listPath}?error=not-found`);
  }

  await recordAudit(session, 'ticket.status', 'SupportTicket', id);
  redirect(`${listPath}?saved=1`);
}
