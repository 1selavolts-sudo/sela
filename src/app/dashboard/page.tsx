import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { formatLocalNumber, supportWhatsApp, whatsappLink } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const whatsapp = await supportWhatsApp();

  return (
    <div>
      <Navbar />
      <main className="section-shell py-12 md:py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-cyan">Your account</p>
            <h1 className="mt-3 text-4xl font-black text-brand-navy">Accounts are coming soon</h1>
          </div>

          <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft md:p-8">
            <h2 className="text-xl font-bold text-brand-navy">You don&apos;t need an account to charge</h2>
            <ol className="mt-5 space-y-3 text-slate-700">
              <li>1. Find a charger, or scan the code on the charger.</li>
              <li>2. Choose an amount and approve the MTN MoMo prompt on your phone.</li>
              <li>3. Plug in your car and follow the charger&apos;s screen.</li>
            </ol>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/stations" variant="primary">Find a charger</Button>
              <Button href="/charging" variant="secondary">How charging works</Button>
            </div>
          </section>

          <p className="text-sm text-slate-600">
            Need help? Message us on WhatsApp{' '}
            <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-navy underline">{formatLocalNumber(whatsapp)}</a>.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
