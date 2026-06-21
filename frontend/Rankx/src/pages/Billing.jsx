import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import DataTable from "../components/ui/DataTable";
import PageHeader from "../components/PageHeader";

export default function Billing() {
  const invoices = [
    { id: "INV-1042", date: "Apr 24, 2026", amount: "$29.00", status: "Paid" },
    { id: "INV-1018", date: "Mar 24, 2026", amount: "$29.00", status: "Paid" },
  ];

  return (
    <div className="app-container space-y-6">
      <PageHeader
        eyebrow="Billing"
        title="Subscription and invoices"
        description="A visible billing area makes the product feel complete even while deeper payment integrations are still evolving."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h2 className="section-title">Current plan</h2>
          <div className="mt-6 rounded-[28px] border border-sky-300/15 bg-sky-400/8 p-6">
            <p className="text-sm text-sky-200">Professional Workspace</p>
            <p className="mt-3 text-4xl font-semibold text-white">$29</p>
            <p className="mt-2 text-sm text-slate-300">per user / month</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button>Manage subscription</Button>
              <Button variant="secondary">Update payment method</Button>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="section-title">Recent invoices</h2>
          <div className="mt-6">
            <DataTable
              rowKey="id"
              rows={invoices}
              columns={[
                { key: "id", header: "Invoice", render: (invoice) => <span className="font-medium text-white">{invoice.id}</span> },
                { key: "date", header: "Date" },
                { key: "amount", header: "Amount" },
                { key: "status", header: "Status", render: (invoice) => <Badge tone="success">{invoice.status}</Badge> },
              ]}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
