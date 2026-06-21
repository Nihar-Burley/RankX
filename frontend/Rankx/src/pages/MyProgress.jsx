import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import ProgressSummaryWidget from "../components/ProgressSummaryWidget";
import StatCard from "../components/StatCard";
import StudyPlanProgressCard from "../components/StudyPlanProgressCard";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { logoutUser } from "../services/authService";
import { getMyProgressSummary, getMyStudyPlans, getStudyPlanProgress } from "../services/userApi";
import { trackProductEvent } from "../utils/eventTracker";
import { subscribeToProgressUpdates } from "../utils/progressSync";

const progressStateStyles = {
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10",
  NEXT: "border-cyan-400/30 bg-cyan-400/10",
  LOCKED: "border-slate-800 bg-slate-950/60",
};

export default function MyProgress() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanId = searchParams.get("plan");
  const [summary, setSummary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanProgress, setSelectedPlanProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProgress = useCallback(async () => {
    try {
      const [summaryData, planData] = await Promise.all([
        getMyProgressSummary(),
        getMyStudyPlans(),
      ]);

      setSummary(summaryData);
      setPlans(Array.isArray(planData) ? planData : []);
      trackProductEvent(
        {
          eventName: "PROGRESS_DASHBOARD_VIEWED",
          eventCategory: "PROGRESS",
          source: "WEB",
          track: "BOTH",
          contentType: "STUDY_PLAN",
          contentId: planData?.[0]?.studyPlanId ? `study-plan-${planData[0].studyPlanId}` : undefined,
          contentTitle: planData?.[0]?.title || "My Progress",
          numericValue: summaryData?.streakCount || 0,
        },
        { dedupeKey: "progress-dashboard" }
      );

      const planIdToLoad = selectedPlanId || planData?.[0]?.studyPlanId;
      if (planIdToLoad) {
        const progress = await getStudyPlanProgress(planIdToLoad);
        setSelectedPlanProgress(progress);
      } else {
        setSelectedPlanProgress(null);
      }
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        logoutUser();
        navigate("/login", { replace: true });
        return;
      }
      setError("We could not load your progress right now.");
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedPlanId]);

  useEffect(() => {
    loadProgress();
    return subscribeToProgressUpdates(() => {
      loadProgress();
    });
  }, [loadProgress]);

  if (loading) {
    return (
      <div className="app-container">
        <LoadingState title="Loading progress" description="Pulling your current plan, streak, and next recommended steps." />
      </div>
    );
  }

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Progress Tracking"
        title="My study progress"
        description="Keep your current plan visible, understand what is locked or complete, and move forward with less guesswork."
        actions={
          <>
            <Button type="button" variant="secondary" onClick={() => navigate("/study-plans")}>
              Browse plans
            </Button>
            <Button type="button" onClick={() => navigate("/analytics")}>
              View analytics
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Active plans" value={plans.length} detail="Learning paths enrolled right now" tone="cyan" />
          <StatCard label="Current streak" value={summary?.streakCount ?? 0} detail="Days of momentum you've maintained" tone="amber" />
          <StatCard
            label="Next milestone"
            value={selectedPlanProgress?.nextItemTitle || "Choose a step"}
            detail={selectedPlanProgress ? `${Number(selectedPlanProgress.completionPercentage || 0).toFixed(0)}% through current plan` : "Select a plan to inspect progress"}
            tone="emerald"
          />
        </div>
      </PageHeader>

      {error ? (
        <ErrorState
          title="Progress is temporarily unavailable"
          message={error}
          action={
            <Button variant="secondary" onClick={loadProgress}>
              Try again
            </Button>
          }
        />
      ) : null}

      <ProgressSummaryWidget summary={summary} />

      {plans.length === 0 ? (
        <EmptyState
          title="You have not enrolled in a study plan yet"
          description="A study plan gives RankX enough structure to show clearer next steps, progress milestones, and daily return motivation."
          action={
            <Button type="button" onClick={() => navigate("/study-plans")}>
              Explore study plans
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            {plans.map((plan) => (
              <StudyPlanProgressCard key={plan.studyPlanId} plan={plan} />
            ))}
          </div>

          <Card>
            {selectedPlanProgress ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current plan detail</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{selectedPlanProgress.title}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Completion</p>
                    <p className="mt-2 text-2xl font-semibold text-cyan-300">
                      {Number(selectedPlanProgress.completionPercentage || 0).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  Completed {selectedPlanProgress.completedItems} of {selectedPlanProgress.totalItems} items
                </p>
                <div className="mt-4 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-cyan-400"
                    style={{ width: `${Math.min(Number(selectedPlanProgress.completionPercentage || 0), 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Next item: {selectedPlanProgress.nextItemTitle || "Plan completed"}
                </p>

                <div className="mt-6 space-y-3">
                  {selectedPlanProgress.items.map((item) => (
                    <div
                      key={item.itemId}
                      className={`rounded-2xl border px-4 py-4 ${
                        progressStateStyles[item.progressState] || progressStateStyles.LOCKED
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Step {item.sequenceNumber}</p>
                          <p className="mt-1 font-medium text-white">{item.title}</p>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200">
                          {item.progressState === "COMPLETED"
                            ? "Completed"
                            : item.progressState === "NEXT"
                              ? "Next"
                              : "Locked"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {item.itemType === "QUIZ"
                          ? "Progress updates from real quiz completion"
                          : "Progress updates from accepted coding submissions"}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                title="Select a plan to inspect its progress"
                description="Choose a plan on the left to review its milestones, completion state, and next recommended step."
              />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
