import Link from 'next/link';
import { ArrowRight, Navigation } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StatusBadge } from '@/components/status-badge';
import { formatRwf } from '@/lib/format';
import { publicStations } from '@/lib/network';

export const dynamic = 'force-dynamic';

export default async function DashboardFindChargerPage() {
  const stations = await publicStations();

  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Find charger</p>
            <h1 className="mt-3 text-4xl font-black text-brand-navy">Stations</h1>
          </div>
        </div>

        {stations.length === 0 ? (
          <p className="rounded-[28px] border border-slate-200 bg-white p-6 text-slate-600 shadow-soft">Our first stations are being added. Check back soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stations.map((station) => (
              <div key={station.stationId} className="card-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-bold text-brand-navy">{station.name}</p>
                  <Navigation className="h-4 w-4 text-brand-cyan" />
                </div>
                <p className="mt-4 text-sm text-slate-600">{station.maxPowerKw} kW • {station.connectors.join(' / ') || '—'}</p>
                <p className="mt-2 text-sm text-slate-600">{station.fromPriceRwf !== null ? `from ${formatRwf(station.fromPriceRwf)}/kWh` : 'Rate not set'}</p>
                <div className="mt-4">
                  <StatusBadge status={station.status} />
                </div>
                <div className="mt-5 flex justify-end">
                  <Link href={`/stations/${station.stationId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan">
                    View details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
