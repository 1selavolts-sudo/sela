import { requireAdminAccess } from '@/lib/admin-session';
import { chargerStatusLabels, connectorLabels, formatDateTime, formatKwh } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminLiveOperationsPage() {
  await requireAdminAccess('/admin/live-operations');

  const chargers = await prisma.charger.findMany({
    orderBy: [{ station: { name: 'asc' } }, { chargerId: 'asc' }],
    include: {
      station: { select: { name: true } },
      sessions: { where: { status: 'CHARGING' }, take: 1, orderBy: { startTime: 'desc' }, select: { sessionId: true, energyDeliveredKwh: true, startTime: true } }
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Operations</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Live operations</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">Charger status is what staff set on the Chargers page. Live readings from the chargers will appear here once the charger connection (OCPP) is set up.</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        {chargers.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No chargers yet. Add chargers on the Chargers page.</p>
        ) : (
          <table className="admin-table min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Charger</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Connector</th>
                <th className="px-4 py-3">Power</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Current session</th>
              </tr>
            </thead>
            <tbody>
              {chargers.map((charger) => {
                const session = charger.sessions[0];
                return (
                  <tr key={charger.id} className="border-t border-slate-200 align-top">
                    <td className="px-4 py-3 font-semibold text-brand-navy" data-label="Charger">{charger.chargerId}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Station">{charger.station.name}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Connector">{connectorLabels[charger.connectorType]}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Power">{charger.powerKw} kW</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Status">{chargerStatusLabels[charger.operationalStatus]}</td>
                    <td className="px-4 py-3 text-slate-600" data-label="Current session">
                      {session ? `${session.sessionId} • ${formatKwh(session.energyDeliveredKwh ?? 0)} • started ${formatDateTime(session.startTime)}` : 'No active session'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
