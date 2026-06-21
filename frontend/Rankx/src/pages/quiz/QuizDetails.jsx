import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import { fetchQuizById } from "../../services/quizApi";

const QuizDetails = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchQuizById(quizId)
      .then((res) => {
        setQuiz(res.data);
        setError("");
      })
      .catch(() => {
        setError("We could not load this quiz right now.");
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) {
    return (
      <div className="app-container">
        <LoadingState title="Loading quiz details" description="Preparing the quiz overview before you begin." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <ErrorState
          title="Quiz details are unavailable"
          message={error}
          action={
            <button type="button" onClick={() => navigate("/quiz")} className="btn-secondary">
              Back to quizzes
            </button>
          }
        />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="app-container">
        <EmptyState
          title="Quiz not found"
          description="This quiz may have been removed or is no longer available."
          action={
            <button type="button" onClick={() => navigate("/quiz")} className="btn-secondary">
              Return to quiz catalog
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="app-container space-y-8">
      <PageHeader
        eyebrow="Quiz Overview"
        title={quiz.title}
        description={quiz.description || "Review the scope, difficulty, and timing so you know exactly what this session asks from you before you start."}
        actions={
          <>
            <button type="button" onClick={() => navigate("/quiz")} className="btn-secondary">
              Back to quizzes
            </button>
            <button type="button" onClick={() => navigate(`/quiz/${quizId}/attempt`)} className="btn-primary">
              Start quiz
            </button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Questions" value={quiz.totalQuestions || 0} detail="Items included in this attempt" tone="cyan" />
          <StatCard label="Time limit" value={`${quiz.durationMinutes || 0} min`} detail="Session duration before auto-submit" tone="amber" />
          <StatCard label="Difficulty" value={quiz.difficulty || "Mixed"} detail="Overall challenge level for this quiz" tone="violet" />
        </div>
      </PageHeader>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card">
          <h2 className="section-title">What to expect</h2>
          <p className="section-copy mt-2">
            Use this quiz when you want a structured concept check with a clear finish line. Start when you can give it focused attention from beginning to end.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recommended use</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Best for validating knowledge after a study session or before moving to a harder plan item.
              </p>
            </div>
            <div className="surface-card-soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Before you begin</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Make sure you have enough uninterrupted time to complete the full timed attempt in one sitting.
              </p>
            </div>
          </div>
        </div>

        <aside className="surface-card">
          <h2 className="section-title">Next step</h2>
          <p className="section-copy mt-2">
            Start this quiz now if you want a focused checkpoint, or return to the catalog to compare other options first.
          </p>
          <div className="mt-6 space-y-3">
            <button type="button" onClick={() => navigate(`/quiz/${quizId}/attempt`)} className="btn-primary w-full">
              Start quiz now
            </button>
            <button type="button" onClick={() => navigate("/quiz/history")} className="btn-secondary w-full">
              Review quiz history
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default QuizDetails;
