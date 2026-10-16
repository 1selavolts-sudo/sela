import Link from 'next/link';
import { ChargerFields } from '@/components/admin/charger-fields';
import { requireAdminAccess } from '@/lib/admin-session';
import { chargerStatusLabels, connectorLabels } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { createCharger } from './actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the charger details. Power and connector count must be whole numbers, and the code may only use letters, numbers and dashes.',
  'no-station': 'Choose a station that exists.',
  'duplicate-code': 'Another charger already uses that code. Charger codes must be unique.',
  'not-found': 'That charger no longer exists.'
};

const saved: Record<string, string> = {
  created: 'Charger added.',
  deleted: 'Charger deleted.'
};

export default async function AdminChargersPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/chargers');
  const params = await searchParams;
  const [chargers, stations] = await Promise.all([
    prisma.charger.findMany({ orderBy: [{ station: { name: 'asc' } }, { chargerId: 'asc' }], include: { station: { select: { name: true } } } }),
    prisma.station.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Hardware</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Chargers</h2>
      </div>

      {params.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[params.error] ?? 'Something went wrong. Please try again.'}</p>}
      {params.saved && saved[params.saved] && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{saved[params.saved]}</p>}

      {stations.length === 0 ? (
        <p className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-soft">Add a station first. Chargers belong to a station.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
            {chargers.length === 0 ? (
              <p className="p-6 text-sm text-slate-600">No chargers yet. Add your first charger below.</p>
            ) : (
              <table className="admin-table min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Charger</th>
                    <th className="px-4 py-3">Station</th>
                    <th className="px-4 py-3">Connector</th>
                    <th className="px-4 py-3">Power</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {chargers.map((charger) => (
                    <tr key={charger.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-semibold text-brand-navy" data-label="Charger">{charger.chargerId}</td>
                      <td className="px-4 py-3 text-slate-600" data-label="Station">{charger.station.name}</td>
                      <td className="px-4 py-3 text-slate-600" data-label="Connector">{connectorLabels[charger.connectorType]}</td>
                      <td className="px-4 py-3 text-slate-600" data-label="Power">{charger.powerKw} kW</td>
                      <td className="px-4 py-3 text-slate-600" data-label="Status">{chargerStatusLabels[charger.operationalStatus]}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2 md:justify-end">
                          <Link href={`/admin/chargers/${charger.id}`} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-navy">Edit</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <h3 className="text-xl font-bold text-brand-navy">Add a charger</h3>
            <p className="mt-1 text-sm text-slate-600">The charger code is printed on the QR sticker, so use the same code here.</p>
            <form action={createCharger} className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ChargerFields stations={stations} />
              <div className="md:col-span-2 xl:col-span-3">
                <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Add charger</button>
              </div>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
