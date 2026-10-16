import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { accountStatusLabels, accountStatuses } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { updateCustomer } from '../actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the customer details. Name and a valid email are required.',
  exists: 'Another account already uses that email address.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminCustomerEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireSuperAdmin('/admin/customers');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const customer = await prisma.customerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { fullName: true, email: true, phoneNumber: true } },
      _count: { select: { vehicles: true, sessions: true, payments: true } }
    }
  });
  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/customers" className="text-sm font-semibold text-brand-navy">← All customers</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Customer</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">{customer.user.fullName}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {customer._count.vehicles} vehicle{customer._count.vehicles === 1 ? '' : 's'} • {customer._count.sessions} session{customer._count.sessions === 1 ? '' : 's'} • {customer._count.payments} payment{customer._count.payments === 1 ? '' : 's'}
        </p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Changes saved.</p>}

      <form action={updateCustomer} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="id" value={customer.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">Full name
          <input name="fullName" required maxLength={120} defaultValue={customer.user.fullName} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Email
          <input name="email" type="email" required maxLength={254} defaultValue={customer.user.email} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Phone (optional)
          <input name="phoneNumber" maxLength={40} defaultValue={customer.user.phoneNumber ?? ''} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Account
          <select name="accountStatus" defaultValue={customer.accountStatus} className={inputClass}>
            {accountStatuses.map((status) => (
              <option key={status} value={status}>{accountStatusLabels[status]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Preferred connector
          <select name="preferredConnector" defaultValue={customer.preferredConnector ?? ''} className={inputClass}>
            <option value="">Not set</option>
            <option value="CCS2">CCS2</option>
            <option value="GB_T">GB/T</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Vehicle make (optional)
          <input name="vehicleMake" maxLength={80} defaultValue={customer.vehicleMake ?? ''} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Vehicle model (optional)
          <input name="vehicleModel" maxLength={80} defaultValue={customer.vehicleModel ?? ''} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Licence plate (optional)
          <input name="licensePlate" maxLength={20} defaultValue={customer.licensePlate ?? ''} className={inputClass} />
        </label>
        <div className="md:col-span-2 xl:col-span-3">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save customer</button>
        </div>
      </form>
    </div>
  );
}
