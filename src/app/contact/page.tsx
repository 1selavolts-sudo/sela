import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { submitContactAction } from './actions';

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const params = await searchParams;

  return (
    <div>
      <Navbar />
      <main className="section-shell py-16">
        <div className="mx-auto max-w-2xl rounded-[30px] border border-slate-200 bg-white p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">Contact</p>
          <h1 className="mt-3 text-3xl font-black text-brand-navy">Partner with SELA ENERGY</h1>
          <p className="mt-3 text-slate-600">Tell us about your location, fleet needs, or commercial opportunity in Rwanda.</p>

          {params.sent === '1' && <p role="status" className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Your inquiry was sent. We’ll get back to you soon.</p>}
          {params.error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{params.error === 'delivery' ? 'We could not send your inquiry. Please try again later or email denysmahoro@gmail.com.' : params.error === 'too-many-requests' ? 'Too many messages have been sent. Please try again in an hour.' : 'Please complete the form with a valid email and message.'}</p>}

          <form action={submitContactAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input id="contact-name" name="name" autoComplete="name" required maxLength={120} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="you@company.rw" />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-slate-700">Message</label>
              <textarea id="contact-message" name="message" required maxLength={5000} className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" placeholder="Tell us what you need" />
            </div>
            <button type="submit" className="w-full rounded-full bg-brand-green px-5 py-3 text-sm font-semibold text-brand-navy shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400">Send inquiry</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
