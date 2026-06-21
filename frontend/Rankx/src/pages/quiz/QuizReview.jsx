import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { logoutUser } from "../../services/authService";
import { getResultReview } from "../../services/resultApi";
import { trackProductEvent } from "../../utils/eventTracker";

const formatPercentage = (value) => `${Number(value || 0).toFixed(2)}%`;

export default function QuizReview() {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadReview = async () => {
      try {
        const response = await getResultReview(attemptId);
        setReview(response.data);
        trackProductEvent(
          {
            eventName: "QUIZ_REVIEW_VIEWED",
            eventCategory: "QUIZ",
            source: "WEB",
            track: "QUIZ",
            contentType: "QUIZ_REVIEW",
            contentId: `attempt-${attemptId}`,
            contentTitle: response.data?.quizTitle || `Quiz Review ${attemptId}`,
            parentContentId: response.data?.quizId ? `quiz-${response.data.quizId}` : undefined,
            topic: response.data?.subCategory || response.data?.category,
            numericValue: response.data?.percentage || 0,
          },
          { oncePerSessionKey: `quiz-review-${attemptId}` }
        );
        setError("");
      } catch (err) {
        if (err.response?.status === 401) {
          logoutUser();
          navigate("/login");
          return;
        }

        setError("We could not load this quiz review.");
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="app-container py-8">
        <LoadingState title="Loading quiz review" description="Preparing score breakdown, trends, and question-level review." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container py-8">
        <ErrorState
          title="Quiz review is unavailable"
          message={error}
          action={<Button variant="secondary" onClick={() => navigate("/quiz/history")}>Back to history</Button>}
        />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="app-container py-8">
        <EmptyState
          title="Quiz review data is unavailable"
          description="This attempt may no longer have detailed review data attached."
          action={<Button variant="secondary" onClick={() => navigate("/quiz/history")}>Back to history</Button>}
        />
      </div>
    );
  }

  return (
    <div className="app-container space-y-8 py-8">
      <PageHeader
        eyebrow="Quiz Review"
        title={`Attempt #${attemptId}`}
        description="Understand how this attempt performed, how it compares with earlier results, and which question choices need attention next."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/quiz/history")}>
              Back to history
            </Button>
            <Button onClick={() => navigate("/quiz")}>
              Attempt another quiz
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">{review.quizTitle || `Quiz #${review.quizId}`}</Badge>
          <Badge tone="neutral">{review.subCategory || review.category || "Quiz Practice"}</Badge>
        </div>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Score" value={`${review.score}/${review.totalQuestions}`} detail="Correct answers across the full quiz" tone="cyan" />
        <StatCard label="Percentage" value={formatPercentage(review.percentage)} detail="Overall outcome for this attempt" tone="emerald" />
        <StatCard label="Correct" value={review.correctAnswers} detail="Questions answered correctly" tone="violet" />
        <StatCard label="Incorrect" value={review.incorrectAnswers} detail="Questions that need follow-up review" tone="amber" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Topic" value={review.subCategory || review.category || "Quiz Practice"} detail="Primary concept area attached to this quiz" tone="cyan" />
        <StatCard label="Unanswered" value={review.unansweredQuestions} detail="Questions left without a final answer" tone="amber" />
        <StatCard label="Previous attempt" value={review.previousAttemptPercentage != null ? formatPercentage(review.previousAttemptPercentage) : "First attempt"} detail="Most recent earlier result on this quiz" tone="violet" />
        <StatCard label="Score delta" value={review.percentageDelta != null ? `${review.percentageDelta > 0 ? "+" : ""}${review.percentageDelta.toFixed(2)}%` : "N/A"} detail="Change from your previous result" tone={review.percentageDelta > 0 ? "emerald" : "amber"} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <h2 className="text-xl font-semibold text-white">What this attempt tells you</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {review.percentageDelta != null && review.percentageDelta > 0
              ? "You improved on this quiz compared with your most recent previous attempt. Use the incorrect answers below to lock in the gain."
              : review.percentageDelta != null && review.percentageDelta < 0
                ? "This attempt dropped against your previous result. Review the missed questions carefully before retaking the quiz."
                : "Use the question review below to understand what you already know well and where recall is still shaky."}
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-white">Primary next step</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {review.incorrectAnswers > 0
              ? "Open the missed questions below, note the wrong selections, and retake another quiz when the weak area feels clearer."
              : "You handled this attempt well. The best next step is usually another quiz or a return to your guided study plan while momentum is high."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => navigate("/quiz")}>Browse more quizzes</Button>
            <Button variant="secondary" onClick={() => navigate("/my-progress")}>View progress</Button>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-white">Question review</h2>
        <div className="mt-5 space-y-3">
          {(review.questions || []).length === 0 ? (
            <EmptyState
              title="No question review is available yet"
              description="This attempt does not currently include question-level review data."
            />
          ) : review.questions.map((question, index) => (
            <div
              key={question.questionId}
              className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">
                    Question {question.questionNumber ?? index + 1}
                  </p>
                  <p className="font-medium text-white">Question ID: #{question.questionId}</p>
                </div>
                <Badge tone={question.correct ? "success" : "danger"}>
                  {question.correct ? "Correct" : "Incorrect"}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                <p>
                  <span className="text-slate-500">Selected:</span>{" "}
                  {question.selectedOption || "Not answered"}
                </p>
                <p>
                  <span className="text-slate-500">Correct:</span>{" "}
                  {question.correctOption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
