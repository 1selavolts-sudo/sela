import { requireAdminAccess } from '@/lib/admin-session';
import { formatDateTime } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  await requireAdminAccess('/admin/notifications');

  const notifications = await prisma.notification.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Notifications</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">Notifications</h2>
        <p className="mt-2 text-sm text-slate-600">Sending notifications to customers is not built yet. Notifications recorded in the database are listed here.</p>
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-soft">No notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-bold text-brand-navy">{item.title}</p>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.channel}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{item.user?.email ?? 'All users'} • {formatDateTime(item.createdAt)}</p>
              <p className="mt-4 text-slate-600">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
