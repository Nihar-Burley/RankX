import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardChecklist from "../components/DashboardChecklist";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import PageSection from "../components/PageSection";
import RecommendedActionCard from "../components/RecommendedActionCard";
import RecommendationCardsSection from "../components/RecommendationCardsSection";
import StatCard from "../components/StatCard";
import { logoutUser } from "../services/authService";
import { getMyResults } from "../services/resultApi";
import { getMyRecentSubmissions } from "../services/submissionApi";
import { getMyAnalytics, getMyDashboardSummary, getMyProfile, normalizeRecommendation } from "../services/userApi";
import { trackProductEvent } from "../utils/eventTracker";
import { subscribeToProgressUpdates } from "../utils/progressSync";

const quickLinks = [
  { title: "Continue practice", description: "Pick up your next coding session.", route: "/problems" },
  { title: "Take a quiz", description: "Reinforce concepts with a quick attempt.", route: "/quiz" },
  { title: "Review progress", description: "See what is complete and what comes next.", route: "/my-progress" },
];

const formatTimestamp = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString();
};

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [results, setResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const [profileData, summaryData, analyticsResult, resultsResponse, submissionData] = await Promise.all([
        getMyProfile(),
        getMyDashboardSummary(),
        getMyAnalytics().catch(() => null),
        getMyResults(),
        getMyRecentSubmissions(),
      ]);

      if (!summaryData?.onboardingCompleted) {
        navigate("/onboarding", { replace: true });
        return;
      }

      setProfile(profileData);
      setSummary(summaryData);
      setAnalytics(analyticsResult);
      setResults(Array.isArray(resultsResponse.data) ? resultsResponse.data : []);
      setSubmissions(Array.isArray(submissionData) ? submissionData : []);
      trackProductEvent(
        {
          eventName: "DASHBOARD_VIEWED",
          eventCategory: "ANALYTICS",
          source: "WEB",
          track: summaryData?.preferredTrack || "BOTH",
          contentType: "DASHBOARD",
          contentId: "user-home-dashboard",
          contentTitle: "RankX Dashboard",
          numericValue: summaryData?.streakCount || 0,
        },
        { oncePerSessionKey: "dashboard-viewed" }
      );
      setError("");
    } catch (err) {
      if (err.response?.status === 401) {
        logoutUser();
        navigate("/login");
        return;
      }

      setError("We could not load your dashboard right now.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard();
    return subscribeToProgressUpdates(() => {
      loadDashboard();
    });
  }, [loadDashboard, navigate]);

  const checklistOverrides = {
    "complete-profile": Boolean(summary?.onboardingCompleted),
    "solve-first-problem": submissions.length > 0,
    "attempt-first-quiz": results.length > 0,
    "review-first-result": results.length > 0,
    "join-study-path": Boolean(summary?.currentStudyPlan?.studyPlanId),
  };

  const primaryRecommendation =
    normalizeRecommendation(analytics?.primaryRecommendation) ||
    normalizeRecommendation(summary?.recommendedFirstAction);

  const recommendationCards = (analytics?.recommendations || summary?.recommendations || [])
    .map(normalizeRecommendation)
    .filter(Boolean)
    .filter(
      (recommendation, index, items) =>
        items.findIndex(
          (candidate) => candidate.title === recommendation.title && candidate.route === recommendation.route
        ) === index
    );

  const activityFeed = useMemo(
    () =>
      [
        ...results.slice(0, 3).map((result) => ({
          id: `quiz-${result.attemptId}`,
          label: result.quizTitle || `Quiz #${result.quizId}`,
          meta: `${result.percentage}% correct`,
          time: result.completedAt || result.submittedAt,
          route: `/quiz/review/${result.attemptId}`,
          type: "Quiz",
        })),
        ...submissions.slice(0, 3).map((submission) => ({
          id: `submission-${submission.id}`,
          label: `Problem #${submission.problemId}`,
          meta: submission.status,
          time: submission.createdAt,
          route: `/submissions/${submission.id}`,
          type: "Practice",
        })),
      ]
        .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
        .slice(0, 5),
    [results, submissions]
  );

  if (loading) {
    return (
      <LoadingState
        title="Loading your dashboard"
        description="Preparing your current plan, next step, and recent activity."
      />
    );
  }

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back${profile?.displayName ? `, ${profile.displayName}` : ""}`}
        description="See your current direction, continue the right next step, and review recent progress without hunting through the app."
        actions={
          <button
            type="button"
            onClick={() =>
              navigate(
                summary?.currentStudyPlan?.studyPlanId
                  ? `/study-plans/${summary.currentStudyPlan.studyPlanId}`
                  : "/study-plans"
              )
            }
            className="btn-primary"
          >
            {summary?.currentStudyPlan?.studyPlanId ? "Continue study plan" : "Choose a study plan"}
          </button>
        }
      >
        <div className="flex flex-wrap gap-2">
          {summary?.goal ? <span className="badge-neutral">Goal: {summary.goal}</span> : null}
          {summary?.preferredTrack ? <span className="badge-neutral">Track: {summary.preferredTrack}</span> : null}
          {summary?.skillLevel ? <span className="badge-neutral">Level: {summary.skillLevel}</span> : null}
        </div>
      </PageHeader>

      {error ? <ErrorState title="Dashboard data is temporarily unavailable" message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Current progress"
          value={
            summary?.currentStudyPlan?.completionPercentage != null
              ? `${Number(summary.currentStudyPlan.completionPercentage).toFixed(0)}%`
              : "0%"
          }
          detail={summary?.currentStudyPlan?.title || "No study plan selected yet"}
          tone="cyan"
        />
        <StatCard
          label="Next action"
          value={summary?.currentStudyPlan?.nextItemTitle || primaryRecommendation?.title || "Choose your next session"}
          detail="The clearest place to continue right now"
          tone="emerald"
        />
        <StatCard
          label="Streak"
          value={summary?.streakCount ?? 0}
          detail="Come back tomorrow to keep momentum alive"
          tone="amber"
        />
      </section>

      <RecommendedActionCard action={primaryRecommendation} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <PageSection
          title="Continue from where you left off"
          description="Your current plan and next recommended step should make the next click obvious."
          action={
            <button type="button" onClick={() => navigate("/study-plans")} className="btn-secondary">
              View all plans
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current plan</p>
              <p className="mt-3 text-xl font-semibold text-white">
                {summary?.currentStudyPlan?.title || "No study plan selected yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {summary?.currentStudyPlan?.nextItemTitle || "Choose a study plan to unlock a guided next step."}
              </p>
            </div>
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent activity</p>
              <p className="mt-3 text-xl font-semibold text-white">
                {analytics?.activitySummary?.latestOverallActivityAt
                  ? formatTimestamp(analytics.activitySummary.latestOverallActivityAt)
                  : "No tracked activity yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your dashboard updates as new quiz attempts and coding submissions are tracked.
              </p>
            </div>
          </div>
        </PageSection>

        <PageSection title="Quick links" description="Open the most useful next destinations without extra navigation.">
          <div className="grid gap-3">
            {quickLinks.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => navigate(item.route)}
                className="surface-card-soft text-left transition hover:border-white/14 hover:bg-white/[0.06]"
              >
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              </button>
            ))}
          </div>
        </PageSection>
      </div>

      <DashboardChecklist items={summary?.checklist || []} overrides={checklistOverrides} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <PageSection
          title="Recent activity"
          description="See the last few things you completed so it is easy to continue or review."
          action={
            <button type="button" onClick={() => navigate("/submissions")} className="btn-ghost">
              View history
            </button>
          }
        >
          {activityFeed.length === 0 ? (
            <EmptyState
              title="No recent activity yet"
              description="Start with one coding problem or one quiz attempt and your recent activity will appear here."
            />
          ) : (
            <div className="space-y-3">
              {activityFeed.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="surface-card-soft flex w-full items-start justify-between gap-4 text-left transition hover:border-white/14 hover:bg-white/[0.06]"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.type}</p>
                    <p className="mt-2 text-sm font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.meta}</p>
                  </div>
                  <p className="text-xs text-slate-500">{formatTimestamp(item.time)}</p>
                </button>
              ))}
            </div>
          )}
        </PageSection>

        <PageSection title="Where to focus" description="Use these signals when you want a quick sense of what needs attention next.">
          <div className="space-y-4">
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Coding weak topics</p>
              {(analytics?.codingPerformance?.weakTopics || []).length ? (
                <div className="mt-3 space-y-3">
                  {analytics.codingPerformance.weakTopics.slice(0, 2).map((topic) => (
                    <div key={topic.topic}>
                      <p className="text-sm font-medium text-white">{topic.topic}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {Number(topic.successRate || 0).toFixed(0)}% success across {topic.attempts} attempts
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No coding weak topics detected yet.</p>
              )}
            </div>
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quiz weak topics</p>
              {(analytics?.quizPerformance?.weakTopics || []).length ? (
                <div className="mt-3 space-y-3">
                  {analytics.quizPerformance.weakTopics.slice(0, 2).map((topic) => (
                    <div key={topic.topic}>
                      <p className="text-sm font-medium text-white">{topic.topic}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {Number(topic.successRate || 0).toFixed(0)}% success across {topic.attempts} attempts
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">No quiz weak topics detected yet.</p>
              )}
            </div>
          </div>
        </PageSection>
      </div>

      {recommendationCards.length > 0 ? (
        <RecommendationCardsSection recommendations={recommendationCards} />
      ) : null}
    </div>
  );
}
