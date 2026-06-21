import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getStudyPlanAdmin, updateStudyPlanAdmin } from "../services/studyPlanAdminApi";

const emptyItem = {
  sequenceNumber: 1,
  title: "",
  description: "",
  itemType: "CODING_PROBLEM",
  referenceType: "problem",
  referenceId: "",
  estimatedMinutes: 20,
};

function buildPayload(plan, items) {
  return {
    slug: plan.slug,
    title: plan.title,
    description: plan.description,
    track: plan.track,
    level: plan.level,
    active: plan.active,
    items: items.map((item, index) => ({
      sequenceNumber: Number(item.sequenceNumber || index + 1),
      title: item.title,
      description: item.description,
      itemType: item.itemType,
      referenceType: item.referenceType,
      referenceId: item.referenceId,
      estimatedMinutes: Number(item.estimatedMinutes || 0),
    })),
  };
}

export default function StudyPlanItemsEditor() {
  const { id } = useParams();
  const location = useLocation();
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getStudyPlanAdmin(id);
        setPlan(response);
        setItems(response.items || []);
      } catch (err) {
        setError(err.response?.data?.message || "We could not load this study plan.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => left.sequenceNumber - right.sequenceNumber),
    [items]
  );

  const resetDraft = () => {
    setDraft({
      ...emptyItem,
      sequenceNumber: items.length + 1,
    });
    setEditingId(null);
  };

  const handleDraftChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => {
      const next = { ...current, [name]: value };
      if (name === "itemType") {
        next.referenceType = value === "QUIZ" ? "quiz" : "problem";
      }
      return next;
    });
  };

  const handleSaveItems = async (nextItems, successMessage) => {
    if (!plan) {
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await updateStudyPlanAdmin(id, buildPayload(plan, nextItems));
      setPlan(response);
      setItems(response.items || []);
      setNotice(successMessage);
    } catch (err) {
      setError(err.response?.data?.message || "We could not save study plan items.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedItem = {
      ...draft,
      sequenceNumber: Number(draft.sequenceNumber),
      estimatedMinutes: Number(draft.estimatedMinutes),
    };

    const nextItems = editingId
      ? items.map((item) => (item.id === editingId ? { ...item, ...normalizedItem } : item))
      : [...items, { ...normalizedItem, id: `draft-${Date.now()}` }];

    await handleSaveItems(nextItems, editingId ? "Study plan item updated." : "Study plan item added.");
    resetDraft();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setDraft({
      sequenceNumber: item.sequenceNumber,
      title: item.title,
      description: item.description,
      itemType: item.itemType,
      referenceType: item.referenceType,
      referenceId: item.referenceId,
      estimatedMinutes: item.estimatedMinutes,
    });
  };

  const handleDelete = async (itemId) => {
    const nextItems = items.filter((item) => item.id !== itemId);
    await handleSaveItems(nextItems, "Study plan item removed.");
    if (editingId === itemId) {
      resetDraft();
    }
  };

  if (loading) {
    return <div className="surface-card text-slate-300">Loading study plan items...</div>;
  }

  if (!plan) {
    return <div className="surface-card text-amber-200">{error || "Study plan not found."}</div>;
  }

  return (
    <div className="admin-container space-y-6">
      <header className="page-header">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">Study plan item mapping</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {plan.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Attach real problem and quiz references so user activity can advance plan progress
              without fake frontend state.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/admin/plans/${plan.id}/edit`} className="btn-secondary">
              Edit metadata
            </Link>
            <Link to="/admin/plans" className="btn-secondary">
              Back to plans
            </Link>
          </div>
        </div>
      </header>

      {notice ? <div className="surface-card text-emerald-200">{notice}</div> : null}
      {error ? <div className="surface-card text-amber-200">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
        <section className="surface-card">
          <h2 className="section-title">{editingId ? "Edit item" : "Add item"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use real content IDs only. The quality of this mapping determines whether progress sync, recommendations, and reporting remain trustworthy.
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Sequence</span>
                <input
                  type="number"
                  min="1"
                  name="sequenceNumber"
                  value={draft.sequenceNumber}
                  onChange={handleDraftChange}
                  className="input"
                  required
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Estimated minutes</span>
                <input
                  type="number"
                  min="1"
                  name="estimatedMinutes"
                  value={draft.estimatedMinutes}
                  onChange={handleDraftChange}
                  className="input"
                  required
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Title</span>
              <input
                name="title"
                value={draft.title}
                onChange={handleDraftChange}
                className="input"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-200">Description</span>
              <textarea
                name="description"
                value={draft.description}
                onChange={handleDraftChange}
                className="input min-h-28"
                required
              />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Item type</span>
                <select name="itemType" value={draft.itemType} onChange={handleDraftChange} className="input">
                  <option value="CODING_PROBLEM">Coding problem</option>
                  <option value="QUIZ">Quiz</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Reference type</span>
                <input name="referenceType" value={draft.referenceType} onChange={handleDraftChange} className="input" required />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Reference ID</span>
                <input
                  name="referenceId"
                  value={draft.referenceId}
                  onChange={handleDraftChange}
                  className="input"
                  placeholder={draft.referenceType === "quiz" ? "quiz UUID" : "problem numeric ID"}
                  required
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update item" : "Add item"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetDraft}>
                Clear
              </button>
            </div>
          </form>
        </section>

        <section className="surface-card">
          <h2 className="section-title">Current item sequence</h2>
          {!sortedItems.length ? (
            <div className="mt-5 surface-card-soft text-slate-400">
              No items mapped yet. Add the first problem or quiz reference to start the plan.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {sortedItems.map((item) => (
                <article key={item.id} className="surface-card-soft">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="badge-neutral">
                        Step {item.sequenceNumber} • {item.itemType === "QUIZ" ? "Quiz" : "Coding"}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {item.referenceKey || `${item.referenceType}-${item.referenceId}`} • {item.estimatedMinutes} min
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className="btn-secondary" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => handleDelete(item.id)}
                        disabled={saving}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
