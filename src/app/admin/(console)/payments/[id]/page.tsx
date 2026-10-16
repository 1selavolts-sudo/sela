import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { formatDateTime, paymentStatusLabels, paymentStatuses } from '@/lib/format';
import { toKigaliInputValue } from '@/lib/network';
import { prisma } from '@/lib/prisma';
import { updatePayment } from '../actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the payment details. Amount, energy and time are required, and amounts must be numbers.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminPaymentEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireSuperAdmin('/admin/payments');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { customer: { include: { user: { select: { fullName: true } } } }, session: { select: { sessionId: true } } }
  });
  if (!payment) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/payments" className="text-sm font-semibold text-brand-navy">← All payments</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Payment</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">{payment.transactionId}</h2>
        <p className="mt-1 text-sm text-slate-600">{payment.customer.user.fullName} • session {payment.session.sessionId} • {formatDateTime(payment.createdAt)}</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Changes saved. The session has its own total, so check the Sessions page if the amount changed.</p>}

      <form action={updatePayment} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="id" value={payment.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">Payment status
          <select name="status" defaultValue={payment.status} className={inputClass}>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{paymentStatusLabels[status]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Amount (RWF)
          <input name="amount" required inputMode="decimal" defaultValue={payment.amount} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Method
          <input name="paymentMethod" maxLength={60} defaultValue={payment.paymentMethod ?? ''} placeholder="e.g. Mobile money" className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Energy (kWh)
          <input name="energyKwh" required inputMode="decimal" defaultValue={payment.energyKwh} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Time
          <input name="timestamp" type="datetime-local" required defaultValue={toKigaliInputValue(payment.timestamp)} className={inputClass} />
        </label>
        <div className="md:col-span-2 xl:col-span-3">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save payment</button>
        </div>
      </form>
    </div>
  );
}
