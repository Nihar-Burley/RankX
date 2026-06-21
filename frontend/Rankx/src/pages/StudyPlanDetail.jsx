import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";
import StatCard from "../components/StatCard";
import { logoutUser } from "../services/authService";
import { enrollInStudyPlan, getStudyPlanDetail } from "../services/userApi";
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
        <LoadingState title="Loading study plan" description="Preparing the plan overview, enrollment state, and next steps." />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="app-container">
        <ErrorState
          title="Study plan is unavailable"
          message={error || "Study plan not found."}
          action={
            <button type="button" onClick={() => navigate("/study-plans")} className="btn-secondary">
              Back to study plans
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Study Plan"
        title={plan.title}
        description={plan.description}
        actions={
          <>
            <button type="button" onClick={() => navigate("/study-plans")} className="btn-secondary">
              Back to plans
            </button>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={plan.enrolled || enrolling}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {plan.enrolled ? "Already enrolled" : enrolling ? "Enrolling..." : "Enroll in plan"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Track" value={plan.track} detail="Primary learning mode for this path" tone="cyan" />
          <StatCard label="Level" value={plan.level} detail="Difficulty band for this study plan" tone="amber" />
          <StatCard label="Steps" value={plan.items?.length || 0} detail="Milestones included in the path" tone="violet" />
          <StatCard
            label="Enrollment"
            value={plan.enrolled ? "Active" : "Not enrolled"}
            detail={
              plan.enrolled
                ? "This plan is already guiding your progress"
                : "Enroll to track progress and unlock clearer next steps"
            }
            tone="emerald"
          />
        </div>
      </PageHeader>

      {error ? (
        <ErrorState title="There was a problem with this study plan" message={error} />
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <PageSection
          title="Path breakdown"
          description="Each step is tied to real coding or quiz activity, so progress reflects what you actually complete."
        >
          <div className="space-y-4">
            {plan.items?.length ? (
              plan.items.map((item) => (
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
                  {getItemRoute(item) ? (
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => navigate(getItemRoute(item))}
                        className="btn-secondary"
                      >
                        {item.itemType === "QUIZ" ? "Open quiz" : "Open problem"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <EmptyState
                title="This study plan has no steps yet"
                description="Check back later or browse another plan while content is being prepared."
              />
            )}
          </div>
        </PageSection>

        <PageSection
          title="Next step"
          description="The clearest action depends on whether this plan is already active for your account."
        >
          <div className="space-y-4">
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended action</p>
              <p className="mt-2 text-base font-semibold text-white">
                {plan.enrolled ? "Continue this plan from your progress page" : "Enroll to turn this into your guided path"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {plan.enrolled
                  ? "Your progress page will show completion, the next milestone, and which steps are still locked."
                  : "Enrollment gives RankX enough structure to show progress, recommendations, and a clearer reason to return tomorrow."}
              </p>
            </div>

            <button
              type="button"
              onClick={plan.enrolled ? () => navigate(`/my-progress?plan=${plan.id}`) : handleEnroll}
              disabled={enrolling}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {plan.enrolled ? "Open plan progress" : enrolling ? "Enrolling..." : "Enroll and start"}
            </button>

            <button type="button" onClick={() => navigate("/study-plans")} className="btn-secondary w-full">
              Compare other plans
            </button>
          </div>
        </PageSection>
      </section>
    </div>
  );
}
