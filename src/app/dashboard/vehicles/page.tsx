import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AccountEmpty } from '@/components/account-empty';

export default function DashboardVehiclesPage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <AccountEmpty eyebrow="My EVs" title="No vehicles saved" message="Saving vehicles opens with accounts. When you register, you will be able to add your plate number." />
      </main>
      <Footer />
    </div>
  );
}
