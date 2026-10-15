import { requireAdminAccess } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Shows what is configured. Secret values are never displayed, only whether they are set.
export default async function AdminSettingsPage() {
  await requireAdminAccess('/admin/settings');

  let databaseReachable = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    databaseReachable = false;
  }

  const secretLength = process.env.ADMIN_SESSION_SECRET?.length ?? 0;
  const rows: [string, string, boolean][] = [
    ['Database', databaseReachable ? 'Connected' : 'Not reachable', databaseReachable],
    ['Email sending', process.env.RESEND_API_KEY ? 'Configured (Resend)' : 'Not configured. Set RESEND_API_KEY.', Boolean(process.env.RESEND_API_KEY)],
    ['Sender address', process.env.EMAIL_FROM || 'SELA ENERGY <onboarding@resend.dev> (test sender)', Boolean(process.env.EMAIL_FROM) || Boolean(process.env.RESEND_API_KEY)],
    ['Admin session secret', secretLength >= 32 ? 'Set' : 'Missing or shorter than 32 characters', secretLength >= 32],
    ['Currency', 'RWF', true],
    ['Payment provider', 'Not connected', false],
    ['Charger connection (OCPP)', 'Not connected', false]
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">System</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Settings and status</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">What the system is connected to right now. Changing these values is done in the hosting dashboard, not here.</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        <table className="min-w-full text-left text-sm">
          <tbody>
            {rows.map(([label, value, ok]) => (
              <tr key={label} className="border-t border-slate-200 first:border-t-0">
                <td className="px-4 py-4 font-semibold text-brand-navy">{label}</td>
                <td className="px-4 py-4 text-slate-600">{value}</td>
                <td className="px-4 py-4 text-right">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{ok ? 'OK' : 'Action needed'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
