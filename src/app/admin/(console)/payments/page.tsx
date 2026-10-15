import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime, formatRwf } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  await requireAdminAccess('/admin/payments');

  const [payments, totals] = await Promise.all([
    prisma.payment.findMany({
      take: 200,
      orderBy: { timestamp: 'desc' },
      include: { customer: { include: { user: { select: { fullName: true } } } } }
    }),
    prisma.payment.groupBy({ by: ['status'], _sum: { amount: true }, _count: { _all: true } })
  ]);

  const paid = totals.find((row) => row.status === 'PAID');

  return (
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
          <p className="p-6 text-sm text-slate-600">No payments yet. Payments appear here once customers pay for charging.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-semibold text-brand-navy">{payment.transactionId}</td>
                  <td className="px-4 py-3 text-slate-600">{payment.customer.user.fullName}</td>
                  <td className="px-4 py-3 font-semibold text-brand-navy">{formatRwf(payment.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{payment.paymentMethod ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{payment.status}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(payment.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
