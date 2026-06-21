import { useNavigate } from "react-router-dom";
import Badge from "./ui/Badge";

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
              <Badge
                tone={
                  recommendation.priority === "HIGH"
                    ? "danger"
                    : recommendation.priority === "MEDIUM"
                      ? "warning"
                      : "info"
                }
                className="px-3 py-1 text-xs uppercase tracking-[0.16em]"
              >
                {recommendation.priority}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {recommendation.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="neutral" className="px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                {recommendation.recommendationType?.replaceAll("_", " ") || "General"}
              </Badge>
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
