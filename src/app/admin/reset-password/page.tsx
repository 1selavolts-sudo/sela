import { resetAdminPasswordAction } from '../forgot-password/actions';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg rounded-[30px] border border-slate-200 bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Set new password</p>
        <h1 className="mt-3 text-3xl font-black text-brand-navy">Create a new admin password</h1>
        {params.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{params.error === 'weak-password' ? 'Use a password between 12 and 128 characters.' : params.error === 'password-mismatch' ? 'The passwords do not match.' : 'This reset link is invalid or expired. Request a new link.'}</p>}
        {!params.token && <p role="alert" className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Open the reset link from your email, or request a new one.</p>}
        {params.token && <form action={resetAdminPasswordAction} className="mt-8 space-y-5">
          <input type="hidden" name="token" value={params.token} />
          <div>
            <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-700">New password</label>
            <input id="new-password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="At least 12 characters" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label>
            <input id="confirm-password" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Enter the new password again" />
          </div>
          <button type="submit" className="w-full rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Update password</button>
        </form>}
      </div>
    </main>
  );
}
