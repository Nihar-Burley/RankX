import { useEffect, useState } from "react";
import { getProblemAnalytics } from "../services/adminAnalyticsApi";
import { trackAdminEvent } from "../utils/eventTracker";

function AnalyticsLayout({ title, description, data, loading, error }) {
  if (loading) {
    return <div className="surface-card text-slate-300">Loading {title.toLowerCase()}...</div>;
  }

  if (error) {
    return <div className="surface-card text-amber-200">{error}</div>;
  }

  if (!data?.items?.length) {
    return <div className="surface-card text-slate-400">No tracked data yet for {title.toLowerCase()}.</div>;
  }

  return (
    <div className="admin-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">{title}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Content performance insights
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          {description}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm text-slate-400">Average solve rate</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {Number(data.averageSolveRate || 0).toFixed(0)}%
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Average acceptance rate</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {Number(data.averageAcceptanceRate || 0).toFixed(0)}%
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Average completion rate</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {Number(data.averageCompletionRate || 0).toFixed(0)}%
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="surface-card">
          <h2 className="section-title">Most attempted</h2>
          <div className="mt-4 surface-card-soft">
            <p className="text-lg font-semibold text-white">{data.mostAttempted?.contentTitle}</p>
            <p className="mt-2 text-sm text-slate-400">
              {data.mostAttempted?.attemptCount ?? 0} attempts and{" "}
              {Number(data.mostAttempted?.acceptanceRate ?? 0).toFixed(0)}% acceptance
            </p>
          </div>
        </div>

        <div className="surface-card">
          <h2 className="section-title">Least attempted</h2>
          <div className="mt-4 surface-card-soft">
            <p className="text-lg font-semibold text-white">{data.leastAttempted?.contentTitle}</p>
            <p className="mt-2 text-sm text-slate-400">
              {data.leastAttempted?.attemptCount ?? 0} attempts and{" "}
              {Number(data.leastAttempted?.completionRate ?? 0).toFixed(0)}% completion
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card-soft">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">How to use this view</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          High-attempt, low-acceptance content may need copy, constraints, or difficulty tuning. Low-attempt content may need better placement or a clearer learning role inside study plans.
        </p>
      </section>

      <section className="surface-card">
        <div className="table-shell overflow-x-auto">
          <table className="min-w-full">
            <thead className="table-head">
              <tr className="text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <th className="px-5 py-4">Content</th>
                <th className="px-5 py-4">Attempts</th>
                <th className="px-5 py-4">Users</th>
                <th className="px-5 py-4">Solve rate</th>
                <th className="px-5 py-4">Acceptance</th>
                <th className="px-5 py-4">Completion</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.contentId} className="border-t border-white/5 text-sm text-slate-200">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{item.contentTitle}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.topic || "Unclassified"}</p>
                  </td>
                  <td className="px-5 py-4">{item.attemptCount}</td>
                  <td className="px-5 py-4">{item.uniqueUserCount}</td>
                  <td className="px-5 py-4">{Number(item.solveRate || 0).toFixed(0)}%</td>
                  <td className="px-5 py-4">{Number(item.acceptanceRate || 0).toFixed(0)}%</td>
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

export default function ProblemAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getProblemAnalytics();
        setData(response);
        trackAdminEvent(
          {
            eventName: "ADMIN_ANALYTICS_PROBLEMS_VIEWED",
            eventCategory: "ANALYTICS",
            source: "WEB",
            track: "ADMIN",
            contentType: "PROBLEM_ANALYTICS",
            contentId: "admin-problem-analytics",
            contentTitle: "Problem Analytics",
            numericValue: response?.totalTrackedItems || 0,
          },
          { oncePerSessionKey: "admin-problem-analytics-viewed" }
        );
      } catch (err) {
        setError(err.response?.data?.message || "We could not load problem analytics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AnalyticsLayout
      title="Problem analytics"
      description="Identify coding content that attracts attention, converts into accepted outcomes, and may need revision."
      data={data}
      loading={loading}
      error={error}
    />
  );
}
