import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime, formatDuration, formatKwh, formatRwf } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminSessionsPage() {
  await requireAdminAccess('/admin/sessions');

  const sessions = await prisma.chargingSession.findMany({
    take: 200,
    orderBy: { startTime: 'desc' },
    include: {
      customer: { include: { user: { select: { fullName: true } } } },
      charger: { select: { chargerId: true, station: { select: { name: true } } } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Sessions</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Charging sessions</h2>
        <p className="mt-2 text-sm text-slate-600">The 200 most recent sessions.</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        {sessions.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No charging sessions yet. Sessions appear here once customers start charging.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Station and charger</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Energy</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-semibold text-brand-navy">{session.sessionId}</td>
                  <td className="px-4 py-3 text-slate-600">{session.customer.user.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{session.charger.station.name} • {session.charger.chargerId}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(session.startTime)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDuration(session.startTime, session.endTime)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatKwh(session.energyDeliveredKwh ?? 0)}</td>
                  <td className="px-4 py-3 font-semibold text-brand-navy">{session.totalAmount !== null ? formatRwf(session.totalAmount) : '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{session.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
