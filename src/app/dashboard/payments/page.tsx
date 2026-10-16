import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AccountEmpty } from '@/components/account-empty';

export default function DashboardPaymentsPage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <AccountEmpty eyebrow="Payments" title="No payments to show" message="Your payments will be listed here once accounts open. Each MoMo payment has its own receipt page, so keep the link you received." />
      </main>
      <Footer />
    </div>
  );
}
