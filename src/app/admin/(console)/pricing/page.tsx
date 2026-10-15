import { requireAdminAccess } from '@/lib/admin-session';
import { connectorLabels, formatDateTime } from '@/lib/format';
import { toKigaliInputValue } from '@/lib/network';
import { prisma } from '@/lib/prisma';
import { createPricingRule, deletePricingRule, updatePricingRule } from './actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the rate. The price must be a whole number of RWF, and a start time is required.',
  dates: 'The end time must be after the start time.',
  'no-station': 'Choose a station that exists.',
  'not-found': 'That rate no longer exists.'
};

const saved: Record<string, string> = {
  created: 'Rate added.',
  updated: 'Rate updated.',
  deleted: 'Rate deleted.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-cyan';

export default async function AdminPricingPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/pricing');
  const params = await searchParams;
  const now = new Date();
  const [rules, stations] = await Promise.all([
    prisma.pricingRule.findMany({ orderBy: { validFrom: 'desc' }, include: { station: { select: { name: true } } } }),
    prisma.station.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Pricing</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Rates per kWh</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">The most specific active rate applies: a station and connector rate beats a station rate, which beats a connector rate, which beats an all-stations rate.</p>
      </div>

      {params.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[params.error] ?? 'Something went wrong. Please try again.'}</p>}
      {params.saved && saved[params.saved] && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saved[params.saved]}</p>}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        {rules.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No rates yet. Add a rate below, for example an all-stations rate.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Applies to</th>
                <th className="px-4 py-3">Rate (RWF/kWh)</th>
                <th className="px-4 py-3">Starts</th>
                <th className="px-4 py-3">Ends</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Change</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => {
                const status = now < rule.validFrom ? 'Scheduled' : rule.validTo && now >= rule.validTo ? 'Ended' : 'Active';
                const scope = `${rule.station ? rule.station.name : 'All stations'} • ${rule.connectorType ? connectorLabels[rule.connectorType] : 'All connectors'}`;
                return (
                  <tr key={rule.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 font-semibold text-brand-navy">{scope}</td>
                    <td className="px-4 py-3 text-slate-700">{Math.round(rule.pricePerKwh).toLocaleString('en-US')}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(rule.validFrom)}</td>
                    <td className="px-4 py-3 text-slate-600">{rule.validTo ? formatDateTime(rule.validTo) : 'No end'}</td>
                    <td className="px-4 py-3 text-slate-600">{status}</td>
                    <td className="px-4 py-3">
                      <form action={updatePricingRule} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={rule.id} />
                        <input name="pricePerKwh" required inputMode="numeric" defaultValue={Math.round(rule.pricePerKwh)} className={`${inputClass} w-28`} aria-label="Rate in RWF per kWh" />
                        <input name="validTo" type="datetime-local" defaultValue={toKigaliInputValue(rule.validTo)} className={inputClass} aria-label="End time (Kigali time, leave empty for no end)" />
                        <button type="submit" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy">Save</button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action={deletePricingRule}>
                        <input type="hidden" name="id" value={rule.id} />
                        <button type="submit" className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold text-brand-navy">Add a rate</h3>
        <p className="mt-1 text-sm text-slate-600">Times are in Kigali time. Leave the end time empty for a rate that stays in force.</p>
        <form action={createPricingRule} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">Station
            <select name="stationId" defaultValue="" className={inputClass}>
              <option value="">All stations</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>{station.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Connector
            <select name="connectorType" defaultValue="" className={inputClass}>
              <option value="">All connectors</option>
              <option value="CCS2">CCS2</option>
              <option value="GB_T">GB/T</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Rate (RWF per kWh)
            <input name="pricePerKwh" required inputMode="numeric" placeholder="e.g. 420" className={inputClass} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Starts
            <input name="validFrom" type="datetime-local" required defaultValue={toKigaliInputValue(now)} className={inputClass} />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">Ends (optional)
            <input name="validTo" type="datetime-local" className={inputClass} />
          </label>
          <div className="md:col-span-2 xl:col-span-5">
            <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Add rate</button>
          </div>
        </form>
      </section>
    </div>
  );
}
