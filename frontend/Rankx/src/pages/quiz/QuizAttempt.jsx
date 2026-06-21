import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Dialog from "../../components/ui/Dialog";
import { saveAnswer, startAttempt, submitAttempt } from "../../services/attemptApi";
import { getQuestionsByQuiz } from "../../services/questionApi";
import { trackProductEvent } from "../../utils/eventTracker";

const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const optionLabels = ["A", "B", "C", "D"];

const normalizeOptions = (options = []) =>
  shuffleArray(
    options.map((text, index) => ({
      key: optionLabels[index],
      text,
    }))
  );

const formatTime = (timeLeft) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const getQuestionTone = ({ isCurrent, isReview, answered }) => {
  if (isCurrent) {
    return "bg-sky-500 text-white ring-2 ring-sky-200/40";
  }

  if (isReview) {
    return "bg-violet-500/18 text-violet-100";
  }

  if (answered) {
    return "bg-emerald-500/18 text-emerald-100";
  }

  return "bg-slate-900/90 text-slate-400";
};

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const attemptStartedRef = useRef(false);

  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const unansweredCount = questions.length - Object.keys(answers).length;

  const handleFinalSubmit = useCallback(async () => {
    if (!attemptId) return;

    try {
      setSubmitting(true);
      await submitAttempt(attemptId);
      trackProductEvent({
        eventName: "QUIZ_ATTEMPT_SUBMITTED",
        eventCategory: "QUIZ",
        source: "WEB",
        track: "QUIZ",
        contentType: "QUIZ",
        contentId: `quiz-${quizId}`,
        contentTitle: `Quiz ${quizId}`,
        outcome: "SUBMITTED",
        numericValue: questions.length - unansweredCount,
        metadata: {
          unansweredCount,
          totalQuestions: questions.length,
        },
      });
      navigate(`/quiz/result?attemptId=${attemptId}`);
    } catch {
      setError("We could not submit your quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [attemptId, navigate, questions.length, quizId, unansweredCount]);

  useEffect(() => {
    if (!quizId || attemptStartedRef.current) {
      return;
    }
    attemptStartedRef.current = true;

    const init = async () => {
      try {
        const attemptRes = await startAttempt(quizId);
        setAttemptId(attemptRes.data);
        trackProductEvent(
          {
            eventName: "QUIZ_ATTEMPT_STARTED",
            eventCategory: "QUIZ",
            source: "WEB",
            track: "QUIZ",
            contentType: "QUIZ",
            contentId: `quiz-${quizId}`,
            contentTitle: `Quiz ${quizId}`,
          },
          { dedupeKey: `quiz-start-${quizId}` }
        );

        const questionRes = await getQuestionsByQuiz(quizId);
        const normalized = questionRes.data.map((question) => ({
          ...question,
          options: normalizeOptions(question.options),
        }));
        setQuestions(normalized);
      } catch {
        setError("We could not load this quiz attempt.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [quizId]);

  useEffect(() => {
    if (!attemptId) {
      return undefined;
    }

    const timer = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, handleFinalSubmit]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !showTabWarning) {
        setTabSwitchCount((count) => count + 1);
        setShowTabWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [showTabWarning]);

  const handleOptionSelect = async (option) => {
    const question = questions[current];
    if (!attemptId || !question || savingQuestionId === question.id || submitting) {
      return;
    }

    setAnswers((prev) => ({
      ...prev,
      [question.id]: { optionKey: option.key, optionText: option.text },
    }));

    try {
      setSavingQuestionId(question.id);
      await saveAnswer(attemptId, {
        questionId: question.id,
        selectedOption: option.key,
      });
      trackProductEvent({
        eventName: "QUIZ_QUESTION_ANSWERED",
        eventCategory: "QUIZ",
        source: "WEB",
        track: "QUIZ",
        contentType: "QUESTION",
        contentId: `question-${question.id}`,
        contentTitle: question.questionText,
        parentContentId: `quiz-${quizId}`,
        topic: `Question ${current + 1}`,
        outcome: "ANSWERED",
        metadata: {
          selectedOption: option.key,
        },
      });
    } catch {
      setError("We could not save your answer. Please try again.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  const toggleReview = () => {
    const questionId = questions[current].id;
    setReviewed((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (loading) {
    return (
      <div className="app-shell">
        <LoadingState
          title="Loading quiz session"
          description="Preparing your questions, timer, and attempt workspace."
        />
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="app-shell">
        <ErrorState
          title="Quiz attempt unavailable"
          message={error}
          action={
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/quiz")}>Back to quizzes</Button>
              <Button variant="secondary" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!questions.length || !questions[current]) {
    return null;
  }

  const question = questions[current];
  const selected = answers[question.id]?.optionText;
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(reviewed).filter(Boolean).length;

  return (
    <div className="app-shell">
      <div className="app-container space-y-6">
        <PageHeader
          eyebrow="Quiz Session"
          title="Stay focused and finish cleanly"
          description="Answer carefully, mark uncertain questions for review, and use the palette to keep the session easy to manage."
          actions={
            <>
              <Badge tone="brand">Attempt #{attemptId}</Badge>
              <Button
                variant="secondary"
                onClick={() => (unansweredCount > 0 ? setShowConfirm(true) : handleFinalSubmit())}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit attempt"}
              </Button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Time remaining" value={formatTime(timeLeft)} detail="Auto-submits when time runs out" tone="cyan" />
            <StatCard label="Answered" value={answeredCount} detail={`${questions.length} total questions`} tone="emerald" />
            <StatCard label="Pending" value={unansweredCount} detail="Questions still needing an answer" tone="amber" />
            <StatCard label="Marked for review" value={reviewCount} detail="Use this to revisit uncertain questions" tone="violet" />
          </div>
        </PageHeader>

        {error ? (
          <ErrorState
            title="We hit a save issue"
            message={error}
            action={
              <Button variant="secondary" onClick={() => setError("")}>
                Dismiss
              </Button>
            }
          />
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Question {current + 1} of {questions.length}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {question.questionText}
                </h2>
              </div>
              <Badge tone={reviewed[question.id] ? "warning" : "neutral"}>
                {reviewed[question.id] ? "Review later" : "In progress"}
              </Badge>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selected === option.text;
                return (
                  <button
                    key={`${question.id}-${option.key}-${option.text}`}
                    type="button"
                    onClick={() => handleOptionSelect(option)}
                    disabled={savingQuestionId === question.id || submitting}
                    className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-sky-300/35 bg-sky-400/12 shadow-[0_18px_34px_rgba(37,99,235,0.18)]"
                        : "border-white/10 bg-slate-950/55 hover:border-white/16 hover:bg-white/[0.04]"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    <div className="flex gap-4">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                          isSelected ? "bg-sky-500 text-white" : "bg-white/[0.06] text-slate-300"
                        }`}
                      >
                        {option.key || optionLabels[index]}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">{option.text}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {isSelected ? "Selected answer" : "Click to choose this option"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant={reviewed[question.id] ? "secondary" : "ghost"}
                onClick={toggleReview}
              >
                {reviewed[question.id] ? "Unmark review" : "Mark for review"}
              </Button>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setCurrent((value) => Math.max(0, value - 1))}
                  disabled={current === 0}
                >
                  Previous
                </Button>
                {current === questions.length - 1 ? (
                  <Button
                    variant="success"
                    onClick={() => (unansweredCount > 0 ? setShowConfirm(true) : handleFinalSubmit())}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Finish attempt"}
                  </Button>
                ) : (
                  <Button onClick={() => setCurrent((value) => value + 1)}>Next question</Button>
                )}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card variant="soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Question palette</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Blue is current, green is answered, violet is marked for review, and muted means still pending.
              </p>
              <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 xl:grid-cols-5">
                {questions.map((item, index) => {
                  const answered = Boolean(answers[item.id]);
                  const isReview = reviewed[item.id];
                  const isCurrent = index === current;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCurrent(index)}
                      className={`h-11 rounded-2xl text-sm font-semibold transition ${getQuestionTone({
                        isCurrent,
                        isReview,
                        answered,
                      })}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card variant="soft">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Session guidance</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-400">
                <p>Keep moving if you are unsure and use review markers to return later.</p>
                <p>Answers save as you select them, so the palette stays up to date during the session.</p>
                <p>Leaving the tab triggers a warning so the attempt remains controlled and trackable.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog
        open={showTabWarning}
        title="Tab switch detected"
        description="We noticed you left the quiz tab during an active attempt."
        onClose={() => setShowTabWarning(false)}
        actions={
          <Button onClick={() => setShowTabWarning(false)}>
            Continue exam
          </Button>
        }
      >
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100">
          Violations detected: <span className="font-semibold">{tabSwitchCount}</span>
        </div>
      </Dialog>

      <Dialog
        open={showConfirm}
        title="Submit with unanswered questions?"
        description="You can go back and finish them first, or submit now and let the attempt be evaluated as-is."
        onClose={() => setShowConfirm(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Go back
            </Button>
            <Button variant="danger" onClick={handleFinalSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit anyway"}
            </Button>
          </>
        }
      >
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-4 text-sm text-rose-100">
          You still have <span className="font-semibold">{unansweredCount}</span> unanswered question(s).
        </div>
      </Dialog>
    </div>
  );
}
