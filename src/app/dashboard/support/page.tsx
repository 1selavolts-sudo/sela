import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AccountEmpty } from '@/components/account-empty';
import { formatLocalNumber, supportWhatsApp } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function DashboardSupportPage() {
  const whatsapp = await supportWhatsApp();

  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <AccountEmpty eyebrow="Customer support" title="Get help" message={`Message our support team on WhatsApp, ${formatLocalNumber(whatsapp)}, or use the Contact page. Support tickets open here once accounts are live.`} />
      </main>
      <Footer />
    </div>
  );
}
