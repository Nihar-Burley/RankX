import { FaEdit, FaEye, FaListUl, FaToggleOff, FaToggleOn } from "react-icons/fa";

const statusStyles = {
  PUBLISHED: "badge-success",
  DRAFT: "badge-warning",
};

const actionButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-slate-300 transition hover:border-white/12 hover:bg-white/[0.08] hover:text-white";

const QuizRow = ({
  quiz,
  selected,
  onSelect,
  onView,
  onEdit,
  onQuestions,
  onToggleStatus,
}) => {
  const isPublished = quiz.status === "PUBLISHED";

  return (
    <article
      className={`rounded-[24px] border p-5 shadow-[0_16px_40px_rgba(2,8,23,0.18)] transition ${
        selected
          ? "border-sky-300/25 bg-sky-400/8"
          : "border-white/8 bg-slate-950/55"
      }`}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex flex-1 items-start gap-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            aria-label={`Select ${quiz.title}`}
            className="mt-1 h-4 w-4 rounded border-white/15 bg-slate-900 text-sky-400 focus:ring-sky-400"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {quiz.description || "No description provided."}
                </p>
              </div>
              <span className={statusStyles[quiz.status] || "badge-neutral"}>
                {quiz.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="badge-neutral">{quiz.durationMinutes} minutes</span>
              <span className="badge-neutral">Quiz ID #{quiz.id}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <button onClick={onView} className={actionButtonClass} title="Preview quiz">
            <FaEye />
          </button>

          <button
            onClick={onEdit}
            disabled={isPublished}
            className={`${actionButtonClass} ${
              isPublished ? "cursor-not-allowed opacity-45 hover:bg-white/[0.04] hover:text-slate-300" : ""
            }`}
            title={isPublished ? "Cannot edit a published quiz" : "Edit quiz"}
          >
            <FaEdit />
          </button>

          <button
            onClick={onQuestions}
            className={actionButtonClass}
            title="Manage questions"
          >
            <FaListUl />
          </button>

          <button
            onClick={onToggleStatus}
            className={actionButtonClass}
            title={isPublished ? "Unpublish quiz" : "Publish quiz"}
          >
            {isPublished ? (
              <FaToggleOn className="text-emerald-300" />
            ) : (
              <FaToggleOff className="text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

export default QuizRow;
