import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Read only on purpose: the log is a record of changes, so nobody edits or deletes its entries.
export default async function AdminAuditLogsPage() {
  await requireAdminAccess('/admin/audit-logs');

  const entries = await prisma.auditLog.findMany({
    take: 200,
    orderBy: { timestamp: 'desc' },
    include: { user: { select: { email: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Audit</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Audit log</h2>
        <p className="mt-2 text-sm text-slate-600">Every change made in the Control Center, newest first. The 200 most recent entries are shown.</p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-soft">
        {entries.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No changes recorded yet.</p>
        ) : (
          <table className="admin-table min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Who</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">IP address</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-slate-200">
                  <td className="px-4 py-3 text-slate-600" data-label="When">{formatDateTime(entry.timestamp)}</td>
                  <td className="px-4 py-3 text-slate-600 break-all" data-label="Who">{entry.user?.email ?? 'Unknown'}</td>
                  <td className="px-4 py-3 font-semibold text-brand-navy" data-label="Action">{entry.action}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="Item">{entry.entity}{entry.entityId ? ` (${entry.entityId.slice(0, 8)})` : ''}</td>
                  <td className="px-4 py-3 text-slate-600" data-label="IP address">{entry.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
