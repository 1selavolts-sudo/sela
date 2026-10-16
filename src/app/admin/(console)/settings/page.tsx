import { requireAdminAccess } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';
import { momoConfigured } from '@/lib/momo';
import { formatLocalNumber, supportWhatsApp } from '@/lib/site-settings';
import { updateSupportWhatsApp } from './actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  whatsapp: 'Enter a Rwandan mobile number, for example 0789 662 677 or +250 789 662 677.'
};

const saved: Record<string, string> = {
  whatsapp: 'WhatsApp number saved. The Contact page shows it now.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

// Shows what is configured, and lets admins change the support WhatsApp number. Secret values are never displayed, only whether they are set.
export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/settings');
  const params = await searchParams;
  const whatsapp = await supportWhatsApp();

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
    ['MTN MoMo payments', momoConfigured() ? 'Configured (MTN Collections)' : 'Not configured. Add the MTN_MOMO settings in Railway.', momoConfigured()],
    ['Card payments', 'Not connected', false],
    ['Charger connection (OCPP)', 'Not connected', false]
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">System</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Settings and status</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">Contact details can be changed here. The rest is set in the hosting dashboard (Railway), because some of it is secret.</p>
      </div>

      {params.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[params.error] ?? 'Something went wrong. Please try again.'}</p>}
      {params.saved && saved[params.saved] && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saved[params.saved]}</p>}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold text-brand-navy">Contact details</h3>
        <p className="mt-1 text-sm text-slate-600">Shown on the public Contact page so customers can message support on WhatsApp.</p>
        <form action={updateSupportWhatsApp} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">WhatsApp support number
            <input name="whatsapp" required inputMode="tel" maxLength={20} defaultValue={formatLocalNumber(whatsapp)} className={inputClass} />
          </label>
          <div className="flex items-end">
            <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save number</button>
          </div>
        </form>
      </section>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        <table className="admin-table min-w-full text-left text-sm">
          <tbody>
            {rows.map(([label, value, ok]) => (
              <tr key={label} className="border-t border-slate-200 first:border-t-0">
                <td className="px-4 py-4 font-semibold text-brand-navy">{label}</td>
                <td className="px-4 py-4 text-slate-600 break-all" data-label="Current value">{value}</td>
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
