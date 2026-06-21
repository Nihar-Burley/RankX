import { useEffect, useState } from "react";
import { getAdminKpis } from "../services/adminAnalyticsApi";
import { trackAdminEvent } from "../utils/eventTracker";

export default function AdminKpiDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAdminKpis();
        setData(response);
        trackAdminEvent(
          {
            eventName: "ADMIN_KPI_PAGE_VIEWED",
            eventCategory: "ANALYTICS",
            source: "WEB",
            track: "ADMIN",
            contentType: "ADMIN_DASHBOARD",
            contentId: "admin-kpi-dashboard",
            contentTitle: "Admin KPI Dashboard",
            numericValue: response?.totalEvents || 0,
          },
          { oncePerSessionKey: "admin-kpi-dashboard-viewed" }
        );
      } catch (err) {
        setError(err.response?.data?.message || "We could not load KPI analytics.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="surface-card text-slate-300">Loading KPI dashboard...</div>;
  }

  if (error) {
    return <div className="surface-card text-amber-200">{error}</div>;
  }

  return (
    <div className="admin-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">Admin KPI Dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Activation and engagement health
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          Monitor product activation, active usage, and event-driven engagement in one
          operational dashboard.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Tracked users", data?.totalTrackedUsers ?? 0],
          ["Weekly active", data?.activeUsersLast7Days ?? 0],
          ["Activation rate", `${Number(data?.activationRate ?? 0).toFixed(0)}%`],
          ["Engagement rate", `${Number(data?.engagementRate ?? 0).toFixed(0)}%`],
        ].map(([label, value]) => (
          <div key={label} className="stat-card">
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card">
          <h2 className="section-title">Event breakdown</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Total events", data?.totalEvents ?? 0],
              ["Login events", data?.loginEvents ?? 0],
              ["Onboarding completions", data?.onboardingCompletions ?? 0],
              ["Coding events", data?.codingEvents ?? 0],
              ["Quiz events", data?.quizEvents ?? 0],
              ["Progress events", data?.progressEvents ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="surface-card-soft">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card">
          <h2 className="section-title">Highlights</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use these callouts to spot whether activation is healthy or whether engagement is being carried by only a narrow slice of the product.
          </p>
          <div className="mt-6 space-y-4">
            {(data?.highlights || []).map((item) => (
              <div key={item.title} className="surface-card-soft">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-white">{item.title}</p>
                  <span className="badge-neutral">{item.valueLabel}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
