import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import { MobileMenu } from './mobile-menu';
import { Button } from './ui/button';

export function Navbar() {
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/stations', label: 'Stations' },
    { href: '/charging', label: 'Charging' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/vehicles', label: 'Vehicles' },
    { href: '/business', label: 'Business' },
    { href: '/about', label: 'About' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="SELA ENERGY LTD home" className="shrink-0">
          <BrandLogo variant="compact" className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-brand-navy">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="text-sm font-medium text-brand-navy">Login</Link>
          <Button href="/register" variant="primary">Register</Button>
        </div>

        <MobileMenu items={navItems} />
      </div>
    </header>
  );
}
