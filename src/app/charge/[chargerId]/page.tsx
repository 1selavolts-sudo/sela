import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { chargerStatusLabels, formatRwf } from '@/lib/format';
import { chargerByCode } from '@/lib/network';

export const dynamic = 'force-dynamic';

export default async function ChargePage({ params }: { params: Promise<{ chargerId: string }> }) {
  const { chargerId } = await params;
  const charger = await chargerByCode(chargerId);

  if (!charger || charger.station.status !== 'ACTIVE') {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <Link href={`/stations/${charger.station.stationId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <ArrowLeft className="h-4 w-4" />
          Back to {charger.station.name}
        </Link>

        <div className="mx-auto mt-8 max-w-3xl rounded-[30px] border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Charger</p>
          <h1 className="mt-3 text-3xl font-black text-brand-navy md:text-5xl">{charger.chargerId}</h1>
          <p className="mt-2 text-sm text-slate-600">Station: {charger.station.name} • {charger.station.address}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connector</p>
              <p className="mt-2 text-lg font-bold text-brand-navy md:text-3xl">{charger.connectorType}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Power</p>
              <p className="mt-2 text-lg font-bold text-brand-navy md:text-3xl">{charger.powerKw} kW</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
              <p className="mt-2 text-lg font-bold text-brand-navy md:text-3xl">{charger.priceRwf !== null ? `${formatRwf(charger.priceRwf)} / kWh` : 'Rate not set'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Availability</p>
              <p className="mt-2 text-lg font-bold text-brand-green md:text-3xl">{chargerStatusLabels[charger.status]}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Charging starts in the SELA ENERGY app. Customer sign-in is not live yet.
          </div>

          <div className="mt-8">
            <Button href="/stations" variant="secondary" className="w-full justify-center">See other stations</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
