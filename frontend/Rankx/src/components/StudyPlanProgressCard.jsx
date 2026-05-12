import { useNavigate } from "react-router-dom";

export default function StudyPlanProgressCard({ plan }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/my-progress?plan=${plan.studyPlanId}`)}
      className="w-full rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:-translate-y-0.5 hover:border-slate-700"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">{plan.title}</p>
          <p className="mt-2 text-sm text-slate-400">
            {plan.track} • {plan.level}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Completion</p>
          <p className="mt-2 text-2xl font-semibold text-cyan-300">
            {Number(plan.completionPercentage || 0).toFixed(0)}%
          </p>
        </div>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-cyan-400"
          style={{ width: `${Math.min(Number(plan.completionPercentage || 0), 100)}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Next item: {plan.nextItemTitle || "No next item yet"}
        </p>
        <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
          Open plan
        </span>
      </div>
    </button>
  );
}
