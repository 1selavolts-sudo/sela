import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { setTicketStatus } from './actions';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' };

const messages: Record<string, string> = {
  invalid: 'Choose a valid status.',
  'not-found': 'That ticket no longer exists.'
};

export default async function AdminSupportPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/support');
  const params = await searchParams;
  const tickets = await prisma.supportTicket.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { fullName: true, email: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Support</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Support tickets</h2>
        <p className="mt-2 text-sm text-slate-600">Tickets are created from the customer support form, which is not connected yet. Existing tickets can be updated here.</p>
      </div>

      {params.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[params.error] ?? 'Something went wrong. Please try again.'}</p>}
      {params.saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Ticket updated.</p>}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        {tickets.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No support tickets yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Opened</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3 font-semibold text-brand-navy">{ticket.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-slate-600">{ticket.user.fullName}<br /><span className="text-xs text-slate-500">{ticket.user.email}</span></td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="font-semibold text-brand-navy">{ticket.subject}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.message}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(ticket.createdAt)}</td>
                  <td className="px-4 py-3">
                    <form action={setTicketStatus} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={ticket.id} />
                      <select name="status" defaultValue={ticket.status} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <button type="submit" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
