import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createStudyPlanAdmin,
  getStudyPlanAdmin,
  updateStudyPlanAdmin,
} from "../services/studyPlanAdminApi";

const emptyPlan = {
  slug: "",
  title: "",
  description: "",
  track: "Both",
  level: "Beginner",
  active: true,
};

export default function StudyPlanEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyPlan);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const load = async () => {
      try {
        const response = await getStudyPlanAdmin(id);
        setForm({
          slug: response.slug || "",
          title: response.title || "",
          description: response.description || "",
          track: response.track || "Both",
          level: response.level || "Beginner",
          active: response.active ?? true,
        });
        setItems(response.items || []);
      } catch (err) {
        setError(err.response?.data?.message || "We could not load this study plan.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const itemHint = useMemo(() => {
    if (!items.length) {
      return "No study plan items yet. Save the plan, then add coding and quiz steps.";
    }
    return `${items.length} item${items.length === 1 ? "" : "s"} currently mapped to this plan.`;
  }, [items]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = { ...form, items };
      const response = isEdit
        ? await updateStudyPlanAdmin(id, payload)
        : await createStudyPlanAdmin(payload);
      navigate(`/admin/plans/${response.id}/items`, {
        replace: true,
        state: { notice: isEdit ? "Study plan updated." : "Study plan created. Add or refine its items." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "We could not save this study plan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="surface-card text-slate-300">Loading study plan editor...</div>;
  }

  return (
    <div className="admin-container space-y-6">
      <header className="page-header">
        <p className="eyebrow">{isEdit ? "Update study plan" : "Create study plan"}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {isEdit ? "Refine plan strategy and metadata" : "Create a new guided learning path"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
          Keep the plan metadata sharp so recommendations, enrollment pages, and progress widgets
          communicate the right learning path to users.
        </p>
      </header>

      {error ? <div className="surface-card text-amber-200">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section className="surface-card space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Slug</span>
              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className="input"
                placeholder="mixed-interview-prep"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Title</span>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input"
                placeholder="Mixed Interview Prep"
                required
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-200">Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input min-h-32"
              placeholder="Describe how this plan builds skill confidence over time."
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Track</span>
              <select name="track" value={form.track} onChange={handleChange} className="input">
                <option value="Coding">Coding</option>
                <option value="Quiz">Quiz</option>
                <option value="Both">Both</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Level</span>
              <select name="level" value={form.level} onChange={handleChange} className="input">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/20 bg-transparent"
              />
              Active and visible for new enrollments
            </label>
          </div>
        </section>

        <aside className="surface-card space-y-4">
          <div className="surface-card-soft">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Item readiness</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">{itemHint}</p>
          </div>

          <div className="surface-card-soft">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Reference model</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Items use canonical keys such as <code>problem-123</code> and <code>quiz-uuid</code>
              so real coding and quiz activity can advance progress automatically.
            </p>
          </div>

          <div className="surface-card-soft">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Quality bar</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              A strong plan title should promise a clear outcome. The description should explain how the learner will improve, not just list content.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Save changes" : "Create plan"}
            </button>
            <Link to="/admin/plans" className="btn-secondary">
              Back to plans
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
