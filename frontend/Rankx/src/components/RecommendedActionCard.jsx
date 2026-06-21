import { useNavigate } from "react-router-dom";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import Card from "./ui/Card";

const ctaLabel = {
  ONBOARDING: "Finish setup",
  STUDY_PLAN_NEXT_ITEM: "Continue plan",
  STUDY_PLAN_ENROLL: "Browse plans",
  INACTIVITY: "Restart session",
  REPEATED_TOPIC_FAILURE: "Review weakness",
  DIFFICULTY_PROGRESSION: "Take the next step",
  DEFAULT_FALLBACK: "Start now",
};

const priorityTone = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "info",
};

export default function RecommendedActionCard({ action }) {
  const navigate = useNavigate();

  if (!action) {
    return (
      <Card>
        <p className="text-sm uppercase tracking-[0.24em] text-amber-300/80">
          Recommended First Action
        </p>
        <p className="mt-4 text-sm text-slate-400">
          We are preparing your next best action. Complete onboarding to personalize this space.
        </p>
      </Card>
    );
  }

  return (
    <section className="rounded-[28px] border border-cyan-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-7 shadow-[0_28px_80px_rgba(8,47,73,0.32)]">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
          Recommended Next Move
        </p>
        <Badge tone={priorityTone[action.priority] || "neutral"} className="px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
          {action.priority}
        </Badge>
        <Badge tone="neutral" className="px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
          {action.recommendationType?.replaceAll("_", " ") || "General"}
        </Badge>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2 className="text-3xl font-semibold text-white">{action.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{action.description}</p>
        </div>

        <Card variant="soft" className="border-white/8 bg-white/[0.03]">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Why this now</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {action.reason || "Based on your latest activity"}
          </p>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="button" size="lg" onClick={() => navigate(action.route || "/home")}>
          {ctaLabel[action.recommendationType] || "Continue"}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={() => navigate("/analytics")}>
          View insights
        </Button>
      </div>
    </section>
  );
}
