import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AccountEmpty } from '@/components/account-empty';

export default function DashboardHistoryPage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <AccountEmpty eyebrow="Charging history" title="No history yet" message="Your past charges will show here once accounts open. Each MoMo payment already has its own receipt page, so keep the link you received." />
      </main>
      <Footer />
    </div>
  );
}
