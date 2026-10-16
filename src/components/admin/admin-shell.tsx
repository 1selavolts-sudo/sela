import Link from 'next/link';
import { Bell, ChevronDown, LogOut, Search } from 'lucide-react';
import { logoutAction } from '@/app/admin/login/actions';
import { BrandLogo } from '@/components/brand-logo';
import { canAccessAdminPath } from '@/lib/admin-access';
import { adminNav } from '@/lib/admin-nav';
import type { AdminSession } from '@/lib/admin-auth';

export function AdminShell({ session, children }: { session: AdminSession; children: React.ReactNode }) {
  const navItems = adminNav.filter((item) => canAccessAdminPath(session.role, item.href));

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col bg-brand-navy text-slate-100 lg:flex">
          <Link href="/admin" aria-label="Go to Control Center overview" className="block border-b border-white/10 px-6 py-5 transition hover:bg-white/5">
            <BrandLogo variant="compact" tone="dark" className="h-10 w-auto" />
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-cyan">CONTROL CENTER</p>
          </Link>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Operations</p>
                  <Link href="/admin" className="text-xl font-black text-brand-navy hover:text-brand-green">SELA ENERGY Control Center</Link>
                </div>
              </div>

              <div className="hidden flex-1 items-center justify-center px-8 md:flex">
                <div className="flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500">
                  <Search className="h-4 w-4" />
                  <span className="text-sm">Use the menu to find stations, chargers, sessions and customers</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-brand-navy sm:inline-flex" aria-hidden="true">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
                    {session.email.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="max-w-[14rem] truncate text-sm font-semibold text-brand-navy">{session.email}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{session.role.replaceAll('_', ' ')}</p>
                  </div>
                  <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
                </div>
                <form action={logoutAction}>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-brand-navy">
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </form>
              </div>
            </div>
          </header>

          <nav aria-label="Control Center sections" className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-brand-navy">
                {item.title}
              </Link>
            ))}
          </nav>

          <main className="p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
