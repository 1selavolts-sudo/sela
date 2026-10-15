import { requireAdminAccess } from '@/lib/admin-session';
import SettingsForm from './settings-form';

export default async function AdminSettingsPage() {
  await requireAdminAccess('/admin/settings');

  return <SettingsForm />;
}
