import { BatteryCharging, ShieldCheck, Zap } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

const chargingFeatures = [
  { title: 'No app or account', text: 'Scan the code on the charger and pay with your MTN MoMo number. Nothing to install or sign up for.', icon: Zap },
  { title: 'Know the price first', text: 'The price per kWh and the energy each amount buys are shown before you pay.', icon: BatteryCharging },
  { title: 'A receipt you can keep', text: 'Every payment has its own receipt page with a reference number.', icon: ShieldCheck }
];

export default function ChargingPage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Charging</p>
          <h1 className="mt-4 text-4xl font-black text-brand-navy">Charging in three simple steps</h1>
          <p className="mt-4 text-lg text-slate-600">SELA ENERGY brings dependable charging to highways, city centers, fleet depots, and commercial destinations.</p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {chargingFeatures.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-surface p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-navy">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-brand-navy">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[30px] border border-slate-200 bg-white p-8 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">How it works</p>
              <h2 className="mt-3 text-3xl font-black text-brand-navy">Charging flow</h2>
            </div>
            <Button href="/stations" variant="primary">Find a station</Button>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {['Scan the code', 'Choose an amount', 'Approve on your phone', 'Plug in and charge'].map((step, index) => (
              <div key={step} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-cyan">0{index + 1}</p>
                <p className="mt-3 text-lg font-bold text-brand-navy">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
