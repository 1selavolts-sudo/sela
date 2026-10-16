import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AccountEmpty } from '@/components/account-empty';

export default function DashboardNotificationsPage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <AccountEmpty eyebrow="Your alerts" title="No alerts yet" message="Alerts will appear here once accounts open. Your payment page shows the latest status of each MoMo payment." />
      </main>
      <Footer />
    </div>
  );
}
