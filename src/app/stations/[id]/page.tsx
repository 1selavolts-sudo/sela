import Link from 'next/link';
import { ArrowLeft, BatteryCharging, MapPinned, PlugZap } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { StatusBadge } from '@/components/status-badge';
import { chargerStatusLabels, formatRwf, googleMapsUrl } from '@/lib/format';
import { publicStationById } from '@/lib/network';

export const dynamic = 'force-dynamic';

export default async function StationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const station = await publicStationById(id);

  if (!station) {
    notFound();
  }

  return (
    <div>
      <Navbar />
      <main className="section-shell py-14">
        <Link href="/stations" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <ArrowLeft className="h-4 w-4" />
          Back to stations
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-cyan">Charging station</p>
                <h1 className="mt-3 text-3xl font-black text-brand-navy">{station.name}</h1>
              </div>
              <StatusBadge status={station.status} />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                <p className="mt-2 font-semibold text-brand-navy">{station.address}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Max power</p>
                <p className="mt-2 font-semibold text-brand-navy">{station.maxPowerKw} kW</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
                <p className="mt-2 font-semibold text-brand-navy">{station.fromPriceRwf !== null ? `from ${formatRwf(station.fromPriceRwf)}/kWh` : 'Rate not set'}</p>
              </div>
            </div>

            <h2 className="mt-10 text-xl font-bold text-brand-navy">Chargers</h2>
            {station.chargers.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No chargers are listed at this station yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {station.chargers.map((charger) => (
                  <div key={charger.chargerId} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <BatteryCharging className="h-5 w-5 text-brand-green" />
                      <div>
                        <p className="font-bold text-brand-navy">{charger.chargerId}</p>
                        <p className="text-sm text-slate-600">{charger.connectorType} • {charger.powerKw} kW</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-brand-navy">{chargerStatusLabels[charger.status]}</span>
                      <span className="text-slate-600">{charger.priceRwf !== null ? `${formatRwf(charger.priceRwf)}/kWh` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-cyan">Station details</p>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="flex items-center gap-2 text-sm text-slate-600"><PlugZap className="h-4 w-4 text-brand-cyan" /> Connectors</span>
                <span className="font-bold text-brand-navy">{station.connectors.join(' / ') || '—'}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                <span className="text-sm text-slate-600">Opening hours</span>
                <span className="font-bold text-brand-navy">{station.openingHours}</span>
              </div>
              {station.contact && (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">Contact</span>
                  <span className="font-bold text-brand-navy">{station.contact}</span>
                </div>
              )}
              <a href={googleMapsUrl(station.latitude, station.longitude)} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-brand-navy">
                <span className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-brand-green" /> Open in Google Maps</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
