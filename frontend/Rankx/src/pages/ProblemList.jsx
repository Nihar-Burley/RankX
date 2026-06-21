import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import LoadingState from "../components/LoadingState";
import Button from "../components/ui/Button";
import api from "../services/api";

const difficultyTone = {
  EASY: "border-emerald-500/20 bg-emerald-500/12 text-emerald-300",
  MEDIUM: "border-amber-500/20 bg-amber-500/12 text-amber-300",
  HARD: "border-rose-500/20 bg-rose-500/12 text-rose-300",
};

function CodeGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="m9 8-4 4 4 4" />
      <path d="m15 8 4 4-4 4" />
      <path d="m13 6-2 12" />
    </svg>
  );
}

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-[#6f63ff] bg-[#6f63ff] text-white shadow-[0_10px_26px_rgba(111,99,255,0.24)]"
          : "border-white/10 bg-transparent text-slate-400 hover:border-white/16 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function DifficultyBadge({ difficulty }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
        difficultyTone[difficulty] || "border-white/10 bg-white/[0.04] text-slate-300"
      }`}
    >
      {(difficulty || "Unknown").toLowerCase()}
    </span>
  );
}

function formatLanguage(language) {
  return language?.displayName || language?.languageKey || language?.name || "Language";
}

export default function ProblemList() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [problemDetailCache, setProblemDetailCache] = useState({});
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/problems", {
        params: {
          page: 0,
          size: 100,
          sortBy: "createdAt",
          sortDir: "desc",
        },
      })
      .then((response) => {
        const items = Array.isArray(response.data?.content) ? response.data.content : [];
        setProblems(items);
        setSelectedProblemId(items[0]?.id || null);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError("We could not load the problem catalog right now.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    problems.forEach((problem) => {
      (problem.tags || []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).slice(0, 10);
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return problems.filter((problem) => {
      const matchesSearch =
        !normalizedSearch ||
        problem.title.toLowerCase().includes(normalizedSearch) ||
        (problem.tags || []).some((tag) => tag.toLowerCase().includes(normalizedSearch));
      const matchesDifficulty = difficulty === "ALL" || problem.difficulty === difficulty;
      const matchesTag = selectedTag === "ALL" || (problem.tags || []).includes(selectedTag);

      return matchesSearch && matchesDifficulty && matchesTag;
    });
  }, [difficulty, problems, search, selectedTag]);

  useEffect(() => {
    if (!filteredProblems.length) {
      return;
    }

    const selectionStillVisible = filteredProblems.some((problem) => problem.id === selectedProblemId);
    if (!selectionStillVisible) {
      setSelectedProblemId(filteredProblems[0].id);
    }
  }, [filteredProblems, selectedProblemId]);

  useEffect(() => {
    if (!selectedProblemId || problemDetailCache[selectedProblemId]) {
      return;
    }

    setDetailLoading(true);
    api
      .get(`/problems/${selectedProblemId}`)
      .then((response) => {
        setProblemDetailCache((current) => ({
          ...current,
          [selectedProblemId]: response.data,
        }));
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/login", { replace: true });
        }
      })
      .finally(() => setDetailLoading(false));
  }, [navigate, problemDetailCache, selectedProblemId]);

  const selectedProblem =
    problemDetailCache[selectedProblemId] ||
    filteredProblems.find((problem) => problem.id === selectedProblemId) ||
    null;

  const difficultyCounts = useMemo(
    () =>
      problems.reduce(
        (accumulator, problem) => ({
          ...accumulator,
          [problem.difficulty]: (accumulator[problem.difficulty] || 0) + 1,
        }),
        { EASY: 0, MEDIUM: 0, HARD: 0 },
      ),
    [problems],
  );

  if (loading) {
    return <LoadingState title="Loading problems" description="Preparing the catalog and live preview workspace." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Problem catalog is unavailable right now"
        message={error}
        action={
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!filteredProblems.length) {
    return (
      <EmptyState
        title="No problems match these filters"
        description="Try broadening the search or switching the selected topic and difficulty."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearch("");
              setDifficulty("ALL");
              setSelectedTag("ALL");
            }}
          >
            Clear filters
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <div className="max-w-[780px]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#7d88a0]">Coding practice</p>
          <h1 className="mt-4 text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-[3.45rem]">
            Practice coding with instant evaluation
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Keep the catalog, filters, and live problem preview open in one focused workspace so you can choose the
            right challenge faster.
          </p>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-white/8 bg-[#171b25] shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="text-[#8c82ff]">
                <CodeGlyph />
              </span>
              Filters
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDifficulty("ALL");
                setSelectedTag("ALL");
              }}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-300"
            >
              Reset
            </button>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <label className="relative block">
                <span className="sr-only">Search problems</span>
                <input
                  id="problem-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search problems..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#10141d] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#6f63ff] focus:ring-4 focus:ring-[#6f63ff]/12"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Difficulty</span>
                {["ALL", "EASY", "MEDIUM", "HARD"].map((level) => (
                  <FilterChip key={level} active={difficulty === level} onClick={() => setDifficulty(level)}>
                    {level === "ALL" ? "All" : level.charAt(0) + level.slice(1).toLowerCase()}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="border-t border-white/8 pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Topic</span>
                <FilterChip active={selectedTag === "ALL"} onClick={() => setSelectedTag("ALL")}>
                  All
                </FilterChip>
                {availableTags.map((tag) => (
                  <FilterChip key={tag} active={selectedTag === tag} onClick={() => setSelectedTag(tag)}>
                    {tag}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="overflow-hidden rounded-[24px] border border-white/8 bg-[#171b25] shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
          <div className="border-b border-white/8 px-5 py-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Problem list</p>
                <p className="mt-1 text-xs text-slate-500">
                  Showing {filteredProblems.length} of {problems.length} problems
                </p>
              </div>
              <p className="text-xs text-slate-500">
                {difficultyCounts.EASY} easy / {difficultyCounts.MEDIUM} medium / {difficultyCounts.HARD} hard
              </p>
            </div>
          </div>

          <div className="max-h-[760px] overflow-y-auto scrollbar-subtle">
            {filteredProblems.map((problem) => {
              const isActive = problem.id === selectedProblemId;
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => setSelectedProblemId(problem.id)}
                  className={`w-full border-b border-white/8 px-5 py-4 text-left transition last:border-b-0 ${
                    isActive ? "bg-[#1d2130]" : "hover:bg-white/[0.025]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        isActive ? "bg-[#6f63ff]" : "border border-slate-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-white">{problem.title}</p>
                        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                          #{problem.id}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <DifficultyBadge difficulty={problem.difficulty} />
                        {(problem.tags || []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {(problem.languages || []).length ? (
                          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-500">
                            {(problem.languages || []).length} lang
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="overflow-hidden rounded-[24px] border border-white/8 bg-[#171b25] shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
          {selectedProblem ? (
            <>
              <div className="border-b border-white/8 px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <DifficultyBadge difficulty={selectedProblem.difficulty} />
                      {(selectedProblem.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {detailLoading ? (
                        <span className="rounded-full border border-[#6f63ff]/20 bg-[#6f63ff]/10 px-2.5 py-1 text-[11px] text-[#b4adff]">
                          Syncing preview
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-white">
                      {selectedProblem.title}
                    </h2>
                    <p className="mt-3 max-w-[760px] text-sm leading-7 text-slate-400">
                      {selectedProblem.statement || "Open the workspace to review the full prompt and examples."}
                    </p>
                  </div>
                  <Button type="button" className="shrink-0 rounded-2xl px-5" onClick={() => navigate(`/problems/${selectedProblem.id}`)}>
                    Run Code
                  </Button>
                </div>
              </div>

              <div className="border-b border-white/8 px-5">
                <div className="flex gap-6 text-sm">
                  <span className="border-b border-[#6f63ff] px-1 py-3 font-semibold text-white">Problem</span>
                  <button
                    type="button"
                    onClick={() => navigate("/submissions")}
                    className="px-1 py-3 font-medium text-slate-500 transition hover:text-slate-300"
                  >
                    Submissions
                  </button>
                </div>
              </div>

              <div className="space-y-6 px-5 py-6">
                <div className="rounded-[20px] border border-white/8 bg-[#121722] p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Problem overview</p>
                  <p className="mt-4 text-sm leading-7 text-slate-300">
                    {selectedProblem.statement || "Open the coding workspace to review the full prompt."}
                  </p>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[20px] border border-white/8 bg-[#121722] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Constraints</p>
                    <p className="mt-4 text-sm leading-7 text-slate-300">
                      {selectedProblem.constraints || "No explicit constraints were provided for this problem."}
                    </p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-[#121722] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Supported languages</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(selectedProblem.languages || []).length > 0 ? (
                        selectedProblem.languages.map((language) => (
                          <span
                            key={language.languageKey || language.name || language.displayName}
                            className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300"
                          >
                            {formatLanguage(language)}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">Open the workspace to inspect supported languages.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[20px] border border-white/8 bg-[#121722] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Catalog size</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{problems.length}</p>
                    <p className="mt-2 text-sm text-slate-400">Published coding problems</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-[#121722] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Difficulty mix</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                      {difficultyCounts.EASY}/{difficultyCounts.MEDIUM}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">Easy / medium problems available</p>
                  </div>
                  <div className="rounded-[20px] border border-white/8 bg-[#121722] p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Advanced bank</p>
                    <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">{difficultyCounts.HARD}</p>
                    <p className="mt-2 text-sm text-slate-400">Hard problems in the catalog</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="Select a problem to preview it"
              description="Use the list on the left to inspect the next coding challenge before opening the full workspace."
            />
          )}
        </article>
      </section>
    </div>
  );
}
