import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin-session';
import { formatDateTime, notificationChannelLabels, notificationChannels } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { deleteNotification, updateNotification } from '../actions';

export const dynamic = 'force-dynamic';

const messages: Record<string, string> = {
  invalid: 'Check the notification. A title and message are required.'
};

const inputClass = 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-cyan';

export default async function AdminNotificationEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  await requireSuperAdmin('/admin/notifications');
  const { id } = await params;
  const { error, saved } = await searchParams;

  const item = await prisma.notification.findUnique({ where: { id }, include: { user: { select: { email: true } } } });
  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/notifications" className="text-sm font-semibold text-brand-navy">← All notifications</Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-cyan">Notification</p>
        <h2 className="mt-2 text-3xl font-black text-brand-navy">{item.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{item.user?.email ?? 'All users'} • {formatDateTime(item.createdAt)}</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{messages[error] ?? 'Something went wrong. Please try again.'}</p>}
      {saved && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Changes saved.</p>}

      <form action={updateNotification} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft md:grid-cols-2">
        <input type="hidden" name="id" value={item.id} />
        <label className="grid gap-2 text-sm font-medium text-slate-700">Title
          <input name="title" required maxLength={120} defaultValue={item.title} className={inputClass} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">Channel
          <select name="channel" defaultValue={item.channel} className={inputClass}>
            {notificationChannels.map((channel) => (
              <option key={channel} value={channel}>{notificationChannelLabels[channel]}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700 md:col-span-2">Message
          <textarea name="message" required maxLength={1000} rows={4} defaultValue={item.message} className={`${inputClass} min-h-28`} />
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input name="read" type="checkbox" value="yes" defaultChecked={Boolean(item.readAt)} className="h-4 w-4 rounded border-slate-300" />
          Marked as read
        </label>
        <div className="md:col-span-2">
          <button type="submit" className="rounded-2xl bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy">Save notification</button>
        </div>
      </form>

      <section className="rounded-[28px] border border-red-200 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-bold text-red-700">Delete notification</h3>
        <p className="mt-2 text-sm text-slate-600">This removes the notification from the list. The audit log keeps a record that it was deleted.</p>
        <form action={deleteNotification} className="mt-4">
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className="rounded-2xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700">Delete this notification</button>
        </form>
      </section>
    </div>
  );
}
