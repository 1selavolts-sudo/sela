import Link from 'next/link';
import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime, formatKwh, formatRwf } from '@/lib/format';
import { currentMomoPayment } from '@/lib/momo-payments';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const momoStatusLabels: Record<string, string> = {
  CREATED: 'Sending',
  REQUESTED: 'Waiting for approval',
  PAID: 'Paid',
  FAILED: 'Not paid'
};

export default async function AdminPaymentsPage() {
  const session = await requireAdminAccess('/admin/payments');
  const canEdit = session.role === 'SUPER_ADMIN';

  // Ask MTN about payments still waiting for approval, so a driver who closed the page is still counted.
  const waitingPayments = await prisma.momoPayment.findMany({ where: { status: 'REQUESTED' }, select: { id: true }, take: 20 });
  await Promise.all(waitingPayments.map((row) => currentMomoPayment(row.id)));

  const [payments, totals, momoPayments, momoTotals] = await Promise.all([
    prisma.payment.findMany({
      take: 200,
      orderBy: { timestamp: 'desc' },
      include: { customer: { include: { user: { select: { fullName: true } } } } }
    }),
    prisma.payment.groupBy({ by: ['status'], _sum: { amount: true }, _count: { _all: true } }),
    prisma.momoPayment.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { charger: { select: { chargerId: true, station: { select: { name: true } } } } }
    }),
    prisma.momoPayment.groupBy({ by: ['status'], _sum: { amountRwf: true }, _count: { _all: true } })
  ]);

  const paid = totals.find((row) => row.status === 'PAID');
  const momoPaid = momoTotals.find((row) => row.status === 'PAID');
  const momoWaiting = momoTotals
    .filter((row) => row.status === 'CREATED' || row.status === 'REQUESTED')
    .reduce((sum, row) => sum + (row._count._all ?? 0), 0);

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Finance</p>
          <h2 className="mt-2 text-3xl font-black text-brand-navy">Payments and revenue</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Paid to date</p>
            <p className="mt-4 text-3xl font-black text-brand-navy">{formatRwf(paid?._sum.amount ?? 0)}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{paid?._count._all ?? 0} payments</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Pending or authorized</p>
            <p className="mt-4 text-3xl font-black text-brand-navy">{totals.filter((row) => row.status === 'PENDING' || row.status === 'AUTHORIZED').reduce((sum, row) => sum + (row._count._all ?? 0), 0)}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Awaiting confirmation</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Failed or refunded</p>
            <p className="mt-4 text-3xl font-black text-brand-navy">{totals.filter((row) => row.status === 'FAILED' || row.status === 'REFUNDED').reduce((sum, row) => sum + (row._count._all ?? 0), 0)}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Needs review</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
          {payments.length === 0 ? (
            <p className="p-6 text-sm text-slate-600">No account payments yet. Payments appear here once customer accounts are open.</p>
          ) : (
            <table className="admin-table min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Time</th>
                  {canEdit && <th className="px-4 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 font-semibold text-brand-navy" data-label="Transaction">{payment.transactionId}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Customer">{payment.customer.user.fullName}</td>
                    <td className="px-4 py-3 font-semibold text-brand-navy" data-label="Amount">{formatRwf(payment.amount)}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Method">{payment.paymentMethod ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Status">{payment.status}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Time">{formatDateTime(payment.timestamp)}</td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <Link href={`/admin/payments/${payment.id}`} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-navy">Edit</Link>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Mobile money</p>
          <h2 className="mt-2 text-3xl font-black text-brand-navy">MTN MoMo payments</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Drivers pay for charging with MoMo, without an account. A payment shows as Paid only after MTN confirms it.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">MoMo paid to date</p>
            <p className="mt-4 text-3xl font-black text-brand-navy">{formatRwf(momoPaid?._sum.amountRwf ?? 0)}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{momoPaid?._count._all ?? 0} payments</p>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">Waiting for approval</p>
            <p className="mt-4 text-3xl font-black text-brand-navy">{momoWaiting}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Drivers still approving on their phone</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
          {momoPayments.length === 0 ? (
            <p className="p-6 text-sm text-slate-600">No MoMo payments yet. They appear here when a driver pays at a charger.</p>
          ) : (
            <table className="admin-table min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Charger</th>
                  <th className="px-4 py-3">MoMo number</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Energy (estimate)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {momoPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 text-slate-600" data-label="When">{formatDateTime(payment.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Charger">{payment.charger.chargerId} • {payment.charger.station.name}</td>
                    <td className="px-4 py-3 font-semibold text-brand-navy" data-label="MoMo number">{payment.phone}</td>
                    <td className="px-4 py-3 font-semibold text-brand-navy" data-label="Amount">{formatRwf(payment.amountRwf)}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Energy (estimate)">{formatKwh(payment.energyEstimateKwh)}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Status">
                      {momoStatusLabels[payment.status] ?? payment.status}
                      {payment.providerReason && <span className="block text-xs text-slate-500">{payment.providerReason}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 break-all" data-label="Reference">{payment.providerReference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
