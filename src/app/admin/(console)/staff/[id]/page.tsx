import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminRoles } from '@/lib/admin-access';
import { requireSuperAdmin } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';
import { updateStaff } from '../actions';

export const dynamic = 'force-dynamic';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  STATION_MANAGER: 'Station manager',
  SUPPORT: 'Support',
  NONE: 'No admin access'
};

const messages: Record<string, string> = {
  invalid: 'Check the details. Name and a valid email are required. A new password must be 12 to 128 characters, or left blank.',
  exists: 'Another account already uses that email address.',
  'last-super-admin': 'At least one super admin must remain. Make another person a super admin before changing this one.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminStaffEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const session = await requireSuperAdmin('/admin/staff');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const member = await prisma.user.findUnique({ where: { id }, include: { roles: { select: { name: true } } } });
  if (!member) {
    notFound();
  }
  const currentRole = member.roles.map((role) => role.name).find((name) => (adminRoles as readonly string[]).includes(name)) ?? 'NONE';
  const isSelf = member.email === session.email;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/staff" className="text-sm font-semibold text-brand-navy">← Staff and permissions</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Staff</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">{member.fullName}</h2>
        <p className="mt-1 text-sm text-slate-600">{member.email}{isSelf ? ' (you)' : ''}</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Changes saved.</p>}

      <form action={updateStaff} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="id" value={member.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">Full name
          <input name="fullName" required maxLength={120} defaultValue={member.fullName} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Email
          <input name="email" type="email" required maxLength={254} defaultValue={member.email} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Role
          <select name="role" defaultValue={currentRole} className={inputClass}>
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-3">New password (optional)
          <input name="password" type="password" minLength={12} maxLength={128} autoComplete="new-password" placeholder="Leave blank to keep the current password" className={inputClass} />
        </label>
        <div className="md:col-span-2 xl:col-span-3">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save changes</button>
          {isSelf && <p className="mt-3 text-sm text-slate-600">Changing your own email or role signs you out. Sign in again to use the new access.</p>}
        </div>
      </form>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-bold text-brand-navy">Remove admin access</h3>
        <p className="mt-2 text-sm text-slate-600">Choose No admin access and save. The account stays as a customer account, and it can no longer sign in to the Control Center. A session that is already open keeps its access until it expires, which takes up to 8 hours.</p>
      </section>
    </div>
  );
}
