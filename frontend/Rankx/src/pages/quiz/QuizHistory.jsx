import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyResults } from "../../services/resultApi";

const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;

export default function QuizHistory() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    quizId: "",
    minimumPercentage: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadResults = async () => {
      try {
        setLoading(true);
        const response = await getMyResults({
          quizId: filters.quizId || undefined,
          minimumPercentage:
            filters.minimumPercentage !== "" && !Number.isNaN(Number(filters.minimumPercentage))
              ? Number(filters.minimumPercentage)
              : undefined,
        });
        setResults(Array.isArray(response.data) ? response.data : []);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError("We could not load your quiz history.");
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [filters, navigate]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
              Quiz History
            </p>
            <h1 className="mt-3 text-4xl font-bold">Quiz Results</h1>
            <p className="mt-2 text-slate-400">
              Review your quiz attempts, score trends, and jump into detailed review.
            </p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mb-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-2">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block text-slate-400">Quiz ID</span>
            <input
              name="quizId"
              value={filters.quizId}
              onChange={handleFilterChange}
              placeholder="Quiz UUID"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block text-slate-400">Minimum score %</span>
            <input
              name="minimumPercentage"
              value={filters.minimumPercentage}
              onChange={handleFilterChange}
              inputMode="decimal"
              placeholder="60"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            />
          </label>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
            Loading quiz history...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 text-amber-200">
            {error}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            No quiz results yet. Attempt a quiz to build your history.
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <table className="w-full">
              <thead className="bg-slate-800 text-left text-sm text-slate-300">
                <tr>
                  <th className="px-6 py-4">Attempt</th>
                  <th className="px-6 py-4">Quiz</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr
                    key={result.attemptId}
                    onClick={() => navigate(`/quiz/review/${result.attemptId}`)}
                    className="cursor-pointer border-t border-slate-800 text-sm text-slate-200 transition hover:bg-slate-800/80"
                  >
                    <td className="px-6 py-4 font-medium">#{result.attemptId}</td>
                    <td className="px-6 py-4">#{result.quizId}</td>
                    <td className="px-6 py-4">
                      {result.score}/{result.totalQuestions}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatPercentage(result.percentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
