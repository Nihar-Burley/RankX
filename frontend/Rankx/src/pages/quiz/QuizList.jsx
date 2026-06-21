import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/ui/Button";
import { fetchQuizzes } from "../../services/quizApi";

const difficultyTone = {
  EASY: "border-emerald-500/20 bg-emerald-500/12 text-emerald-300",
  MEDIUM: "border-amber-500/20 bg-amber-500/12 text-amber-300",
  HARD: "border-rose-500/20 bg-rose-500/12 text-rose-300",
};

const accentPalette = [
  "from-[#ff8a26] to-[#ff6938]",
  "from-[#37b3ff] to-[#7a6fff]",
  "from-[#2dd4bf] to-[#22c55e]",
  "from-[#8b5cf6] to-[#ec4899]",
  "from-[#f97316] to-[#facc15]",
  "from-[#06b6d4] to-[#3b82f6]",
];

function QuizGlyph() {
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
      <rect x="4.5" y="5" width="15" height="14" rx="2.5" />
      <path d="M8 10h3M8 13h6M8 16h3" />
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
          ? "border-[#6f63ff] bg-[#6f63ff] text-white shadow-[0_10px_24px_rgba(111,99,255,0.24)]"
          : "border-white/10 bg-transparent text-slate-400 hover:border-white/16 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function formatLabel(value, fallback) {
  if (!value) {
    return fallback;
  }
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function difficultyCount(quizzes, target) {
  return quizzes.filter((quiz) => quiz.difficulty === target).length;
}

export default function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuizzes()
      .then((response) => {
        const items = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.content)
            ? response.data.content
            : [];
        setQuizzes(items);
      })
      .catch(() => {
        setError("We could not load the quiz catalog right now.");
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const values = new Set();
    quizzes.forEach((quiz) => {
      if (quiz.category) {
        values.add(quiz.category);
      }
    });
    return Array.from(values).slice(0, 8);
  }, [quizzes]);

  const filteredQuizzes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      const matchesSearch =
        !normalizedSearch ||
        quiz.title.toLowerCase().includes(normalizedSearch) ||
        (quiz.description || "").toLowerCase().includes(normalizedSearch) ||
        (quiz.category || "").toLowerCase().includes(normalizedSearch) ||
        (quiz.subCategory || "").toLowerCase().includes(normalizedSearch);
      const matchesDifficulty = difficulty === "ALL" || quiz.difficulty === difficulty;
      const matchesCategory = selectedCategory === "ALL" || quiz.category === selectedCategory;
      const matchesStatus = status === "ALL" || quiz.status === status;
      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    });
  }, [difficulty, quizzes, search, selectedCategory, status]);

  const totalDuration = quizzes.reduce((sum, quiz) => sum + (quiz.durationMinutes || 0), 0);
  const averageDuration = quizzes.length ? Math.round(totalDuration / quizzes.length) : 0;

  if (loading) {
    return <LoadingState title="Loading quizzes" description="Preparing the quiz catalog and session options." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Quiz catalog is unavailable right now"
        message={error}
        action={
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        }
      />
    );
  }

  if (!filteredQuizzes.length) {
    return (
      <EmptyState
        title="No quizzes match these filters"
        description="Broaden the search or switch the category and difficulty to reveal more quiz options."
        action={
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearch("");
              setDifficulty("ALL");
              setSelectedCategory("ALL");
              setStatus("ALL");
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
        <div className="max-w-[820px]">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#7d88a0]">Quiz assessment</p>
          <h1 className="mt-4 text-[2.8rem] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-[3.45rem]">
            Quiz assessment that stays clear under pressure
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Compare difficulty, duration, and topic coverage in one place, then move into the right timed session
            without extra friction.
          </p>
        </div>

        <div className="inline-flex flex-wrap gap-2 rounded-[20px] border border-white/8 bg-[#171b25] p-2 shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
          <span className="rounded-2xl border border-white/10 bg-[#111520] px-4 py-2 text-sm font-semibold text-white">
            Browse Quizzes
          </span>
          <button
            type="button"
            onClick={() => navigate("/quiz/history")}
            className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-300"
          >
            Answer Review
          </button>
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="rounded-2xl px-4 py-2 text-sm font-medium text-slate-500 transition hover:text-slate-300"
          >
            Back to Dashboard
          </button>
        </div>

        <section className="overflow-hidden rounded-[24px] border border-white/8 bg-[#171b25] shadow-[0_20px_52px_rgba(0,0,0,0.18)]">
          <div className="border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="text-[#8c82ff]">
                <QuizGlyph />
              </span>
              Filter quizzes
            </div>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
              <label className="relative block">
                <span className="sr-only">Search quizzes</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search quizzes or tags..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#10141d] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#6f63ff] focus:ring-4 focus:ring-[#6f63ff]/12"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Difficulty</span>
                {["ALL", "EASY", "MEDIUM", "HARD"].map((level) => (
                  <FilterChip key={level} active={difficulty === level} onClick={() => setDifficulty(level)}>
                    {level === "ALL" ? "All" : formatLabel(level, level)}
                  </FilterChip>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</span>
                {["ALL", "PUBLISHED", "DRAFT"].map((value) => (
                  <FilterChip key={value} active={status === value} onClick={() => setStatus(value)}>
                    {value === "ALL" ? "All" : formatLabel(value, value)}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div className="border-t border-white/8 pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Category</span>
                <FilterChip active={selectedCategory === "ALL"} onClick={() => setSelectedCategory("ALL")}>
                  All
                </FilterChip>
                {categories.map((category) => (
                  <FilterChip
                    key={category}
                    active={selectedCategory === category}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {formatLabel(category, category)}
                  </FilterChip>
                ))}
              </div>
            </div>
          </div>
        </section>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Showing {filteredQuizzes.length} of {quizzes.length} quizzes
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                {difficultyCount(quizzes, "EASY")} easy
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                {difficultyCount(quizzes, "MEDIUM")} medium
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                {difficultyCount(quizzes, "HARD")} hard
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                avg {averageDuration} min
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredQuizzes.map((quiz, index) => {
            const accent = accentPalette[index % accentPalette.length];
            return (
              <article
                key={quiz.id}
                className="overflow-hidden rounded-[24px] border border-white/8 bg-[#171b25] shadow-[0_20px_48px_rgba(0,0,0,0.16)]"
              >
                <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
                <div className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">{quiz.title}</h2>
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {quiz.description || "Timed assessment with a focused question set and clear scoring feedback."}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                        difficultyTone[quiz.difficulty] || "border-white/10 bg-white/[0.04] text-slate-300"
                      }`}
                    >
                      {formatLabel(quiz.difficulty, "Mixed")}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-sky-500/20 bg-sky-500/12 px-2.5 py-1 text-[11px] text-sky-300">
                      {formatLabel(quiz.category, "General")}
                    </span>
                    {quiz.subCategory ? (
                      <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">
                        {formatLabel(quiz.subCategory, quiz.subCategory)}
                      </span>
                    ) : null}
                    <span className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-400">
                      {formatLabel(quiz.status, "Published")}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400">
                    <div className="rounded-[18px] border border-white/8 bg-[#121722] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Duration</p>
                      <p className="mt-2 text-base font-semibold text-white">{quiz.durationMinutes || 0} min</p>
                    </div>
                    <div className="rounded-[18px] border border-white/8 bg-[#121722] px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Format</p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {quiz.subCategory ? formatLabel(quiz.subCategory, "Standard") : "Standard"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button type="button" className="w-full" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                      Start Quiz
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
