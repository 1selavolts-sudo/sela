'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

type NavItem = { href: string; label: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  // Remember which page the menu was opened on, so navigating to another page closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenOn(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  // Tapping the link for the page you are already on doesn't change the path, so close explicitly.
  const close = () => setOpenOn(null);

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

      <div id="mobile-menu" hidden={!open} className="absolute right-0 top-12 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-soft">
        <nav className="flex flex-col">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={close} className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-navy">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-2 flex items-center justify-between border-t border-slate-200 px-3 pt-3">
          <Link href="/login" onClick={close} className="text-sm font-medium text-brand-navy">Login</Link>
          <Button href="/register" variant="primary">Register</Button>
        </div>
      </div>
    </div>
  );
}
