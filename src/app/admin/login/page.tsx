import { BrandLogo } from '@/components/brand-logo';
import { loginAction } from './actions';

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ status?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center justify-center">
          <BrandLogo className="h-auto w-full max-w-[300px]" />
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Secure access</p>
          <h1 className="mt-3 text-3xl font-black text-brand-navy">Admin login</h1>
          {params.status === 'password-updated' && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Password updated. Sign in with your new password.</p>}
          {params.error === 'invalid-credentials' && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Email or password is incorrect.</p>}
          {params.error === 'missing-credentials' && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Enter your email and password.</p>}
          {params.error === 'service-unavailable' && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Admin sign-in is temporarily unavailable. Try again shortly.</p>}
          {params.error === 'too-many-attempts' && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">Too many sign-in attempts. Wait 15 minutes and try again.</p>}
        </div>

        <form action={loginAction} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" autoComplete="username" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input name="password" type="password" autoComplete="current-password" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <a href="/admin/forgot-password" className="font-medium text-brand-navy">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-400"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
