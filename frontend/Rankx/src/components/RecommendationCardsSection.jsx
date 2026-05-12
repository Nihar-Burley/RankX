import { useNavigate } from "react-router-dom";

const priorityTone = {
  HIGH: "bg-rose-400/10 text-rose-300",
  MEDIUM: "bg-amber-400/10 text-amber-300",
  LOW: "bg-cyan-400/10 text-cyan-300",
};

export default function RecommendationCardsSection({ recommendations = [] }) {
  const navigate = useNavigate();

  if (!recommendations.length) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-amber-400">
          Supporting Moves
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Keep your momentum intentional
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {recommendations.map((recommendation) => (
          <button
            key={`${recommendation.title}-${recommendation.route}-${recommendation.recommendationType || "general"}`}
            type="button"
            onClick={() => navigate(recommendation.route)}
            className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-900/90"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-lg font-semibold text-white">{recommendation.title}</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  priorityTone[recommendation.priority] || "bg-slate-400/10 text-slate-300"
                }`}
              >
                {recommendation.priority}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {recommendation.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {recommendation.recommendationType?.replaceAll("_", " ") || "General"}
              </span>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-slate-500">
              Why: {recommendation.reason}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
