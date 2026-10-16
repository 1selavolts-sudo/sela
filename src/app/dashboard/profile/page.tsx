import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AccountEmpty } from '@/components/account-empty';

export default function DashboardProfilePage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <AccountEmpty eyebrow="Profile" title="No profile yet" message="Profiles open with accounts. You can still charge now: scan the code on a charger and pay with MoMo." />
      </main>
      <Footer />
    </div>
  );
}
