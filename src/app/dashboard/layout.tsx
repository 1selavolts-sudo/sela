// Customer accounts are not built yet, so every page under /dashboard shows sample content.
// The notice makes that clear to anyone who opens these pages.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="section-shell pt-6">
        <p role="note" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Customer accounts are not live yet. The pages in this area show sample content, not real customer data.
        </p>
      </div>
      {children}
    </>
  );
}
