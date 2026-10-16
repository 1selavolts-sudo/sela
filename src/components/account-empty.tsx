import { Button } from './ui/button';

// Shown where a customer's own information would go. Accounts are not live yet, so nothing is invented.
export function AccountEmpty({ eyebrow, title, message }: { eyebrow: string; title: string; message: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-cyan">{eyebrow}</p>
      <h1 className="mt-3 text-3xl font-black text-brand-navy md:text-4xl">{title}</h1>
      <p className="mt-4 text-slate-600">{message}</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button href="/stations" variant="primary">Find a charger</Button>
        <Button href="/contact" variant="secondary">Contact us</Button>
      </div>
    </div>
  );
}
