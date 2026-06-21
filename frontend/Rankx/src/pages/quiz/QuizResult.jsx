import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getResult } from "../../services/resultApi";
import { emitProgressUpdated } from "../../utils/progressSync";

const QuizResult = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const attemptId = params.get("attemptId");

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(attemptId));

  useEffect(() => {
    if (!attemptId) {
      return;
    }

    getResult(attemptId)
      .then((res) => {
        setResult(res.data);
        emitProgressUpdated({
          source: "quiz-result",
          attemptId,
          quizId: res.data?.quizId,
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load result");
        setLoading(false);
      });
  }, [attemptId]);

  if (!attemptId) {
    return (
      <div className="app-container py-8">
        <EmptyState
          title="Invalid attempt"
          description="We could not find a valid quiz attempt to show."
          action={<Button variant="secondary" onClick={() => navigate("/quiz")}>Back to quizzes</Button>}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container py-8">
        <LoadingState title="Calculating your result" description="Preparing score, percentage, and suggested next steps." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container py-8">
        <ErrorState
          title="Result unavailable"
          message={error}
          action={<Button variant="secondary" onClick={() => navigate("/quiz")}>Back to quizzes</Button>}
        />
      </div>
    );
  }

  const isPassed = result.percentage >= 40;

  return (
    <div className="app-container space-y-8 py-8">
      <PageHeader
        eyebrow="Quiz Result"
        title={isPassed ? "Nice work" : "Keep going"}
        description={
          isPassed
            ? "You completed this quiz with a passing score. Use the result to keep momentum going."
            : "You completed the quiz. Review the result, understand the gap, and try again when ready."
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/quiz")}>
              Attempt another quiz
            </Button>
            <Button onClick={() => navigate("/home")}>Go to dashboard</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Score" value={`${result.score}/${result.totalQuestions}`} detail="Correct answers out of total questions" tone="cyan" />
        <StatCard label="Percentage" value={`${result.percentage.toFixed(2)}%`} detail={isPassed ? "Passing result" : "Below the current pass threshold"} tone={isPassed ? "emerald" : "amber"} />
        <StatCard label="Next move" value={isPassed ? "Continue plan" : "Review and retry"} detail="Recommended action based on this result" tone="violet" />
        <StatCard label="Attempt ID" value={`#${attemptId}`} detail="Use this to open detailed review later" tone="amber" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Result summary</p>
          <p className="mt-3 text-5xl font-extrabold text-white">
            {result.score}
            <span className="text-2xl text-slate-400"> / {result.totalQuestions}</span>
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {isPassed
              ? "You cleared the current threshold. The best next step is to keep momentum by continuing your guided path or reviewing another concept area."
              : "Use this result as a checkpoint. Review the detailed attempt and take another quiz after reinforcing the weaker concepts."}
          </p>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Primary action</p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {isPassed ? "Continue your learning plan" : "Review this attempt in detail"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            {isPassed
              ? "Move back into your dashboard or progress flow while the momentum is still strong."
              : "Open the full review to understand which answers were missed before attempting another quiz."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => navigate(`/quiz/review/${attemptId}`)}>
              Open detailed review
            </Button>
            <Button variant="secondary" onClick={() => navigate("/my-progress")}>
              View progress
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizResult;
