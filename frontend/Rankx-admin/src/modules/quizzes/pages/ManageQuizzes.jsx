import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";
import QuizFilters from "../components/QuizFilters";
import QuizRow from "../components/QuizRow";
import BulkActionBar from "../components/BulkActionBar";
import { bulkDelete, bulkPublish, getQuizzes } from "../services/quizApi";

const ManageQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load quizzes", err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (filters.status && quiz.status !== filters.status) return false;
    if (
      filters.search &&
      !quiz.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const handleBulkDelete = async () => {
    if (!selected.length) return;

    try {
      await bulkDelete(selected);
      setQuizzes((prev) => prev.filter((quiz) => !selected.includes(quiz.id)));
      setSelected([]);
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  const handleBulkPublish = async (publish) => {
    if (!selected.length) return;

    try {
      await bulkPublish(selected, publish);
      setQuizzes((prev) =>
        prev.map((quiz) =>
          selected.includes(quiz.id)
            ? { ...quiz, status: publish ? "PUBLISHED" : "DRAFT" }
            : quiz
        )
      );
      setSelected([]);
    } catch (err) {
      console.error("Bulk publish/unpublish failed", err);
    }
  };

  const handleSingleStatusToggle = async (quiz) => {
    try {
      const publish = quiz.status !== "PUBLISHED";
      await bulkPublish([quiz.id], publish);

      setQuizzes((prev) =>
        prev.map((currentQuiz) =>
          currentQuiz.id === quiz.id
            ? { ...currentQuiz, status: publish ? "PUBLISHED" : "DRAFT" }
            : currentQuiz
        )
      );
    } catch (err) {
      console.error("Failed to toggle quiz status", err);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-container space-y-6">
        <header className="page-header">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Quiz Operations</p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Manage quizzes
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Create, publish, and organize quizzes from a cleaner control surface
                with more consistent filtering, actions, and responsive behavior.
              </p>
            </div>

            <button
              onClick={() => navigate("/quizzes/create")}
              className="btn-primary"
            >
              <FaPlusCircle className="text-sm" />
              Create quiz
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="stat-card">
            <p className="text-sm text-slate-400">Visible quizzes</p>
            <p className="mt-3 text-3xl font-semibold text-white">{filteredQuizzes.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-400">Published</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {quizzes.filter((quiz) => quiz.status === "PUBLISHED").length}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-slate-400">Drafts</p>
            <p className="mt-3 text-3xl font-semibold text-white">
              {quizzes.filter((quiz) => quiz.status === "DRAFT").length}
            </p>
          </div>
        </section>

        <section className="surface-card space-y-5">
          <div>
            <h2 className="section-title">Catalog</h2>
            <p className="section-copy mt-1 text-sm">
              Filter the quiz list, review status, and perform batch actions.
            </p>
          </div>

          <QuizFilters filters={filters} onChange={setFilters} />

          <BulkActionBar
            count={selected.length}
            onPublish={() => handleBulkPublish(true)}
            onUnpublish={() => handleBulkPublish(false)}
            onDelete={handleBulkDelete}
          />

          {loading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="surface-card-soft animate-pulse">
                  <div className="h-5 w-1/3 rounded-full bg-white/8" />
                  <div className="mt-4 h-4 w-3/4 rounded-full bg-white/8" />
                  <div className="mt-6 h-10 rounded-2xl bg-white/8" />
                </div>
              ))}
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="empty-state">
              <p className="text-base font-medium text-white">No quizzes found</p>
              <p className="mt-2 text-sm text-slate-400">
                Adjust the filters or create a new quiz to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuizzes.map((quiz) => (
                <QuizRow
                  key={quiz.id}
                  quiz={quiz}
                  selected={selected.includes(quiz.id)}
                  onSelect={() =>
                    setSelected((prev) =>
                      prev.includes(quiz.id)
                        ? prev.filter((id) => id !== quiz.id)
                        : [...prev, quiz.id]
                    )
                  }
                  onView={() => navigate(`/quizzes/${quiz.id}/preview`)}
                  onEdit={() => navigate(`/quizzes/${quiz.id}/edit`)}
                  onQuestions={() => navigate(`/quizzes/${quiz.id}/questions`)}
                  onToggleStatus={() => handleSingleStatusToggle(quiz)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ManageQuizzes;
