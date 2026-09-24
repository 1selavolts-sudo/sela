'use client';

import Link from 'next/link';
import { Activity, Bell, LogOut, Menu, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { adminNav } from '@/lib/admin-data';
import { logoutAction } from '@/app/admin/login/actions';

export function AdminShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isLogin = pathname === '/admin/login';

	if (isLogin) return <>{children}</>;

	return (
		<div className="min-h-screen bg-slate-100 text-slate-900">
			<aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-brand-navy px-5 py-6 text-white lg:block">
				<Link href="/admin" className="flex items-center gap-3 border-b border-white/10 pb-6">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green text-lg font-black text-brand-navy">S</div>
					<div><p className="text-lg font-black">SELAVOLT</p><p className="text-[10px] uppercase tracking-[0.24em] text-brand-cyan">Operations</p></div>
				</Link>
				<nav className="mt-6 space-y-1">{adminNav.map((item) => <Link key={item.href} href={item.href} className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${pathname === item.href ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>{item.title}</Link>)}</nav>
				<div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-cyan">Demo environment</p><p className="mt-2 text-sm text-slate-300">Operational data is staged for development.</p></div>
			</aside>
			<div className="lg:pl-72"><header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8"><div className="flex items-center gap-3"><Menu className="h-5 w-5 text-slate-500 lg:hidden" /><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">SELAVOLT Admin</p><p className="font-semibold text-brand-navy">Network operations</p></div></div><div className="flex items-center gap-3"><button aria-label="Notifications" className="rounded-xl border border-slate-200 p-2 text-slate-600"><Bell className="h-4 w-4" /></button><Link href="/admin/settings" aria-label="Settings" className="rounded-xl border border-slate-200 p-2 text-slate-600"><Settings className="h-4 w-4" /></Link><form action={logoutAction}><button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-navy"><LogOut className="h-4 w-4" /> Sign out</button></form></div></header><main className="mx-auto max-w-7xl p-4 sm:p-8">{children}</main></div>
		</div>
	);
}
