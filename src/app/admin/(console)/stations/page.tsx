import { requireAdminAccess } from '@/lib/admin-session';
import StationsManager from './stations-manager';

export default async function AdminStationsPage() {
  await requireAdminAccess('/admin/stations');

  return <StationsManager />;
}
