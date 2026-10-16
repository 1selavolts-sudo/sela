import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { connectorLabels, formatDateTime } from '@/lib/format';
import { toKigaliInputValue } from '@/lib/network';
import { prisma } from '@/lib/prisma';
import { updatePricingRule } from '../actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the rate. The price must be a whole number of RWF, and a start time is required.',
  dates: 'The end time must be after the start time.',
  'no-station': 'Choose a station that exists.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminPricingEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/pricing');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const [rule, stations] = await Promise.all([
    prisma.pricingRule.findUnique({ where: { id }, include: { station: { select: { name: true } } } }),
    prisma.station.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  ]);
  if (!rule) {
    notFound();
  }

  const scope = `${rule.station ? rule.station.name : 'All stations'} • ${rule.connectorType ? connectorLabels[rule.connectorType] : 'All connectors'}`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/pricing" className="text-sm font-semibold text-brand-navy">← All rates</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Rate</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">RWF {Math.round(rule.pricePerKwh).toLocaleString('en-US')} per kWh</h2>
        <p className="mt-1 text-sm text-slate-600">{scope} • Starts {formatDateTime(rule.validFrom)}</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Rate updated.</p>}

      <form action={updatePricingRule} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="id" value={rule.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">Station
          <select name="stationId" defaultValue={rule.stationId ?? ''} className={inputClass}>
            <option value="">All stations</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>{station.name}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Connector
          <select name="connectorType" defaultValue={rule.connectorType ?? ''} className={inputClass}>
            <option value="">All connectors</option>
            <option value="CCS2">CCS2</option>
            <option value="GB_T">GB/T</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Rate (RWF per kWh)
          <input name="pricePerKwh" required inputMode="numeric" defaultValue={Math.round(rule.pricePerKwh)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Starts
          <input name="validFrom" type="datetime-local" required defaultValue={toKigaliInputValue(rule.validFrom)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Ends (optional)
          <input name="validTo" type="datetime-local" defaultValue={toKigaliInputValue(rule.validTo)} className={inputClass} />
        </label>
        <div className="md:col-span-2 xl:col-span-3">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save rate</button>
        </div>
      </form>
    </div>
  );
}
