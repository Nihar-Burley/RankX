import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Support() {
  const faq = [
    "How do I continue a partially completed practice session?",
    "Where can I review quiz attempts and submission details?",
    "How do billing and subscription updates work in RankX?",
  ];

  return (
    <div className="app-container space-y-6">
      <PageHeader
        eyebrow="Help & Support"
        title="Get help quickly"
        description="Support, guidance, and escalation paths should be easy to find from the main product navigation."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Support topics" value="3" detail="Account, billing, and product guidance paths" tone="cyan" />
          <StatCard label="Help surface" value="Always visible" detail="Easy to find from the shared dashboard shell" tone="violet" />
          <StatCard label="Knowledge base" value="Ready" detail="Can be connected when backend help content exists" tone="emerald" />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <h2 className="section-title">Contact support</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="support-topic" className="field-label">
                Topic
              </label>
              <select id="support-topic" className="input-base">
                <option>Account access</option>
                <option>Billing question</option>
                <option>Product feedback</option>
              </select>
            </div>

            <div>
              <label htmlFor="support-message" className="field-label">
                Message
              </label>
              <textarea
                id="support-message"
                rows={6}
                className="input-base min-h-40 resize-y"
                placeholder="Describe the issue or request..."
              />
            </div>

            <Button>Submit request</Button>
          </div>
        </Card>

        <Card>
          <h2 className="section-title">Common questions</h2>
          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <Card key={item} variant="soft">
                <p className="text-sm font-medium text-white">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This placeholder can be wired to a knowledge base or ticketing flow
                  whenever those backend integrations are ready.
                </p>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
