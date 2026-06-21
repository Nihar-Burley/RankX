import { useNavigate } from "react-router-dom";

const priorityTone = {
  HIGH: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  MEDIUM: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  LOW: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
};

const ctaLabel = {
  ONBOARDING: "Finish setup",
  STUDY_PLAN_NEXT_ITEM: "Continue plan",
  STUDY_PLAN_ENROLL: "Browse plans",
  INACTIVITY: "Restart session",
  REPEATED_TOPIC_FAILURE: "Review weakness",
  DIFFICULTY_PROGRESSION: "Take the next step",
  DEFAULT_FALLBACK: "Start now",
};

export default function RecommendedActionCard({ action }) {
  const navigate = useNavigate();

  if (!action) {
    return (
      <section className="surface-card">
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300/80">
          Recommended First Action
        </p>
        <p className="mt-4 text-sm text-slate-400">
          We are preparing your next best action. Complete onboarding to personalize this space.
        </p>
      </section>
    );
  }

  const chipClass =
    priorityTone[action.priority] || "border-slate-400/20 bg-slate-400/10 text-slate-200";

  return (
    <section className="rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-7 shadow-[0_28px_80px_rgba(8,47,73,0.32)]">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
          Recommended Next Move
        </p>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${chipClass}`}>
          {action.priority}
        </span>
        <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          {action.recommendationType?.replaceAll("_", " ") || "General"}
        </span>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2 className="text-3xl font-semibold text-white">{action.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{action.description}</p>
        </div>
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Why this now</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {action.reason || "Based on your latest activity"}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(action.route || "/home")}
          className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          {ctaLabel[action.recommendationType] || "Continue"}
        </button>
        <button
          type="button"
          onClick={() => navigate("/analytics")}
          className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
        >
          View insights
        </button>
      </div>
    </section>
  );
}
