import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deactivateStudyPlanAdmin, getStudyPlansAdmin } from "../services/studyPlanAdminApi";

export default function StudyPlanList() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getStudyPlansAdmin();
        setPlans(response || []);
      } catch (err) {
        setError(err.response?.data?.message || "We could not load study plans.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((plan) => plan.active).length;
    const totalItems = plans.reduce((sum, plan) => sum + (plan.totalItems || 0), 0);
    return { total, active, totalItems };
  }, [plans]);

  const handleDeactivate = async (planId) => {
    setWorkingId(planId);
    setError("");
    try {
      const updated = await deactivateStudyPlanAdmin(planId);
      setPlans((current) =>
        current.map((plan) => (plan.id === updated.id ? { ...plan, active: updated.active } : plan))
      );
    } catch (err) {
      setError(err.response?.data?.message || "We could not deactivate this study plan.");
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return <div className="surface-card text-slate-300">Loading study plans...</div>;
  }

  if (error && !plans.length) {
    return <div className="surface-card text-amber-200">{error}</div>;
  }

  return (
    <div className="admin-container space-y-6">
      <header className="page-header">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Study plan operations</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Manage guided learning paths
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Build structured coding and quiz plans with real content references so user progress
              sync stays trustworthy across the product.
            </p>
          </div>
          <Link to="/admin/plans/create" className="btn-primary">
            Create study plan
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="stat-card">
          <p className="text-sm text-slate-400">Total plans</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Active plans</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.active}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-slate-400">Mapped content items</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.totalItems}</p>
        </div>
      </section>

      {error ? <div className="surface-card text-amber-200">{error}</div> : null}

      {!plans.length ? (
        <div className="surface-card text-slate-400">
          No study plans exist yet. Create the first plan to enable guided learning paths.
        </div>
      ) : (
        <section className="grid gap-5 xl:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.id} className="surface-card space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="badge-neutral">{plan.track}</div>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{plan.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{plan.description}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    plan.active
                      ? "bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-300/20"
                      : "bg-white/5 text-slate-400 ring-1 ring-white/10"
                  }`}
                >
                  {plan.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-card-soft">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Slug</p>
                  <p className="mt-2 text-sm text-white">{plan.slug}</p>
                </div>
                <div className="surface-card-soft">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Level</p>
                  <p className="mt-2 text-sm text-white">{plan.level}</p>
                </div>
                <div className="surface-card-soft">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Items</p>
                  <p className="mt-2 text-sm text-white">{plan.totalItems || 0}</p>
                </div>
              </div>

              <div className="surface-card-soft">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Operator note</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Keep titles outcome-oriented and ensure every item maps to real content so progress sync and recommendations stay trustworthy.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to={`/admin/plans/${plan.id}/edit`} className="btn-secondary">
                  Edit plan
                </Link>
                <Link to={`/admin/plans/${plan.id}/items`} className="btn-secondary">
                  Manage items
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeactivate(plan.id)}
                  disabled={!plan.active || workingId === plan.id}
                  className="btn-ghost"
                >
                  {workingId === plan.id ? "Updating..." : plan.active ? "Deactivate" : "Inactive"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
