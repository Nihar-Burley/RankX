export default function Billing() {
  const invoices = [
    { id: "INV-1042", date: "Apr 24, 2026", amount: "$29.00", status: "Paid" },
    { id: "INV-1018", date: "Mar 24, 2026", amount: "$29.00", status: "Paid" },
  ];

  return (
    <div className="app-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">Billing</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Subscription and invoices
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          A visible billing area makes the product feel complete even while deeper
          payment integrations are still evolving.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="surface-card">
          <h2 className="section-title">Current plan</h2>
          <div className="mt-6 rounded-[28px] border border-teal-300/15 bg-teal-400/8 p-6">
            <p className="text-sm text-teal-200">Professional Workspace</p>
            <p className="mt-3 text-4xl font-semibold text-white">$29</p>
            <p className="mt-2 text-sm text-slate-300">per user / month</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="btn-primary">Manage subscription</button>
              <button className="btn-secondary">Update payment method</button>
            </div>
          </div>
        </section>

        <section className="surface-card">
          <h2 className="section-title">Recent invoices</h2>
          <div className="mt-6 table-shell">
            <table className="min-w-full">
              <thead className="table-head">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-white/5 text-sm text-slate-200">
                    <td className="px-5 py-4 font-medium text-white">{invoice.id}</td>
                    <td className="px-5 py-4">{invoice.date}</td>
                    <td className="px-5 py-4">{invoice.amount}</td>
                    <td className="px-5 py-4">
                      <span className="badge-success">{invoice.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
