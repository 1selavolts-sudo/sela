import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { paymentStatusLabels, paymentStatuses, sessionStatusLabels, sessionStatuses } from '@/lib/format';
import { toKigaliInputValue } from '@/lib/network';
import { prisma } from '@/lib/prisma';
import { updateSession } from '../actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the session details. Times are required, and energy and amount must be numbers or left empty.',
  dates: 'The end time must be after the start time.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminSessionEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireSuperAdmin('/admin/sessions');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const item = await prisma.chargingSession.findUnique({
    where: { id },
    include: {
      customer: { include: { user: { select: { fullName: true } } } },
      charger: { select: { chargerId: true, station: { select: { name: true } } } }
    }
  });
  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/sessions" className="text-sm font-semibold text-brand-navy">← All sessions</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Charging session</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">{item.sessionId}</h2>
        <p className="mt-1 text-sm text-slate-600">{item.customer.user.fullName} • {item.charger.station.name} • {item.charger.chargerId}</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Changes saved. Payments are separate records, so check the Payments page if amounts changed.</p>}

      <form action={updateSession} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="id" value={item.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">Session status
          <select name="status" defaultValue={item.status} className={inputClass}>
            {sessionStatuses.map((status) => (
              <option key={status} value={status}>{sessionStatusLabels[status]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Payment status
          <select name="paymentStatus" defaultValue={item.paymentStatus} className={inputClass}>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{paymentStatusLabels[status]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Started
          <input name="startTime" type="datetime-local" required defaultValue={toKigaliInputValue(item.startTime)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Ended (optional)
          <input name="endTime" type="datetime-local" defaultValue={toKigaliInputValue(item.endTime)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Energy delivered (kWh)
          <input name="energyDeliveredKwh" inputMode="decimal" defaultValue={item.energyDeliveredKwh ?? ''} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Total amount (RWF)
          <input name="totalAmount" inputMode="decimal" defaultValue={item.totalAmount ?? ''} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-3">Notes (optional)
          <textarea name="notes" maxLength={500} rows={3} defaultValue={item.notes ?? ''} className={`${inputClass} min-h-24`} />
        </label>
        <div className="md:col-span-2 xl:col-span-3">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save session</button>
        </div>
      </form>
    </div>
  );
}
