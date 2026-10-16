// Customer accounts are not built yet. The dashboard pages show what will appear once they are, without any sample data.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="section-shell pt-6">
        <p role="note" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Customer accounts are not live yet. You can charge now without one: scan the code on a charger and pay with MoMo.
        </p>
      </div>
      {children}
    </>
  );
}
