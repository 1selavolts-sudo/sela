import Link from 'next/link';
import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const session = await requireAdminAccess('/admin/customers');
  const canEdit = session.role === 'SUPER_ADMIN';

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
          <table className="admin-table min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Vehicles</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Joined</th>
                {canEdit && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3" data-label="Customer">
                    <p className="font-semibold text-brand-navy">{customer.user.fullName}</p>
                    <p className="text-xs text-slate-500">{customer.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600" data-label="Phone">{customer.user.phoneNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="Vehicles">{customer._count.vehicles}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="Sessions">{customer._count.sessions}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="Account">{customer.accountStatus}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="Joined">{formatDateTime(customer.createdAt)}</td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Link href={`/admin/customers/${customer.id}`} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-navy">Edit</Link>
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
  );
}
