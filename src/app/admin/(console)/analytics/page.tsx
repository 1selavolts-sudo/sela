import { BarChart, monthLabel } from '@/components/admin/bar-chart';
import { requireAdminAccess } from '@/lib/admin-session';
import { formatKwh, formatRwf } from '@/lib/format';
import { monthlySeries, utilisationByStation } from '@/lib/network';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  await requireAdminAccess('/admin/analytics');

  const [series, utilisation] = await Promise.all([monthlySeries(), utilisationByStation()]);
  const labels = series.months.map(monthLabel);
  const totalRevenue = series.revenue.reduce((sum, value) => sum + value, 0);
  const totalEnergy = series.energy.reduce((sum, value) => sum + value, 0);
  const totalSessions = series.sessions.reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Analytics</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Business analytics</h2>
        <p className="mt-2 text-sm text-slate-600">Totals for the last 12 months, Kigali time.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-4 text-3xl font-black text-brand-navy">{formatRwf(totalRevenue)}</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Energy delivered</p>
          <p className="mt-4 text-3xl font-black text-brand-navy">{formatKwh(totalEnergy)}</p>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <p className="text-sm text-slate-500">Sessions</p>
          <p className="mt-4 text-3xl font-black text-brand-navy">{totalSessions}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Revenue (RWF)</h3>
          <div className="mt-5"><BarChart values={series.revenue} labels={labels} /></div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Energy (kWh)</h3>
          <div className="mt-5"><BarChart values={series.energy} labels={labels} tone="cyan" /></div>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <h3 className="text-xl font-bold text-brand-navy">Sessions</h3>
          <div className="mt-5"><BarChart values={series.sessions} labels={labels} tone="amber" /></div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold text-brand-navy">Chargers in use right now</h3>
        {utilisation.length === 0 ? (
          <p className="mt-5 text-sm text-slate-600">No open stations yet.</p>
        ) : (
          <div className="mt-6 space-y-4">
            {utilisation.map((item) => (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>{item.name}</span>
                  <span>{item.busy} of {item.total} ({item.percent}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-brand-green to-brand-cyan" style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
