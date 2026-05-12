import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { enrollInStudyPlan, getStudyPlanDetail } from "../services/userApi";
import { logoutUser } from "../services/authService";
import { subscribeToProgressUpdates } from "../utils/progressSync";
import { trackProductEvent } from "../utils/eventTracker";

const stateStyles = {
  COMPLETED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  NEXT: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  LOCKED: "border-slate-700 bg-slate-900/80 text-slate-400",
};

const stateLabels = {
  COMPLETED: "Completed",
  NEXT: "Next",
  LOCKED: "Locked",
};

const getItemRoute = (item) => {
  if (!item?.referenceKey) {
    return null;
  }
  if (item.itemType === "CODING_PROBLEM" && item.referenceKey.startsWith("problem-")) {
    return `/problems/${item.referenceKey.replace("problem-", "")}`;
  }
  if (item.itemType === "QUIZ" && item.referenceKey.startsWith("quiz-")) {
    return `/quiz/${item.referenceKey.replace("quiz-", "")}`;
  }
  return null;
};

export default function StudyPlanDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");

  const loadPlan = useCallback(async () => {
    try {
      const data = await getStudyPlanDetail(id);
      setPlan(data);
      trackProductEvent(
        {
          eventName: "PROGRESS_STUDY_PLAN_VIEWED",
          eventCategory: "PROGRESS",
          source: "WEB",
          track: data?.track || "BOTH",
          contentType: "STUDY_PLAN",
          contentId: `study-plan-${id}`,
          contentTitle: data?.title,
          topic: data?.level,
        },
        { dedupeKey: `study-plan-${id}` }
      );
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        logoutUser();
        navigate("/login", { replace: true });
        return;
      }
      setError(err.response?.data?.message || "We could not load this study plan.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadPlan();
    return subscribeToProgressUpdates(() => {
      loadPlan();
    });
  }, [loadPlan]);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setError("");
      await enrollInStudyPlan(id);
      await loadPlan();
    } catch (err) {
      setError(err.response?.data?.message || "We could not enroll you in this study plan.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
          Loading study plan...
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="app-container">
        <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 text-amber-200">
          {error || "Study plan not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container space-y-8">
      <header className="rounded-[32px] border border-slate-800 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.12),_transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] p-8">
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
        <h1 className="mt-4 text-4xl font-bold text-white">{plan.title}</h1>
        <p className="mt-3 max-w-3xl text-slate-400">{plan.description}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Track</p>
            <p className="mt-3 text-xl font-semibold text-white">{plan.track}</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Level</p>
            <p className="mt-3 text-xl font-semibold text-white">{plan.level}</p>
          </div>
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Steps</p>
            <p className="mt-3 text-xl font-semibold text-white">{plan.items?.length || 0}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={handleEnroll}
            disabled={plan.enrolled || enrolling}
            className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {plan.enrolled ? "Already enrolled" : enrolling ? "Enrolling..." : "Enroll in plan"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-progress")}
            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm text-slate-200 hover:bg-slate-800"
          >
            View my progress
          </button>
        </div>
        {error ? (
          <div className="mt-5 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        ) : null}
      </header>

      <section className="space-y-4">
        {plan.items?.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Step {item.sequenceNumber}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">{item.title}</h2>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                  stateStyles[item.progressState] || stateStyles.LOCKED
                }`}
              >
                {stateLabels[item.progressState] || item.itemType.replace("_", " ")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
              <span>{item.itemType === "QUIZ" ? "Quiz activity" : "Coding activity"} unlocks this step</span>
              <span>{item.estimatedMinutes} min</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {getItemRoute(item) ? (
                <button
                  type="button"
                  onClick={() => navigate(getItemRoute(item))}
                  className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
                >
                  {item.itemType === "QUIZ" ? "Open quiz" : "Open problem"}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
