import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchQuizzes } from "../../services/quizApi";

const difficultyStyles = {
  EASY: "status-easy",
  MEDIUM: "status-medium",
  HARD: "status-hard",
};

const QuizList = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes()
      .then((res) => {
        setQuizzes(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch quizzes:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-shell">
      <div className="app-container space-y-6">
        <header className="page-header">
          <p className="eyebrow">Quiz Practice</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Available quizzes
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Pick a quiz, review its scope, and start a timed session in a more
            polished and easier-to-scan catalog.
          </p>
        </header>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="surface-card animate-pulse">
                <div className="h-6 w-2/3 rounded-full bg-white/8" />
                <div className="mt-4 h-4 w-full rounded-full bg-white/8" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-white/8" />
                <div className="mt-6 h-10 rounded-2xl bg-white/8" />
              </div>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="surface-card">
            <div className="empty-state">
              <p className="text-base font-medium text-white">No quizzes available</p>
              <p className="mt-2 text-sm text-slate-400">
                Quizzes will appear here as soon as they are published.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {quizzes.map((quiz) => (
              <article key={quiz.id} className="surface-card flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{quiz.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {quiz.description}
                    </p>
                  </div>
                  <span
                    className={`badge ${difficultyStyles[quiz.difficulty] || "badge-neutral"}`}
                  >
                    {quiz.difficulty}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-400">
                  <div className="surface-card-soft">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Duration
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {quiz.durationMinutes} mins
                    </p>
                  </div>
                  <div className="surface-card-soft">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Questions
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {quiz.totalQuestions}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="btn-primary mt-6 w-full"
                >
                  View details
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;
