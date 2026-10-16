import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChargerFields } from '@/components/admin/charger-fields';
import { requireAdminAccess } from '@/lib/admin-session';
import { prisma } from '@/lib/prisma';
import { deleteCharger, updateCharger } from '../actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the charger details. Power and connector count must be whole numbers, and the code may only use letters, numbers and dashes.',
  'no-station': 'Choose a station that exists.',
  'duplicate-code': 'Another charger already uses that code. Charger codes must be unique.',
  'has-sessions': 'This charger has charging sessions or mobile money payments on record, so it cannot be deleted. Set its status to Offline instead.'
};

export default async function AdminChargerEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireAdminAccess('/admin/chargers');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const [charger, stations] = await Promise.all([
    prisma.charger.findUnique({ where: { id }, include: { _count: { select: { sessions: true, momoPayments: true } } } }),
    prisma.station.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
  ]);
  if (!charger) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/chargers" className="text-sm font-semibold text-brand-navy">← All chargers</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Charger</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">{charger.chargerId}</h2>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Changes saved.</p>}

      <form action={updateCharger} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-3">
        <input type="hidden" name="id" value={charger.id} />
        <ChargerFields
          stations={stations}
          values={{
            stationId: charger.stationId,
            chargerId: charger.chargerId,
            manufacturer: charger.manufacturer,
            model: charger.model,
            serialNumber: charger.serialNumber,
            powerKw: charger.powerKw,
            connectorType: charger.connectorType,
            numberOfConnectors: charger.numberOfConnectors,
            operationalStatus: charger.operationalStatus,
            ocppIdentity: charger.ocppIdentity
          }}
        />
        <div className="md:col-span-2 xl:col-span-3">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save charger</button>
        </div>
      </form>

      <section className="rounded-[28px] border border-red-200 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-bold text-red-700">Delete charger</h3>
        {charger._count.sessions + charger._count.momoPayments > 0 ? (
          <p className="mt-2 text-sm text-slate-600">This charger has charging sessions or mobile money payments on record. Set its status to Offline instead.</p>
        ) : (
          <form action={deleteCharger} className="mt-4">
            <input type="hidden" name="id" value={charger.id} />
            <button type="submit" className="rounded-2xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700">Delete this charger permanently</button>
          </form>
        )}
      </section>
    </div>
  );
}
