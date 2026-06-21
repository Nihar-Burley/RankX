import { useEffect, useState } from "react";
import { getQuizAnalytics } from "../services/adminAnalyticsApi";
import { trackAdminEvent } from "../utils/eventTracker";

export default function QuizAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getQuizAnalytics();
        setData(response);
        trackAdminEvent(
          {
            eventName: "ADMIN_ANALYTICS_QUIZZES_VIEWED",
            eventCategory: "ANALYTICS",
            source: "WEB",
            track: "ADMIN",
            contentType: "QUIZ_ANALYTICS",
            contentId: "admin-quiz-analytics",
            contentTitle: "Quiz Analytics",
            numericValue: response?.totalTrackedItems || 0,
          },
          { oncePerSessionKey: "admin-quiz-analytics-viewed" }
        );
      } catch (err) {
        setError(err.response?.data?.message || "We could not load quiz analytics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="surface-card text-slate-300">Loading quiz analytics...</div>;
  }

  if (error) {
    return <div className="surface-card text-amber-200">{error}</div>;
  }

  return (
    <div className="admin-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">Quiz analytics</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Completion and participation trends
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          Monitor which quizzes get started often, which ones users finish, and where drop-off appears.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm text-slate-400">Tracked quizzes</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.totalTrackedItems ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Average completion rate</p>
          <p className="mt-3 text-3xl font-semibold text-white">{Number(data?.averageCompletionRate || 0).toFixed(0)}%</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Average solve rate</p>
          <p className="mt-3 text-3xl font-semibold text-white">{Number(data?.averageSolveRate || 0).toFixed(0)}%</p>
        </div>
      </section>

      <section className="surface-card">
        <div className="table-shell overflow-x-auto">
          <table className="min-w-full">
            <thead className="table-head">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <th className="px-5 py-4">Quiz</th>
                <th className="px-5 py-4">Attempts</th>
                <th className="px-5 py-4">Users</th>
                <th className="px-5 py-4">Completion</th>
                <th className="px-5 py-4">Solve rate</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((item) => (
                <tr key={item.contentId} className="border-t border-white/5 text-sm text-slate-200">
                  <td className="px-5 py-4 font-medium text-white">{item.contentTitle}</td>
                  <td className="px-5 py-4">{item.attemptCount}</td>
                  <td className="px-5 py-4">{item.uniqueUserCount}</td>
                  <td className="px-5 py-4">{Number(item.completionRate || 0).toFixed(0)}%</td>
                  <td className="px-5 py-4">{Number(item.solveRate || 0).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
