export default function ProgressSummaryWidget({ summary }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.8fr]">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Current focus</p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {summary?.currentPlan?.title || "No active plan"}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {summary?.currentPlan?.title
            ? "Your active study plan is the clearest path to consistent progress."
            : "Enroll in a study plan to unlock a more guided daily workflow."}
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Next best step</p>
        <p className="mt-3 text-2xl font-semibold text-white">
          {summary?.currentPlan?.nextItemTitle || "Choose a plan"}
        </p>
        <p className="mt-3 text-sm text-slate-400">
          {summary?.currentPlan?.completionPercentage != null
            ? `${Number(summary.currentPlan.completionPercentage).toFixed(0)}% complete`
            : "No completion data yet"}
        </p>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Momentum</p>
        <p className="mt-3 text-3xl font-semibold text-white">
          {summary?.streakCount ?? 0}
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Current streak count
        </p>
      </div>
    </section>
  );
}
