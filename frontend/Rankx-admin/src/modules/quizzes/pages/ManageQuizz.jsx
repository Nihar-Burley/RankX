import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle } from "react-icons/fa";

import QuizFilters from "../components/QuizFilters";
import QuizRow from "../components/QuizRow";
import BulkActionBar from "../components/BulkActionBar";

import {
  getQuizzes,
  bulkPublish,
  bulkDelete,
} from "../services/quizApi";

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
      const quizzesData = await getQuizzes();
      setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
    } catch (err) {
      console.error("❌ Failed to load quizzes", err);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= BULK ACTIONS ================= */

  const handleBulkDelete = async () => {
    if (!selected.length) return;

    try {
      await bulkDelete(selected);

      setQuizzes((prev) =>
        prev.filter((quiz) => !selected.includes(quiz.id))
      );
      setSelected([]);
    } catch (err) {
      console.error("❌ Bulk delete failed", err);
    }
  };

  const handleBulkPublish = async (published) => {
    if (!selected.length) return;

    try {
      await bulkPublish(selected, published);

      setQuizzes((prev) =>
        prev.map((quiz) =>
          selected.includes(quiz.id)
            ? { ...quiz, published }
            : quiz
        )
      );

      setSelected([]);
    } catch (err) {
      console.error("❌ Bulk publish/unpublish failed", err);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-8 py-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Manage Quizzes
          </h1>
          <p className="text-gray-400 mt-2">
            Create, publish, and manage all quizzes from one place
          </p>
        </div>

        <button
          onClick={() => navigate("/quizzes/create")}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:scale-[1.02] transition"
        >
          <FaPlusCircle className="text-lg" />
          Create Quiz
        </button>
      </div>

      {/* STATS */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-xl shadow-md max-w-sm">
          <p className="text-gray-400 text-sm">Total Quizzes</p>
          <p className="text-3xl font-bold mt-2">{quizzes.length}</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6">
        <QuizFilters filters={filters} onChange={setFilters} />
      </div>

      {/* BULK ACTION BAR */}
      <BulkActionBar
        count={selected.length}
        onPublish={() => handleBulkPublish(true)}
        onUnpublish={() => handleBulkPublish(false)}
        onDelete={handleBulkDelete}
      />


      {/* QUIZ LIST */}
      <div className="mt-6">
        {loading ? (
          <p className="text-gray-400">Loading quizzes...</p>
        ) : quizzes.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg font-medium">No quizzes found</p>
            <p className="text-sm mt-1">
              Create your first quiz to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((q) => (
              <QuizRow
                key={q.id}
                quiz={q}
                selected={selected.includes(q.id)}
                onSelect={() =>
                  setSelected((prev) =>
                    prev.includes(q.id)
                      ? prev.filter((id) => id !== q.id)
                      : [...prev, q.id]
                  )
                }
                onView={() => navigate(`/quizzes/${q.id}/preview`)}
                onEdit={() => navigate(`/quizzes/${q.id}/edit`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuizzes;
