import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const difficultyStyles = {
  EASY: "status-easy",
  MEDIUM: "status-medium",
  HARD: "status-hard",
};

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/problems")
      .then((res) => {
        setProblems(res.data.content || []);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }

        setError("We couldn't load the problem catalog right now.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const filteredProblems = useMemo(
    () =>
      problems.filter((problem) =>
        problem.title.toLowerCase().includes(search.toLowerCase())
      ),
    [problems, search]
  );

  return (
    <div className="app-shell">
      <div className="app-container space-y-6">
        <header className="page-header">
          <p className="eyebrow">Coding Practice</p>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Problem bank
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Browse coding challenges, filter quickly, and jump back into
                problem solving with a cleaner, easier-to-scan catalog.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
              <div className="stat-card min-w-[180px]">
                <p className="text-sm text-slate-400">Available problems</p>
                <p className="mt-2 text-3xl font-semibold text-white">{problems.length}</p>
              </div>
              <div className="stat-card min-w-[180px]">
                <p className="text-sm text-slate-400">Matching search</p>
                <p className="mt-2 text-3xl font-semibold text-white">
                  {filteredProblems.length}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="surface-card space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="section-title">Find your next challenge</h2>
              <p className="section-copy mt-1 text-sm">
                Search by title and open any problem without changing the
                existing workflow.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <label htmlFor="problem-search" className="sr-only">
                Search problems
              </label>
              <input
                id="problem-search"
                type="search"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base"
              />
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              {error}
            </div>
          ) : null}

          <div className="table-shell overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="table-head">
                <tr className="border-b border-white/10 text-left">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Problem
                  </th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Difficulty
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="px-5 py-4">
                        <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/8" />
                      </td>
                      <td className="px-5 py-4">
                        <div className="h-5 w-24 animate-pulse rounded-full bg-white/8" />
                      </td>
                    </tr>
                  ))
                ) : filteredProblems.length > 0 ? (
                  filteredProblems.map((problem, idx) => (
                    <tr
                      key={problem.id}
                      onClick={() => navigate(`/problems/${problem.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/problems/${problem.id}`);
                        }
                      }}
                      tabIndex={0}
                      className="table-row cursor-pointer border-b border-white/5 text-sm text-slate-200 last:border-b-0 focus:outline-none focus-visible:bg-slate-800/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="badge-neutral min-w-8 justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-white">{problem.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`badge ${difficultyStyles[problem.difficulty] || "badge-neutral"}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-5 py-10">
                      <div className="empty-state">
                        <p className="text-base font-medium text-white">No problems found</p>
                        <p className="mt-2 text-sm text-slate-400">
                          Try a different search term to broaden the results.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
