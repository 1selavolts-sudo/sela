import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { formatRwf } from '@/lib/format';
import { globalRateRwf } from '@/lib/network';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const rate = await globalRateRwf();

  const plans = [
    {
      name: 'Pay as you go',
      price: rate !== null ? `${formatRwf(rate)} / kWh` : 'Set per station',
      text: 'Pay for the energy you use, at the rate shown on each station. Rates can differ by location and connector type.',
      href: '/stations',
      cta: 'Find a station'
    },
    {
      name: 'Fleet',
      price: 'Custom pricing',
      text: 'For business fleets and scheduled charging programs.',
      href: '/contact',
      cta: 'Contact us'
    }
  ];

  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Pricing</p>
          <h1 className="mt-4 text-4xl font-black text-brand-navy">Simple rates for a growing network</h1>
          <p className="mt-4 text-slate-600">Transparent pricing, set by location and connector type. Each station shows its current rate before you start charging.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className="card-surface p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-cyan">{plan.name}</p>
              <p className="mt-4 text-3xl font-black text-brand-navy">{plan.price}</p>
              <p className="mt-4 text-sm text-slate-600">{plan.text}</p>
              <div className="mt-6">
                <Button href={plan.href} variant="primary">{plan.cta}</Button>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
