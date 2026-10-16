'use server';

import { redirect } from 'next/navigation';
import { requireAdminAccess, requireSuperAdmin } from '@/lib/admin-session';
import { recordAudit } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { ticketDetailsSchema, ticketStatusSchema } from '@/lib/validation';

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

// Subject, message and status of a ticket. Only a super admin can change the wording.
export async function updateTicket(formData: FormData) {
  const session = await requireSuperAdmin(listPath);
  const id = String(formData.get('id') ?? '');
  const existing = await prisma.supportTicket.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    redirect(`${listPath}?error=not-found`);
  }

  const parsed = ticketDetailsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    redirect(`${listPath}/${id}?error=invalid`);
  }

  await prisma.supportTicket.update({ where: { id }, data: parsed.data });
  await recordAudit(session, 'ticket.update', 'SupportTicket', id);
  redirect(`${listPath}/${id}?saved=1`);
}
