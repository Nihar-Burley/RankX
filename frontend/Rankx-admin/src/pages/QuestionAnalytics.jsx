import { useEffect, useState } from "react";
import { getQuestionAnalytics } from "../services/adminAnalyticsApi";
import { trackAdminEvent } from "../utils/eventTracker";

export default function QuestionAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getQuestionAnalytics();
        setData(response);
        trackAdminEvent(
          {
            eventName: "ADMIN_ANALYTICS_QUESTIONS_VIEWED",
            eventCategory: "ANALYTICS",
            source: "WEB",
            track: "ADMIN",
            contentType: "QUESTION_ANALYTICS",
            contentId: "admin-question-analytics",
            contentTitle: "Question Analytics",
            numericValue: response?.totalTrackedItems || 0,
          },
          { oncePerSessionKey: "admin-question-analytics-viewed" }
        );
      } catch (err) {
        setError(err.response?.data?.message || "We could not load question analytics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="surface-card text-slate-300">Loading question analytics...</div>;
  }

  if (error) {
    return <div className="surface-card text-amber-200">{error}</div>;
  }

  return (
    <div className="admin-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">Question analytics</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Question quality insights
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          Review which questions receive answers frequently and which ones may be confusing or abandoned.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm text-slate-400">Tracked questions</p>
          <p className="mt-3 text-3xl font-semibold text-white">{data?.totalTrackedItems ?? 0}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Average completion rate</p>
          <p className="mt-3 text-3xl font-semibold text-white">{Number(data?.averageCompletionRate || 0).toFixed(0)}%</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Most attempted</p>
          <p className="mt-3 text-lg font-semibold text-white">{data?.mostAttempted?.contentTitle || "None"}</p>
        </div>
      </section>

      <section className="surface-card">
        <div className="table-shell overflow-x-auto">
          <table className="min-w-full">
            <thead className="table-head">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <th className="px-5 py-4">Question</th>
                <th className="px-5 py-4">Attempts</th>
                <th className="px-5 py-4">Users</th>
                <th className="px-5 py-4">Completion</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).map((item) => (
                <tr key={item.contentId} className="border-t border-white/5 text-sm text-slate-200">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{item.contentTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.topic || "Question insight"}</p>
                  </td>
                  <td className="px-5 py-4">{item.attemptCount}</td>
                  <td className="px-5 py-4">{item.uniqueUserCount}</td>
                  <td className="px-5 py-4">{Number(item.completionRate || 0).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
