import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Button from "../components/ui/Button";
import { logoutUser } from "../services/authService";
import { getMyResults } from "../services/resultApi";
import { getMyRecentSubmissions } from "../services/submissionApi";
import {
  getMyAnalytics,
  getMyDashboardSummary,
  getMyProfile,
  normalizeRecommendation,
} from "../services/userApi";
import { trackProductEvent } from "../utils/eventTracker";
import { subscribeToProgressUpdates } from "../utils/progressSync";

const quickLinks = [
  { title: "Continue practice", description: "Pick up your next coding session.", route: "/problems" },
  { title: "Take a quiz", description: "Reinforce concepts with a quick attempt.", route: "/quiz" },
  { title: "Review study plans", description: "See roadmap milestones and next steps.", route: "/study-plans" },
];

function StatIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-4 w-4",
    "aria-hidden": "true",
  };

  switch (name) {
    case "progress":
      return (
        <svg {...common}>
          <path d="m4.5 15.5 4-4 3 2.5 6-7" />
          <path d="M14.5 7H18v3.5" />
        </svg>
      );
    case "quiz":
      return (
        <svg {...common}>
          <rect x="4.5" y="5" width="15" height="14" rx="2.5" />
          <path d="M8 10h3M8 13h6M8 16h3" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m9 8-4 4 4 4" />
          <path d="m15 8 4 4-4 4" />
          <path d="m13 6-2 12" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="m12 3 1.5 4.2L17.7 9 13.5 10.5 12 14.7l-1.5-4.2L6.3 9l4.2-1.8L12 3Z" />
        </svg>
      );
    case "activity":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 8v4l2.5 1.8" />
        </svg>
      );
    default:
      return null;
  }
}

function DashboardMetricCard({ icon, label, value, detail, accent = "text-[#6f63ff]" }) {
  return (
    <article className="rounded-[22px] border border-white/8 bg-[#171b25] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#1f2330] ${accent}`}>
        <StatIcon name={icon} />
      </span>
      <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-[2.05rem] font-semibold tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </article>
  );
}

function StatusRow({ icon, title, score, detail, statusLabel }) {
  return (
    <div className="border-b border-white/8 px-5 py-4 last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#1f2330] text-[#8c82ff]">
            <StatIcon name={icon} />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-slate-300">
            {statusLabel}
          </span>
          <span className="text-sm font-semibold text-white">{score}</span>
        </div>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-[#0f1219]">
        <div className="h-1.5 rounded-full bg-[#6f63ff]" style={{ width: `${Math.max(8, Math.min(score, 100))}%` }} />
      </div>
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 rounded-full bg-white/5" />
      <div className="h-20 rounded-[24px] bg-white/5" />
      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 rounded-[22px] bg-white/5" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="h-[292px] rounded-[24px] bg-white/5" />
        <div className="h-[292px] rounded-[24px] bg-white/5" />
      </div>
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString();
}

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
        { oncePerSessionKey: "dashboard-viewed" },
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

  const primaryRecommendation =
    normalizeRecommendation(analytics?.primaryRecommendation) ||
    normalizeRecommendation(summary?.recommendedFirstAction);

  const recommendationCards = (analytics?.recommendations || summary?.recommendations || [])
    .map(normalizeRecommendation)
    .filter(Boolean);

  const completionValue =
    summary?.currentStudyPlan?.completionPercentage != null
      ? `${Number(summary.currentStudyPlan.completionPercentage).toFixed(0)}%`
      : "0%";

  const codingScore = Math.round(
    ((analytics?.codingPerformance?.acceptedSubmissions || 0) /
      Math.max(analytics?.codingPerformance?.totalSubmissions || 1, 1)) *
      100,
  );
  const quizScore = Math.round(analytics?.quizPerformance?.averagePercentage || 0);
  const planScore = Math.round(summary?.currentStudyPlan?.completionPercentage || 0);
  const momentumScore = Math.min((summary?.streakCount || 0) * 11, 100);

  const activityFeed = useMemo(
    () =>
      [
        ...results.slice(0, 4).map((result) => ({
          id: `quiz-${result.attemptId}`,
          label: `Quiz Completed - ${result.quizTitle || `Quiz #${result.quizId}`}`,
          meta: `Score ${result.percentage}%`,
          time: result.completedAt || result.submittedAt,
          route: `/quiz/review/${result.attemptId}`,
        })),
        ...submissions.slice(0, 4).map((submission) => ({
          id: `submission-${submission.id}`,
          label: `${submission.status} - Problem #${submission.problemId}`,
          meta: `Submission ${submission.id}`,
          time: submission.createdAt,
          route: `/submissions/${submission.id}`,
        })),
      ]
        .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
        .slice(0, 6),
    [results, submissions],
  );

  const statusRows = [
    {
      icon: "progress",
      title: "Coding Track Health",
      score: codingScore,
      detail:
        analytics?.codingPerformance?.totalSubmissions > 0
          ? "Consistent coding submissions"
          : "No coding submissions tracked yet",
      statusLabel: codingScore >= 75 ? "Strong" : codingScore >= 45 ? "Moderate" : "Needs focus",
    },
    {
      icon: "quiz",
      title: "Quiz Track Health",
      score: quizScore,
      detail:
        analytics?.quizPerformance?.totalAttempts > 0
          ? `${analytics.quizPerformance.totalAttempts} quiz attempts tracked`
          : "No quiz attempts tracked yet",
      statusLabel: quizScore >= 75 ? "Strong" : quizScore >= 45 ? "Moderate" : "Needs focus",
    },
    {
      icon: "code",
      title: "Study Plan Pace",
      score: planScore,
      detail:
        summary?.currentStudyPlan?.title
          ? `On track for ${summary.currentStudyPlan.title}`
          : "Choose a study plan to activate pace tracking",
      statusLabel: planScore >= 70 ? "On track" : planScore > 0 ? "In motion" : "Not started",
    },
    {
      icon: "spark",
      title: "Learner Momentum",
      score: momentumScore,
      detail:
        summary?.streakCount > 0
          ? `Momentum active for ${summary.streakCount} day${summary.streakCount === 1 ? "" : "s"}`
          : "Return tomorrow to build streak momentum",
      statusLabel: momentumScore >= 60 ? "Stable" : "Needs attention",
    },
  ];

  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="space-y-8">
      {error ? (
        <ErrorState
          title="Dashboard data is temporarily unavailable"
          message={error}
          action={
            <Button variant="secondary" onClick={loadDashboard}>
              Try again
            </Button>
          }
        />
      ) : null}

      <section className="space-y-6">
        <div className="max-w-[760px]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#7d88a0]">Daily workspace</p>
          <h1 className="mt-4 text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-[3.45rem]">
            Everything moving in your learning workspace
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Welcome back{profile?.displayName ? `, ${profile.displayName}` : ""}. Keep the right signals in view, continue your next plan step, and review the latest practice without leaving the page.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          <DashboardMetricCard
            icon="progress"
            label="Practice progress"
            value={completionValue}
            detail={summary?.currentStudyPlan?.title || "No active study plan"}
          />
          <DashboardMetricCard
            icon="quiz"
            label="Quiz score"
            value={`${quizScore || 0}%`}
            detail={
              analytics?.quizPerformance?.totalAttempts
                ? `${analytics.quizPerformance.totalAttempts} tracked attempts`
                : "Start a quiz to build your score trend"
            }
            accent="text-[#8cc8ff]"
          />
          <DashboardMetricCard
            icon="code"
            label="Recent submissions"
            value={submissions.length}
            detail="Coding submissions currently in view"
            accent="text-[#a58bff]"
          />
          <DashboardMetricCard
            icon="spark"
            label="Recommendation signals"
            value={(recommendationCards.length || 0) + (primaryRecommendation ? 1 : 0)}
            detail={primaryRecommendation?.title || "New insights unlock after activity"}
            accent="text-[#6f63ff]"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <article className="overflow-hidden rounded-[24px] border border-white/8 bg-[#171b25] shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="text-[#8c82ff]">
                <StatIcon name="spark" />
              </span>
              Status Matrix
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-semibold text-slate-300">
              Live
            </span>
          </div>
          <div>
            {statusRows.map((row) => (
              <StatusRow key={row.title} {...row} />
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[24px] border border-white/8 bg-[#171b25] shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="text-slate-400">
                <StatIcon name="activity" />
              </span>
              Activity Log
            </div>
            <button
              type="button"
              onClick={() => navigate("/submissions")}
              className="text-xs font-medium text-[#8c82ff] transition hover:text-[#a79fff]"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-white/8">
            {activityFeed.length > 0 ? (
              activityFeed.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition hover:bg-white/[0.02]"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.meta}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{formatTimestamp(item.time)}</span>
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-sm text-slate-400">
                No tracked activity yet. Start one coding problem or one quiz to populate this log.
              </div>
            )}
          </div>
        </article>
      </section>

      {primaryRecommendation ? (
        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[24px] border border-white/8 bg-[#171b25] p-6 shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7d88a0]">Recommended next move</p>
            <h2 className="mt-4 text-[1.8rem] font-semibold tracking-[-0.04em] text-white">
              {primaryRecommendation.title}
            </h2>
            <p className="mt-3 max-w-[560px] text-sm leading-7 text-slate-400">{primaryRecommendation.description}</p>
            <p className="mt-5 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {primaryRecommendation.reason}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" onClick={() => navigate(primaryRecommendation.route)}>
                Continue plan
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate("/analytics")}>
                Review insights
              </Button>
            </div>
          </article>

          <article className="rounded-[24px] border border-white/8 bg-[#171b25] p-6 shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7d88a0]">Quick links</p>
            <div className="mt-4 grid gap-3">
              {quickLinks.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => navigate(item.route)}
                  className="rounded-[18px] border border-white/8 bg-[#111520] px-4 py-4 text-left transition hover:border-white/12 hover:bg-[#151926]"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </button>
              ))}
            </div>
          </article>
        </section>
      ) : (
        <EmptyState
          title="Your dashboard is ready for a first win"
          description="Choose a study plan, coding problem, or quiz attempt. As soon as you start, RankX will turn this page into a clearer daily workspace with progress and smarter next actions."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate("/study-plans")}>Choose a study plan</Button>
              <Button variant="secondary" onClick={() => navigate("/problems")}>
                Start practice
              </Button>
              <Button variant="secondary" onClick={() => navigate("/quiz")}>
                Take a quiz
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
