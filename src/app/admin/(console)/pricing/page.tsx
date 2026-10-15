import { requireAdminAccess } from '@/lib/admin-session';
import PricingManager from './pricing-manager';

export default async function AdminPricingPage() {
  await requireAdminAccess('/admin/pricing');

  return <PricingManager />;
}
