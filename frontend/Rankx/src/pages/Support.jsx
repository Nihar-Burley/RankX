export default function Support() {
  const faq = [
    "How do I continue a partially completed practice session?",
    "Where can I review quiz attempts and submission details?",
    "How do billing and subscription updates work in RankX?",
  ];

  return (
    <div className="app-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">Help & Support</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Get help quickly
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Support, guidance, and escalation paths should be easy to find from the
          main product navigation.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="surface-card">
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

            <button className="btn-primary">Submit request</button>
          </div>
        </section>

        <section className="surface-card">
          <h2 className="section-title">Common questions</h2>
          <div className="mt-6 space-y-4">
            {faq.map((item) => (
              <div key={item} className="surface-card-soft">
                <p className="text-sm font-medium text-white">{item}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  This placeholder can be wired to a knowledge base or ticketing flow
                  whenever those backend integrations are ready.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
