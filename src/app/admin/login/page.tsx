import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { loginAction } from './actions';

export default function AdminLoginPage({ searchParams }: { searchParams?: { error?: string } }) {
	const error = searchParams?.error;

	return (
		<main className="flex min-h-screen items-center justify-center bg-brand-navy px-4 py-12">
			<div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:grid-cols-[1fr_0.9fr]">
				<div className="hidden bg-gradient-to-br from-brand-navy to-slate-800 p-12 text-white lg:block"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-cyan">SELAVOLT operations</p><h1 className="mt-6 text-4xl font-black leading-tight">Powering Rwanda&apos;s electric future.</h1><p className="mt-5 max-w-md text-slate-300">Manage charging stations, sessions, customers, payments, and network performance from one secure workspace.</p><div className="mt-16 flex items-center gap-3 text-sm text-slate-300"><ActivityIcon /> Live network control</div></div>
				<div className="p-7 sm:p-12"><Link href="/" className="text-sm font-semibold text-brand-navy">SELAVOLT</Link><div className="mt-12"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/20 text-brand-navy"><LockKeyhole className="h-6 w-6" /></div><h2 className="mt-6 text-3xl font-black text-brand-navy">Admin sign in</h2><p className="mt-2 text-slate-600">Use your operations credentials to continue.</p>{error && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">Invalid credentials. Demo access: admin@selavolt.rw / password123</p>}<form action={loginAction} className="mt-8 space-y-5"><label className="block text-sm font-semibold text-brand-navy">Email<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-cyan" placeholder="admin@selavolt.rw" /></label><label className="block text-sm font-semibold text-brand-navy">Password<input name="password" type="password" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-cyan" placeholder="••••••••" /></label><button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 font-bold text-brand-navy">Sign in <ArrowRight className="h-4 w-4" /></button></form></div></div>
			</div>
		</main>
	);
}

function ActivityIcon() {
	return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-brand-green" />;
}
