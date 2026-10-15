import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminAccess } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';
import { deleteStation, updateStation } from '../actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the station details. Name, address, district, sector, opening hours and coordinates are required, and coordinates must be numbers.',
  'has-chargers': 'This station still has chargers. Remove them from the Chargers page first, or close the station instead.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminStationEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/stations');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const station = await prisma.station.findUnique({ where: { id }, include: { _count: { select: { chargers: true } } } });
  if (!station) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/stations" className="text-sm font-semibold text-brand-navy">← All stations</Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Station</p>
          <h2 className="mt-2 text-3xl font-black text-brand-navy">{station.name}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Public page: {station.status === 'ACTIVE' ? <Link href={`/stations/${station.stationId}`} className="font-semibold text-brand-cyan">/stations/{station.stationId}</Link> : 'hidden until the station is open'}
          </p>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Changes saved.</p>}

      <form action={updateStation} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="id" value={station.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">Station name
          <input name="name" required maxLength={120} defaultValue={station.name} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Address
          <input name="address" required maxLength={200} defaultValue={station.address} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">District
          <input name="district" required maxLength={80} defaultValue={station.district} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Sector
          <input name="sector" required maxLength={80} defaultValue={station.sector} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Latitude
          <input name="latitude" required inputMode="decimal" defaultValue={String(station.latitude)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Longitude
          <input name="longitude" required inputMode="decimal" defaultValue={String(station.longitude)} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Opening hours
          <input name="openingHours" required maxLength={80} defaultValue={station.openingHours} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Contact (optional)
          <input name="contact" maxLength={120} defaultValue={station.contact ?? ''} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Status
          <select name="status" defaultValue={station.status} className={inputClass}>
            <option value="ACTIVE">Open (shown on the site)</option>
            <option value="MAINTENANCE">Maintenance (hidden)</option>
            <option value="INACTIVE">Closed (hidden)</option>
          </select>
        </label>
        <div className="md:col-span-2 xl:col-span-3">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save station</button>
        </div>
      </form>

      <section className="rounded-[28px] border border-red-200 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-bold text-red-700">Delete station</h3>
        {station._count.chargers > 0 ? (
          <p className="mt-2 text-sm text-slate-600">This station has {station._count.chargers} charger{station._count.chargers === 1 ? '' : 's'}. Remove them first, or set the status to Closed to hide it.</p>
        ) : (
          <form action={deleteStation} className="mt-4">
            <input type="hidden" name="id" value={station.id} />
            <button type="submit" className="rounded-2xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700">Delete this station permanently</button>
          </form>
        )}
      </section>
    </div>
  );
}
