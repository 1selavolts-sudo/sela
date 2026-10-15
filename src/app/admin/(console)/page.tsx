import Link from 'next/link';
import { BarChart, monthLabel } from '@/components/admin/bar-chart';
import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime, formatDuration, formatKwh, formatRwf, stationStatusLabels } from '@/lib/format';
import { monthlySeries, overviewMetrics } from '@/lib/network';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdminAccess('/admin');
  const params = await searchParams;

  const [metrics, series, stations, sessions, payments, audit] = await Promise.all([
    overviewMetrics(),
    monthlySeries(),
    prisma.station.findMany({ orderBy: { name: 'asc' }, include: { chargers: { select: { operationalStatus: true } } } }),
    prisma.chargingSession.findMany({
      take: 5,
      orderBy: { startTime: 'desc' },
      include: { customer: { include: { user: { select: { fullName: true } } } }, charger: { select: { chargerId: true, station: { select: { name: true } } } } }
    }),
    prisma.payment.findMany({ take: 5, orderBy: { timestamp: 'desc' }, include: { customer: { include: { user: { select: { fullName: true } } } } } }),
    prisma.auditLog.findMany({ take: 5, orderBy: { timestamp: 'desc' }, include: { user: { select: { email: true } } } })
  ]);

  const cards = [
    { label: 'Active stations', value: String(metrics.stations), note: `${metrics.chargers} chargers in total` },
    { label: 'Chargers online', value: String(metrics.online), note: `${metrics.faulted} faulted` },
    { label: 'Charging now', value: String(metrics.charging), note: 'Sessions in progress' },
    { label: 'Revenue today', value: formatRwf(metrics.revenueToday), note: 'Paid, Kigali day' },
    { label: 'Energy today', value: formatKwh(metrics.energyToday), note: `${metrics.sessionsToday} sessions started` },
    { label: 'Customers', value: String(metrics.customers), note: 'Registered accounts' }
  ];

  return (
    <div className="space-y-8">
      {params.error === 'forbidden' && <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Your role doesn&apos;t have access to that section, so you were sent back to the overview.</p>}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Overview</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Business overview</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-4 text-3xl font-black text-brand-navy">{card.value}</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Revenue, last 12 months</h3>
          <div className="mt-6">
            <BarChart values={series.revenue} labels={series.months.map(monthLabel)} />
          </div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Energy delivered, last 12 months</h3>
          <div className="mt-6">
            <BarChart values={series.energy} labels={series.months.map(monthLabel)} tone="cyan" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-brand-navy">Stations</h3>
            <Link href="/admin/stations" className="text-sm font-semibold text-brand-cyan">Manage</Link>
          </div>
          {stations.length === 0 ? (
            <p className="mt-5 text-sm text-slate-600">No stations yet. Add your first station to see it here.</p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Station</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Chargers</th>
                    <th className="px-4 py-3">Available</th>
                    <th className="px-4 py-3">Charging</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((station) => (
                    <tr key={station.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-semibold text-brand-navy">{station.name}</td>
                      <td className="px-4 py-3 text-slate-600">{stationStatusLabels[station.status]}</td>
                      <td className="px-4 py-3 text-slate-600">{station.chargers.length}</td>
                      <td className="px-4 py-3 text-slate-600">{station.chargers.filter((c) => c.operationalStatus === 'AVAILABLE').length}</td>
                      <td className="px-4 py-3 text-slate-600">{station.chargers.filter((c) => c.operationalStatus === 'CHARGING').length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Recent admin actions</h3>
          {audit.length === 0 ? (
            <p className="mt-5 text-sm text-slate-600">Changes you make in the Control Center will be listed here.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {audit.map((row) => (
                <div key={row.id} className="rounded-2xl bg-slate-50 p-3">
                  <p className="font-semibold text-brand-navy">{row.action}</p>
                  <p className="mt-1 text-sm text-slate-600">{row.user?.email ?? 'Unknown user'} • {row.entity}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(row.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Recent charging sessions</h3>
          {sessions.length === 0 ? (
            <p className="mt-5 text-sm text-slate-600">No charging sessions yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {sessions.map((row) => (
                <div key={row.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-brand-navy">{row.customer.user.fullName}</p>
                    <p className="text-xs text-slate-500">{row.charger.station.name} • {row.charger.chargerId} • {formatDuration(row.startTime, row.endTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-navy">{row.totalAmount !== null ? formatRwf(row.totalAmount) : '—'}</p>
                    <p className="text-xs text-slate-500">{row.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Recent payments</h3>
          {payments.length === 0 ? (
            <p className="mt-5 text-sm text-slate-600">No payments yet.</p>
          ) : (
            <div className="mt-5 space-y-3">
              {payments.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                  <div>
                    <p className="font-semibold text-brand-navy">{item.customer.user.fullName}</p>
                    <p className="text-xs text-slate-500">{item.transactionId} • {item.paymentMethod ?? 'Method not recorded'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-navy">{formatRwf(item.amount)}</p>
                    <p className="text-xs text-slate-500">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
