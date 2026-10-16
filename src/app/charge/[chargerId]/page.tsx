import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { chargerStatusLabels, formatRwf } from '@/lib/format';
import { momoAmountsRwf, momoConfigured } from '@/lib/momo';
import { chargerByCode } from '@/lib/network';
import { formatLocalNumber, supportWhatsApp, whatsappLink } from '@/lib/site-settings';
import { startMomoPayment } from './actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  phone: 'Enter a Rwandan mobile number, like 078 123 4567.',
  'mtn-only': 'Only MTN MoMo numbers (078 or 079) can pay this way.',
  amount: 'Choose one of the amounts shown.',
  'too-many': 'Too many attempts. Wait 15 minutes and try again.',
  busy: 'This charger has just become busy. Please choose another charger nearby.',
  unavailable: 'This charger is not available right now.',
  'no-rate': 'The price for this charger is not set yet. Please ask our team.',
  'not-connected': 'MoMo payments are not switched on yet. Please message us on WhatsApp.'
};

export default async function ChargePage({ params, searchParams }: { params: Promise<{ chargerId: string }>; searchParams: Promise<{ error?: string }> }) {
  const { chargerId } = await params;
  const { error } = await searchParams;
  const [charger, whatsapp] = await Promise.all([chargerByCode(chargerId), supportWhatsApp()]);
  if (!charger || charger.station.status !== 'ACTIVE') {
    notFound();
  }

  const price = charger.priceRwf;
  const help = (
    <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-navy underline">
      WhatsApp {formatLocalNumber(whatsapp)}
    </a>
  );

  return (
    <div>
      <Navbar />
      <main className="section-shell py-10 md:py-16">
        <Link href={`/stations/${charger.station.stationId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <ArrowLeft className="h-4 w-4" />
          Back to {charger.station.name}
        </Link>

        <div className="mx-auto mt-6 max-w-2xl space-y-6">
          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Charge here</p>
            <h1 className="mt-3 text-3xl font-black text-brand-navy md:text-4xl">{charger.chargerId}</h1>
            <p className="mt-2 text-sm text-slate-600">{charger.station.name} • {charger.station.address}</p>

            <dl className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Connector</dt>
                <dd className="mt-2 text-lg font-bold text-brand-navy">{charger.connectorType}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Power</dt>
                <dd className="mt-2 text-lg font-bold text-brand-navy">{charger.powerKw} kW</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</dt>
                <dd className="mt-2 text-lg font-bold text-brand-navy">{price !== null ? `${formatRwf(price)} per kWh` : 'Not set'}</dd>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</dt>
                <dd className="mt-2 text-lg font-bold text-brand-green">{chargerStatusLabels[charger.status]}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            <h2 className="text-xl font-bold text-brand-navy">Three steps, no account needed</h2>
            <ol className="mt-5 space-y-4">
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">1</span>
                <div>
                  <p className="font-semibold text-brand-navy">Plug in your car</p>
                  <p className="text-sm text-slate-600">Connect the {charger.connectorType} cable to your car.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">2</span>
                <div>
                  <p className="font-semibold text-brand-navy">Pay with MoMo</p>
                  <p className="text-sm text-slate-600">Choose an amount and approve the prompt on your phone with your MoMo PIN.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">3</span>
                <div>
                  <p className="font-semibold text-brand-navy">Start charging</p>
                  <p className="text-sm text-slate-600">Follow the charger&apos;s screen. Keep the payment page for your receipt.</p>
                </div>
              </li>
            </ol>
          </section>

          {error && messages[error] && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error]}</p>}

          {!momoConfigured() ? (
            <section className="rounded-[30px] border border-amber-200 bg-amber-50 p-6 text-amber-900 md:p-8">
              <h2 className="text-xl font-bold">MoMo payments are being switched on</h2>
              <p className="mt-2 text-sm">Message us on {help} and we will help you charge now.</p>
            </section>
          ) : charger.status !== 'AVAILABLE' ? (
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <h2 className="text-xl font-bold text-brand-navy">This charger is {chargerStatusLabels[charger.status].toLowerCase()} right now</h2>
              <p className="mt-2 text-sm text-slate-600">Try another charger nearby.</p>
              <div className="mt-6">
                <Button href="/stations" variant="primary" className="w-full justify-center">Find another charger</Button>
              </div>
            </section>
          ) : price === null ? (
            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <h2 className="text-xl font-bold text-brand-navy">The price is not set yet</h2>
              <p className="mt-2 text-sm text-slate-600">Message us on {help} and we will help you charge.</p>
            </section>
          ) : (
            <form action={startMomoPayment} className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
              <input type="hidden" name="chargerId" value={charger.chargerId} />
              <fieldset>
                <legend className="text-lg font-bold text-brand-navy">How much do you want to charge?</legend>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {momoAmountsRwf.map((amount) => (
                    <label key={amount} className="cursor-pointer">
                      <input type="radio" name="amount" value={amount} defaultChecked={amount === 2000} className="peer sr-only" />
                      <span className="block rounded-2xl border-2 border-slate-200 bg-white p-4 text-center transition peer-checked:border-brand-green peer-checked:bg-emerald-50 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-cyan">
                        <span className="block text-base font-black text-brand-navy">{formatRwf(amount)}</span>
                        <span className="mt-1 block text-xs text-slate-600">about {(amount / price).toFixed(1)} kWh</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="momo-phone" className="block text-lg font-bold text-brand-navy">Your MTN MoMo number</label>
                <input id="momo-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={16} placeholder="078 123 4567" className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg outline-none focus:border-brand-cyan" />
                <p className="mt-2 text-sm text-slate-600">MTN numbers start with 078 or 079. We send a payment request to this number, and you approve it with your MoMo PIN.</p>
              </div>

              <button type="submit" className="w-full rounded-2xl bg-brand-green px-5 py-4 text-base font-semibold text-brand-navy shadow-lg shadow-emerald-500/20">Pay with MoMo</button>
            </form>
          )}

          <p className="text-center text-sm text-slate-600">Need help? Message us on {help}.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
