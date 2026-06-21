import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalyticsOverviewCard from "../components/AnalyticsOverviewCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import PageHeader from "../components/PageHeader";
import RecommendedActionCard from "../components/RecommendedActionCard";
import RecommendationCardsSection from "../components/RecommendationCardsSection";
import StatCard from "../components/StatCard";
import { logoutUser } from "../services/authService";
import { getMyAnalytics, normalizeRecommendation } from "../services/userApi";
import { trackProductEvent } from "../utils/eventTracker";

const formatTimestamp = (value) => {
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No activity yet";
  }

  return date.toLocaleString();
};

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadAnalytics = async () => {
      try {
        const data = await getMyAnalytics();
        setAnalytics(data);
        trackProductEvent(
          {
            eventName: "ANALYTICS_PAGE_VIEWED",
            eventCategory: "ANALYTICS",
            source: "WEB",
            track: "BOTH",
            contentType: "ANALYTICS",
            contentId: "user-analytics",
            contentTitle: "User Analytics",
            numericValue: data?.activitySummary?.totalCompletedPlanItems || 0,
          },
          { oncePerSessionKey: "analytics-page-viewed" }
        );
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login", { replace: true });
          return;
        }
        setError("We could not load your analytics right now.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="app-container">
        <LoadingState title="Loading analytics" description="Gathering your coding, quiz, and study-plan signals." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <ErrorState title="Analytics are temporarily unavailable" message={error} />
      </div>
    );
  }

  const coding = analytics?.codingPerformance;
  const quiz = analytics?.quizPerformance;
  const activity = analytics?.activitySummary;
  const primaryRecommendation = normalizeRecommendation(analytics?.primaryRecommendation);
  const recommendations = (analytics?.recommendations || []).map(normalizeRecommendation).filter(Boolean);

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Insights"
        title="Performance and learning signals"
        description="Understand what is working, where you are losing momentum, and which topic or study action is most worth your time next."
        actions={
          <>
            <button type="button" onClick={() => navigate("/my-progress")} className="btn-secondary">
              Open progress
            </button>
            <button type="button" onClick={() => navigate("/home")} className="btn-primary">
              Back to dashboard
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Best next move"
            value={primaryRecommendation?.title || "Keep momentum"}
            detail={primaryRecommendation?.summary || "We will highlight the clearest next action as your activity grows."}
            tone="cyan"
          />
          <StatCard
            label="Return reason"
            value={activity?.streakCount ? `${activity.streakCount}-day streak` : "Build your streak"}
            detail="Come back daily to keep your progress moving forward."
            tone="amber"
          />
          <StatCard
            label="Guided progress"
            value={activity?.totalCompletedPlanItems ?? 0}
            detail="Study-plan steps completed from real activity"
            tone="emerald"
          />
        </div>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsOverviewCard title="Coding acceptance" value={`${Number(coding?.acceptanceRate || 0).toFixed(0)}%`} subtitle={`${coding?.acceptedSubmissions || 0} accepted`} tone="emerald" />
        <AnalyticsOverviewCard title="Average quiz score" value={`${Number(quiz?.averagePercentage || 0).toFixed(0)}%`} subtitle={`${quiz?.totalAttempts || 0} quiz attempts`} tone="cyan" />
        <AnalyticsOverviewCard title="Activity streak" value={activity?.streakCount ?? 0} subtitle="Current streak count" tone="amber" />
        <AnalyticsOverviewCard title="Enrolled plans" value={activity?.enrolledStudyPlans ?? 0} subtitle="Guided paths in progress" tone="violet" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsOverviewCard title="Latest coding activity" value={formatTimestamp(activity?.latestCodingActivityAt)} subtitle="Real submission history timestamp" tone="cyan" />
        <AnalyticsOverviewCard title="Latest quiz activity" value={formatTimestamp(activity?.latestQuizActivityAt)} subtitle="Real evaluated result timestamp" tone="violet" />
        <AnalyticsOverviewCard title="Latest overall activity" value={formatTimestamp(activity?.latestOverallActivityAt)} subtitle="Most recent learning action" tone="amber" />
        <AnalyticsOverviewCard title="Completed plan items" value={activity?.totalCompletedPlanItems ?? 0} subtitle="Real study plan completions" tone="emerald" />
      </section>

      <RecommendedActionCard action={primaryRecommendation} />
      {recommendations.length > 0 ? (
        <RecommendationCardsSection recommendations={recommendations} />
      ) : (
        <EmptyState
          title="More tailored recommendations will appear here"
          description="As you complete more quizzes, submissions, and study-plan steps, RankX will surface sharper next actions and weak-topic coaching."
        />
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Coding strengths and gaps</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            These signals come from your real submission history, not manually marked frontend state.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-emerald-400">Strong topics</p>
              <div className="mt-3 space-y-3">
                {(coding?.strongTopics || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No strong coding topics yet.</p>
                ) : (
                  coding.strongTopics.map((topic) => (
                    <div key={topic.topic} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                      <p className="font-medium text-emerald-200">{topic.topic}</p>
                      <p className="mt-1 text-sm text-slate-300">{Number(topic.successRate).toFixed(0)}% success across {topic.attempts} attempts</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-rose-400">Weak topics</p>
              <div className="mt-3 space-y-3">
                {(coding?.weakTopics || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No weak coding topics detected.</p>
                ) : (
                  coding.weakTopics.map((topic) => (
                    <div key={topic.topic} className="rounded-2xl border border-rose-400/20 bg-rose-400/5 px-4 py-3">
                      <p className="font-medium text-rose-200">{topic.topic}</p>
                      <p className="mt-1 text-sm text-slate-300">{Number(topic.successRate).toFixed(0)}% success across {topic.attempts} attempts</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Quiz strengths and gaps</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Quiz insights are calculated from completed and evaluated quiz attempts.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-emerald-400">Strong topics</p>
              <div className="mt-3 space-y-3">
                {(quiz?.strongTopics || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No strong quiz topics yet.</p>
                ) : (
                  quiz.strongTopics.map((topic) => (
                    <div key={topic.topic} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3">
                      <p className="font-medium text-emerald-200">{topic.topic}</p>
                      <p className="mt-1 text-sm text-slate-300">{Number(topic.successRate).toFixed(0)}% success across {topic.attempts} attempts</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-rose-400">Weak topics</p>
              <div className="mt-3 space-y-3">
                {(quiz?.weakTopics || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No weak quiz topics detected.</p>
                ) : (
                  quiz.weakTopics.map((topic) => (
                    <div key={topic.topic} className="rounded-2xl border border-rose-400/20 bg-rose-400/5 px-4 py-3">
                      <p className="font-medium text-rose-200">{topic.topic}</p>
                      <p className="mt-1 text-sm text-slate-300">{Number(topic.successRate).toFixed(0)}% success across {topic.attempts} attempts</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
