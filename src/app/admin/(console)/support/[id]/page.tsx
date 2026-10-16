import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { updateTicket } from '../actions';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' };

const messages: Record<string, string> = {
  invalid: 'Check the ticket. A subject and message are required, and the status must be one of the choices.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminSupportEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireSuperAdmin('/admin/support');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const ticket = await prisma.supportTicket.findUnique({ where: { id }, include: { user: { select: { fullName: true, email: true } } } });
  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/support" className="text-sm font-semibold text-brand-navy">← All tickets</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Support ticket</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">{ticket.subject}</h2>
        <p className="mt-1 text-sm text-slate-600">{ticket.user.fullName} • {ticket.user.email} • opened {formatDateTime(ticket.createdAt)}</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Ticket updated.</p>}

      <form action={updateTicket} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2">
        <input type="hidden" name="id" value={ticket.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Subject
          <input name="subject" required maxLength={120} defaultValue={ticket.subject} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Message
          <textarea name="message" required maxLength={2000} rows={5} defaultValue={ticket.message} className={`${inputClass} min-h-32`} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Status
          <select name="status" defaultValue={ticket.status} className={inputClass}>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save ticket</button>
        </div>
      </form>
    </div>
  );
}
