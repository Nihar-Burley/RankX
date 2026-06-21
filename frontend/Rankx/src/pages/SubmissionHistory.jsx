import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyRecentSubmissions } from "../services/submissionApi";

const formatTimestamp = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString();
};

export default function SubmissionHistory() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    languageKey: "",
    problemId: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const data = await getMyRecentSubmissions({
          status: filters.status || undefined,
          languageKey: filters.languageKey || undefined,
          problemId: filters.problemId && !Number.isNaN(Number(filters.problemId))
            ? Number(filters.problemId)
            : undefined,
        });
        setSubmissions(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError("We could not load your submission history.");
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
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
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Coding History
            </p>
            <h1 className="mt-3 text-4xl font-bold">Submission History</h1>
            <p className="mt-2 text-slate-400">
              Review your recent coding attempts, verdicts, and performance data.
            </p>
          </div>
          <button
            onClick={() => navigate("/home")}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mb-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-3">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block text-slate-400">Status</span>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            >
              <option value="">All statuses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
              <option value="COMPILATION_ERROR">Compilation Error</option>
            </select>
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block text-slate-400">Language</span>
            <input
              name="languageKey"
              value={filters.languageKey}
              onChange={handleFilterChange}
              placeholder="java, python..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block text-slate-400">Problem ID</span>
            <input
              name="problemId"
              value={filters.problemId}
              onChange={handleFilterChange}
              inputMode="numeric"
              placeholder="101"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
            />
          </label>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
            Loading submission history...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 text-amber-200">
            {error}
          </div>
        ) : submissions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            No submissions yet. Solve a problem to start building your history.
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <table className="w-full">
              <thead className="bg-slate-800 text-left text-sm text-slate-300">
                <tr>
                  <th className="px-6 py-4">Submission</th>
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Verdict</th>
                  <th className="px-6 py-4">Runtime</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    onClick={() => navigate(`/submissions/${submission.id}`)}
                    className="cursor-pointer border-t border-slate-800 text-sm text-slate-200 transition hover:bg-slate-800/80"
                  >
                    <td className="px-6 py-4 font-medium">#{submission.id}</td>
                    <td className="px-6 py-4">#{submission.problemId}</td>
                    <td className="px-6 py-4">{submission.languageKey}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {submission.runtimeMs != null
                        ? `${submission.runtimeMs} ms`
                        : "Pending"}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatTimestamp(submission.createdAt)}
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
