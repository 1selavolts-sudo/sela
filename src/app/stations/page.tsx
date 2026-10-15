import Link from 'next/link';
import { ArrowRight, Navigation } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatRwf } from '@/lib/format';
import { publicStations } from '@/lib/network';

export const dynamic = 'force-dynamic';

const filters = [
  { label: 'All stations', value: 'all' },
  { label: 'Available now', value: 'available' },
  { label: 'CCS2', value: 'CCS2' },
  { label: 'GB/T', value: 'GB_T' }
];

export default async function StationsPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const { filter = 'all' } = await searchParams;
  const allStations = await publicStations();
  const stations = allStations.filter((station) => {
    if (filter === 'available') return station.availableCount > 0;
    if (filter === 'CCS2' || filter === 'GB_T') return station.connectorTypes.includes(filter);
    return true;
  });

  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Discover charging</p>
            <h1 className="mt-3 text-4xl font-black text-brand-navy">Find a charger</h1>
          </div>
          <Button href="/dashboard" variant="secondary">Customer dashboard</Button>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {filters.map((item) => {
            const active = filter === item.value || (filter === '' && item.value === 'all');
            return (
              <Link
                key={item.value}
                href={item.value === 'all' ? '/stations' : `/stations?filter=${item.value}`}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${active ? 'border-brand-navy bg-brand-navy text-white' : 'border-slate-200 bg-white text-brand-navy'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {stations.length === 0 ? (
          <p className="mt-12 rounded-[28px] border border-slate-200 bg-white p-6 text-slate-600 shadow-soft">
            {allStations.length === 0 ? 'Our first stations are being added. Check back soon.' : 'No stations match this filter right now.'}
          </p>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stations.map((station) => (
              <div key={station.stationId} className="card-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-brand-navy">{station.name}</h2>
                  <StatusBadge status={station.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{station.address}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Max power</p>
                    <p className="mt-2 font-bold text-brand-navy">{station.maxPowerKw} kW</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connectors</p>
                    <p className="mt-2 font-bold text-brand-navy">{station.connectors.join(' / ') || '—'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><Navigation className="h-4 w-4" /> {station.availableCount} of {station.chargerCount} available</span>
                  <span>{station.fromPriceRwf !== null ? `from ${formatRwf(station.fromPriceRwf)}/kWh` : 'Rate not set'}</span>
                </div>
                <div className="mt-5 flex justify-end">
                  <Link href={`/stations/${station.stationId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan">
                    View station <ArrowRight className="h-4 w-4" />
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
