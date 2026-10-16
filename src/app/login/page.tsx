import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export default function LoginPage() {
  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <div className="mx-auto max-w-md rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Access portal</p>
          <h1 className="mt-3 text-3xl font-black text-brand-navy">Sign-in is coming soon</h1>
          <p className="mt-4 text-sm text-slate-600">You don&apos;t need to sign in to charge. Find a charger, scan its code, and pay with MTN MoMo.</p>
          <div className="mt-8">
            <Button href="/stations" variant="primary" className="w-full justify-center">Find a charger</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
