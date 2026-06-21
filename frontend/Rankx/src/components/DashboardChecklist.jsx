export default function DashboardChecklist({ items = [], overrides = {} }) {
  const resolvedItems = items.map((item) => ({
    ...item,
    completed: Object.prototype.hasOwnProperty.call(overrides, item.key)
      ? overrides[item.key]
      : item.completed,
  }));

  return (
    <section className="surface-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-teal-300/80">
            Activation Checklist
          </p>
          <h2 className="mt-3 text-xl font-semibold text-white">Your first wins</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-slate-300">
          {resolvedItems.filter((item) => item.completed).length}/{resolvedItems.length}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {resolvedItems.map((item) => (
          <div
            key={item.key}
            className={`rounded-2xl border px-4 py-4 transition ${
              item.completed
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-slate-800 bg-slate-950/60"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  item.completed
                    ? "bg-emerald-400/20 text-emerald-200"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {item.completed ? "✓" : "•"}
              </div>
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
