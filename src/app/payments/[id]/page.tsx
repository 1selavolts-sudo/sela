import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { PaymentStatusRefresher } from '@/components/payment-status-refresher';
import { formatDateTime, formatRwf } from '@/lib/format';
import { maskPhone, momoReasonMessage } from '@/lib/momo';
import { currentMomoPayment } from '@/lib/momo-payments';

export const dynamic = 'force-dynamic';

// The receipt and the approval status for one MoMo payment. It shows no account details.
export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await currentMomoPayment(id);
  if (!payment) {
    notFound();
  }

  const waiting = payment.status === 'CREATED' || payment.status === 'REQUESTED';
  const amount = formatRwf(payment.amountRwf);
  const phone = maskPhone(payment.phone);
  const reference = payment.id.slice(-8).toUpperCase();

  return (
    <div>
      <Navbar />
      <main className="section-shell py-10 md:py-16">
        <Link href={`/charge/${payment.charger.chargerId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <ArrowLeft className="h-4 w-4" />
          Back to the charger
        </Link>

        <div className="mx-auto mt-6 max-w-2xl space-y-6">
          {payment.status === 'PAID' && (
            <section className="rounded-[30px] border border-emerald-200 bg-emerald-50 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Payment received</p>
              <h1 className="mt-3 text-3xl font-black text-brand-navy">{amount} is paid</h1>
              <p className="mt-3 text-slate-700">Plug in your car and follow the charger&apos;s screen to start charging. Keep this page as your receipt.</p>
            </section>
          )}

          {waiting && (
            <section className="rounded-[30px] border border-amber-200 bg-amber-50 p-6 md:p-8">
              <PaymentStatusRefresher />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-800">Waiting for your approval</p>
              <h1 className="mt-3 text-3xl font-black text-brand-navy">Approve the payment on your phone</h1>
              <p className="mt-3 text-slate-700">We sent a MoMo request to {phone} for {amount}. Enter your MoMo PIN to approve. This page updates by itself.</p>
              <p className="mt-3 text-sm text-slate-600">No prompt after a minute? Go back and try again, or message us on WhatsApp.</p>
            </section>
          )}

          {payment.status === 'FAILED' && (
            <section className="rounded-[30px] border border-red-200 bg-red-50 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-700">Not paid</p>
              <h1 className="mt-3 text-3xl font-black text-brand-navy">The payment did not go through</h1>
              <p className="mt-3 text-slate-700">{momoReasonMessage(payment.providerReason)}</p>
              <div className="mt-6">
                <Button href={`/charge/${payment.charger.chargerId}`} variant="primary" className="w-full justify-center">Try again</Button>
              </div>
            </section>
          )}

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            <h2 className="text-lg font-bold text-brand-navy">Receipt</h2>
            <dl className="mt-4 divide-y divide-slate-200 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">Reference</dt>
                <dd className="font-semibold text-brand-navy">#{reference}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">Charger</dt>
                <dd className="font-semibold text-brand-navy">{payment.charger.chargerId}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">Station</dt>
                <dd className="text-right font-semibold text-brand-navy">{payment.charger.station.name}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">Amount</dt>
                <dd className="font-semibold text-brand-navy">{amount}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">Energy (estimate)</dt>
                <dd className="font-semibold text-brand-navy">about {payment.energyEstimateKwh.toFixed(1)} kWh</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">MoMo number</dt>
                <dd className="font-semibold text-brand-navy">{phone}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">Time</dt>
                <dd className="text-right font-semibold text-brand-navy">{formatDateTime(payment.createdAt)}</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
