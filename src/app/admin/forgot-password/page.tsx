import { requestAdminPasswordResetAction } from './actions';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Account recovery</p>
        <h1 className="mt-3 text-3xl font-black text-brand-navy">Reset password</h1>
        <p className="mt-3 text-sm text-slate-600">Enter your admin email and we’ll send a one-time reset link if the account is eligible.</p>
        {params.status === 'sent' && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">If an admin account matches that address, a reset link has been sent.</p>}
        {params.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{params.error === 'email-unconfigured' || params.error === 'email-delivery' ? 'Reset email is not available right now. Please contact the system administrator.' : 'Enter a valid email address.'}</p>}
        <form action={requestAdminPasswordResetAction} className="mt-8 space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-2 block text-sm font-medium text-slate-700">Admin email</label>
            <input id="admin-email" name="email" type="email" autoComplete="email" required maxLength={254} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="you@company.rw" />
          </div>
          <button type="submit" className="w-full rounded-2xl bg-brand-navy px-5 py-3 text-sm font-semibold text-white">Send reset link</button>
        </form>
      </div>
    </main>
  );
}
