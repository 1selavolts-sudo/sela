import { adminRoles } from '@/lib/admin-access';
import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { changeStaffRole, createAdmin } from './actions';

export const dynamic = 'force-dynamic';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Admin',
  STATION_MANAGER: 'Station manager',
  SUPPORT: 'Support'
};

const messages: Record<string, string> = {
  invalid: 'Check the new admin details. The password must be 12 to 128 characters.',
  exists: 'An account with that email already exists.',
  'not-found': 'That account no longer exists.',
  self: 'You cannot change your own role.'
};

const saved: Record<string, string> = {
  created: 'Admin account created. Give them the temporary password and ask them to change it after signing in.',
  role: 'Role updated.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminStaffPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const session = await requireAdminAccess('/admin/staff');
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
        <p className="mt-2 max-w-2xl text-sm text-slate-600">Only super admins can see this page. Each role sees the Control Center sections listed in admin-access.ts.</p>
      </div>

      {params.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[params.error] ?? 'Something went wrong. Please try again.'}</p>}
      {params.saved && saved[params.saved] && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saved[params.saved]}</p>}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name and email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Change role</th>
              <th className="px-4 py-3">Added</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => {
              const currentRole = member.roles.map((role) => role.name).find((name) => (adminRoles as readonly string[]).includes(name)) ?? '';
              const isSelf = member.email === session.email;
              return (
                <tr key={member.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-brand-navy">{member.fullName}</p>
                    <p className="text-xs text-slate-500">{member.email}{isSelf ? ' (you)' : ''}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{roleLabels[currentRole] ?? currentRole}</td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-xs text-slate-500">Ask another super admin to change your role.</span>
                    ) : (
                      <form action={changeStaffRole} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={member.id} />
                        <select name="role" defaultValue={currentRole} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                        <button type="submit" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-brand-navy">Save</button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(member.createdAt)}</td>
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
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
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
