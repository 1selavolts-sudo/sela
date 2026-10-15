'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

type NavItem = { href: string; label: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so it closes by itself after navigating.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200"
      >
        {open ? <X className="h-5 w-5 text-brand-navy" /> : <Menu className="h-5 w-5 text-brand-navy" />}
      </button>

      {open && (
        <div id="mobile-menu" className="absolute right-0 top-12 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
          <nav className="flex flex-col">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-navy">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 flex items-center justify-between border-t border-slate-200 px-3 pt-3">
            <Link href="/login" className="text-sm font-medium text-brand-navy">Login</Link>
            <Button href="/register" variant="primary">Register</Button>
          </div>
        </div>
      )}
    </div>
  );
}
