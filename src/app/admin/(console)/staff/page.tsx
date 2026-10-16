import Link from 'next/link';
import { adminRoles } from '@/lib/admin-access';
import { requireSuperAdmin } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { changeStaffRole, createAdmin } from './actions';

export const dynamic = 'force-dynamic';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  STATION_MANAGER: 'Station manager',
  SUPPORT: 'Support',
  NONE: 'No admin access'
};

const messages: Record<string, string> = {
  invalid: 'Check the details. Choose a valid role, and use a password of 12 to 128 characters when adding an admin.',
  exists: 'An account with that email already exists.',
  'not-found': 'That account no longer exists.',
  'last-super-admin': 'At least one super admin must remain. Make another person a super admin before changing this one.'
};

const saved: Record<string, string> = {
  created: 'Admin account created. Give them the temporary password and ask them to change it after signing in.',
  role: 'Role updated.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminStaffPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const session = await requireSuperAdmin('/admin/staff');
  const params = await searchParams;
  const staff = await prisma.user.findMany({
    where: { roles: { some: { name: { in: [...adminRoles] } } } },
    orderBy: { email: 'asc' },
    include: { roles: { select: { name: true } } }
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Access</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Staff and permissions</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">Only super admins can see this page. Each role sees the Control Center sections listed in admin-access.ts. You can change anyone&apos;s role, including your own, as long as at least one super admin remains.</p>
      </div>

      {params.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[params.error] ?? 'Something went wrong. Please try again.'}</p>}
      {params.saved && saved[params.saved] && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saved[params.saved]}</p>}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        <table className="admin-table min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name and email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Change role</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => {
              const currentRole = member.roles.map((role) => role.name).find((name) => (adminRoles as readonly string[]).includes(name)) ?? '';
              const isSelf = member.email === session.email;
              return (
                <tr key={member.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3" data-label="Name and email">
                    <p className="font-semibold text-brand-navy">{member.fullName}</p>
                    <p className="text-xs text-slate-500">{member.email}{isSelf ? ' (you)' : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600" data-label="Role">{roleLabels[currentRole] ?? currentRole}</td>
                  <td className="px-4 py-3" data-label="Change role">
                    <form action={changeStaffRole} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={member.id} />
                      <select name="role" defaultValue={currentRole} aria-label={`Role for ${member.email}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <button type="submit" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy">Save</button>
                    </form>
                    {isSelf && <p className="mt-2 text-xs text-slate-500">Changing your own role signs you out.</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600" data-label="Added">{formatDateTime(member.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Link href={`/admin/staff/${member.id}`} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-navy">Edit</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold text-brand-navy">Add an admin</h3>
        <p className="mt-1 text-sm text-slate-600">Email reset links only reach the account owner for now, so set a temporary password here and share it privately.</p>
        <form action={createAdmin} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input name="fullName" required maxLength={120} placeholder="Full name" className={inputClass} />
          <input name="email" type="email" required maxLength={254} placeholder="Email" className={inputClass} />
          <select name="role" defaultValue="SUPPORT" className={inputClass}>
            {adminRoles.map((role) => (
              <option key={role} value={role}>{roleLabels[role]}</option>
            ))}
          </select>
          <input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" placeholder="Temporary password (12+ characters)" className={inputClass} />
          <div className="md:col-span-2 xl:col-span-4">
            <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Create admin account</button>
          </div>
        </form>
      </section>
    </div>
  );
}
