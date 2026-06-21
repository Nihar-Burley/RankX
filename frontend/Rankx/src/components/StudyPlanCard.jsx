import { useNavigate } from "react-router-dom";

export default function StudyPlanCard({ plan }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/study-plans/${plan.id}`)}
      className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left shadow-xl transition hover:border-slate-700 hover:bg-slate-900/90"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
          {plan.track}
        </span>
        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-300">
          {plan.level}
        </span>
        {plan.enrolled ? (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
            Enrolled
          </span>
        ) : null}
      </div>
      <h2 className="mt-5 text-2xl font-semibold text-white">{plan.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
      <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
        <span>{plan.totalItems} items</span>
        <span>Open plan</span>
      </div>
    </button>
  );
}
