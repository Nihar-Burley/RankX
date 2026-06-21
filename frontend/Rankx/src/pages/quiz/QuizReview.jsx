import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
          localStorage.removeItem("token");
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

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100 md:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
              Quiz Review
            </p>
            <h1 className="mt-3 text-4xl font-bold">Attempt #{attemptId}</h1>
          </div>
          <button
            onClick={() => navigate("/quiz/history")}
            className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Back to History
          </button>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-slate-300">
            Loading quiz review...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-8 text-amber-200">
            {error}
          </div>
        ) : review ? (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Quiz</p>
                <p className="mt-2 text-2xl font-semibold">{review.quizTitle || `#${review.quizId}`}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Score</p>
                <p className="mt-2 text-2xl font-semibold">
                  {review.score}/{review.totalQuestions}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Percentage</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatPercentage(review.percentage)}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Topic</p>
                <p className="mt-2 text-2xl font-semibold">
                  {review.subCategory || review.category || "Quiz Practice"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Correct</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-300">
                  {review.correctAnswers}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Incorrect</p>
                <p className="mt-2 text-2xl font-semibold text-rose-300">
                  {review.incorrectAnswers}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Unanswered</p>
                <p className="mt-2 text-2xl font-semibold text-amber-300">
                  {review.unansweredQuestions}
                </p>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Previous Attempt</p>
                <p className="mt-2 text-2xl font-semibold">
                  {review.previousAttemptPercentage != null
                    ? formatPercentage(review.previousAttemptPercentage)
                    : "First attempt"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Best Previous</p>
                <p className="mt-2 text-2xl font-semibold">
                  {review.bestPreviousPercentage != null
                    ? formatPercentage(review.bestPreviousPercentage)
                    : "N/A"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                <p className="text-sm text-slate-400">Score Delta</p>
                <p className="mt-2 text-2xl font-semibold">
                  {review.percentageDelta != null
                    ? `${review.percentageDelta > 0 ? "+" : ""}${review.percentageDelta.toFixed(2)}%`
                    : "N/A"}
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">What this attempt tells you</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {review.percentageDelta != null && review.percentageDelta > 0
                  ? "You improved on this quiz compared with your most recent previous attempt. Use the incorrect answers below to lock in the gain."
                  : review.percentageDelta != null && review.percentageDelta < 0
                    ? "This attempt dropped against your previous result. Review the missed questions carefully before retaking the quiz."
                    : "Use the question review below to understand what you already know well and where recall is still shaky."}
              </p>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Question Review</h2>
              <div className="mt-5 space-y-3">
                {(review.questions || []).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-6 text-slate-400">
                    No question review is available for this attempt yet.
                  </div>
                ) : review.questions?.map((question, index) => (
                  <div
                    key={question.questionId}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">
                          Question {question.questionNumber ?? index + 1}
                        </p>
                        <p className="font-medium">Question ID: #{question.questionId}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          question.correct
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {question.correct ? "Correct" : "Incorrect"}
                      </span>
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
            </section>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-8 text-slate-400">
            Quiz review data is unavailable right now.
          </div>
        )}
      </div>
    </div>
  );
}
