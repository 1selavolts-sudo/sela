import Link from 'next/link';
import { requireAdminAccess } from '@/lib/admin-session';
import { stationStatusLabels } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { createStation } from './actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the station details. Name, address, district, sector, opening hours and coordinates are required, and coordinates must be numbers.',
  'not-found': 'That station no longer exists.'
};

const saved: Record<string, string> = {
  created: 'Station added.',
  deleted: 'Station deleted.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminStationsPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/stations');
  const params = await searchParams;
  const stations = await prisma.station.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { chargers: true } } }
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Network</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Stations</h2>
      </div>

      {params.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[params.error] ?? 'Something went wrong. Please try again.'}</p>}
      {params.saved && saved[params.saved] && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saved[params.saved]}</p>}

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        {stations.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No stations yet. Add your first station below.</p>
        ) : (
          <table className="admin-table min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Chargers</th>
                <th className="px-4 py-3">Public page</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {stations.map((station) => (
                <tr key={station.id} className="border-t border-slate-200 align-top">
                  <td className="px-4 py-3" data-label="Station">
                    <p className="font-semibold text-brand-navy">{station.name}</p>
                    <p className="text-xs text-slate-500">{station.address}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600" data-label="District">{station.district}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="Status">{stationStatusLabels[station.status]}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="Chargers">{station._count.chargers}</td>
                  <td className="px-4 py-3 text-slate-600 break-all" data-label="Public page">{station.status === 'ACTIVE' ? <Link href={`/stations/${station.stationId}`} className="font-semibold text-brand-cyan">/stations/{station.stationId}</Link> : 'Hidden'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      <Link href={`/admin/stations/${station.id}`} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-navy">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-xl font-bold text-brand-navy">Add a station</h3>
        <p className="mt-1 text-sm text-slate-600">Coordinates are decimal degrees. Paste them from Google Maps: right-click the spot and copy the numbers.</p>
        <form action={createStation} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input name="name" required maxLength={120} placeholder="Station name" className={inputClass} />
          <input name="address" required maxLength={200} placeholder="Address" className={inputClass} />
          <input name="district" required maxLength={80} placeholder="District" className={inputClass} />
          <input name="sector" required maxLength={80} placeholder="Sector" className={inputClass} />
          <input name="latitude" required inputMode="decimal" placeholder="Latitude, e.g. -1.9441" className={inputClass} />
          <input name="longitude" required inputMode="decimal" placeholder="Longitude, e.g. 30.0619" className={inputClass} />
          <input name="openingHours" required maxLength={80} placeholder="Opening hours, e.g. 24/7" className={inputClass} />
          <input name="contact" maxLength={120} placeholder="Contact phone or email (optional)" className={inputClass} />
          <select name="status" defaultValue="ACTIVE" className={inputClass}>
            <option value="ACTIVE">Open (shown on the site)</option>
            <option value="MAINTENANCE">Maintenance (hidden)</option>
            <option value="INACTIVE">Closed (hidden)</option>
          </select>
          <div className="md:col-span-2 xl:col-span-3">
            <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Add station</button>
          </div>
        </form>
      </section>
    </div>
  );
}
