import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AccountEmpty } from '@/components/account-empty';

export default function DashboardChargingPage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <AccountEmpty eyebrow="Charging session" title="No active session" message="Start a charge by scanning the code on a charger. When accounts open, your live session will show here." />
      </main>
      <Footer />
    </div>
  );
}
