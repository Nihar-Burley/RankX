import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const buttonTone = {
  current: "bg-indigo-600 scale-110",
  review: "bg-purple-600",
  answered: "bg-green-600",
  pending: "bg-gray-700",
};

const formatTime = (timeLeft) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const QuizAttempt = () => {
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
  const [error, setError] = useState(null);
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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading quiz...
      </div>
    );
  }

  if (error && !questions.length) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  if (!questions.length || !questions[current]) {
    return null;
  }

  const question = questions[current];
  const selected = answers[question.id]?.optionText;

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#020617,#0f172a)] px-4 py-8 text-white">
      {showTabWarning ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="max-w-sm rounded-3xl bg-[#0f172a] p-6 text-center">
            <h3 className="text-lg font-semibold">Tab switch detected</h3>
            <p className="mt-3 text-gray-300">
              Violations: <span className="font-bold text-red-400">{tabSwitchCount}</span>
            </p>
            <button type="button" onClick={() => setShowTabWarning(false)} className="mt-5 rounded-xl bg-indigo-600 px-6 py-2">
              Continue exam
            </button>
          </div>
        </div>
      ) : null}

      {showConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="max-w-md rounded-3xl bg-[#0f172a] p-6 text-center">
            <h3 className="text-xl font-semibold">Unanswered questions</h3>
            <p className="mt-3 text-gray-300">
              You still have <span className="font-bold text-red-400">{unansweredCount}</span> unanswered question(s).
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button type="button" onClick={() => setShowConfirm(false)} className="rounded-xl bg-gray-700 px-6 py-2">
                Go back
              </button>
              <button type="button" onClick={handleFinalSubmit} disabled={submitting} className="rounded-xl bg-red-600 px-6 py-2 disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit anyway"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-[#0f172a]/92 p-6 shadow-2xl">
        {error ? (
          <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        ) : null}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-300">Quiz session</p>
            <h1 className="mt-3 text-3xl font-semibold">Stay focused and finish cleanly</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Answer carefully, mark uncertain questions for review, and use the palette to see what is done versus what still needs attention.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Time remaining</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatTime(timeLeft)}</p>
          </div>
        </div>

        <div className="mb-4 flex justify-center gap-4 text-xs text-gray-300">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-indigo-600" /> Current
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-green-600" /> Answered
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-purple-600" /> Review
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-gray-700" /> Pending
          </span>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {questions.map((item, index) => {
            const answered = Boolean(answers[item.id]);
            const isReview = reviewed[item.id];
            const isCurrent = index === current;
            const tone = isCurrent
              ? buttonTone.current
              : isReview
                ? buttonTone.review
                : answered
                  ? buttonTone.answered
                  : buttonTone.pending;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrent(index)}
                className={`h-10 w-10 rounded-full font-semibold transition ${tone}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex justify-between">
          <span className="text-gray-400">
            Question {current + 1} / {questions.length}
          </span>
          <span className="rounded-full bg-slate-800 px-4 py-1 text-sm text-slate-200">
            {unansweredCount} unanswered
          </span>
        </div>

        <h2 className="mb-6 text-xl font-semibold">{question.questionText}</h2>

        <div className="mb-6 space-y-4">
          {question.options.map((option, index) => (
            <button
              key={`${question.id}-${option.key}-${option.text}`}
              type="button"
              onClick={() => handleOptionSelect(option)}
              disabled={savingQuestionId === question.id || submitting}
              className={`flex w-full gap-4 rounded-2xl p-4 text-left transition ${
                selected === option.text ? "bg-indigo-600" : "bg-[#020617] hover:bg-indigo-700"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 font-bold">
                {option.key || optionLabels[index]}
              </div>
              <span>{option.text}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleReview}
            className={`rounded-xl px-4 py-2 ${reviewed[question.id] ? "bg-purple-600" : "bg-gray-700"}`}
          >
            {reviewed[question.id] ? "Unmark review" : "Mark for review"}
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setCurrent((value) => Math.max(0, value - 1))}
              disabled={current === 0}
              className="rounded-xl bg-gray-700 px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>

            {current === questions.length - 1 ? (
              <button
                type="button"
                onClick={() => (unansweredCount > 0 ? setShowConfirm(true) : handleFinalSubmit())}
                disabled={submitting}
                className="rounded-xl bg-green-600 px-6 py-2 font-semibold disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button type="button" onClick={() => setCurrent((value) => value + 1)} className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold">
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
