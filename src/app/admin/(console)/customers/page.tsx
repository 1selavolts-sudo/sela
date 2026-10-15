import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  await requireAdminAccess('/admin/customers');

  const customers = await prisma.customerProfile.findMany({
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { fullName: true, email: true, phoneNumber: true } },
      _count: { select: { vehicles: true, sessions: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Customers</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Customers</h2>
        <p className="mt-2 text-sm text-slate-600">Customer sign-up is not connected to the website yet, so this list fills in once customers can register.</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        {customers.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No customers yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Vehicles</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-navy">{customer.user.fullName}</p>
                    <p className="text-xs text-slate-500">{customer.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{customer.user.phoneNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{customer._count.vehicles}</td>
                  <td className="px-4 py-3 text-slate-600">{customer._count.sessions}</td>
                  <td className="px-4 py-3 text-slate-600">{customer.accountStatus}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(customer.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
