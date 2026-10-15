import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { getAdminSession } from '@/lib/admin-session';

// The session here only feeds the header and menu. Each page still calls
// requireAdminAccess, because layouts don't re-render on client navigation.
export default async function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return <AdminShell session={session}>{children}</AdminShell>;
}
