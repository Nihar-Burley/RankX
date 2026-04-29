import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuestionsByQuiz } from "../../services/questionApi";
import {
  startAttempt,
  saveAnswer,
  submitAttempt
} from "../../services/attemptApi";

/* ---------- Utils ---------- */
const shuffleArray = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const optionLabels = ["A", "B", "C", "D"];

const normalizeOptions = (options = []) =>
  shuffleArray(options).map((text, index) => ({
    key: optionLabels[index],
    text
  }));

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

  /* ---- Modals ---- */
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (!quizId || attemptStartedRef.current) return;
    attemptStartedRef.current = true;

    const init = async () => {
      try {
        const attemptRes = await startAttempt(quizId);
        setAttemptId(attemptRes.data);

        const questionRes = await getQuestionsByQuiz(quizId);
        const normalized = questionRes.data.map(q => ({
          ...q,
          options: normalizeOptions(q.options)
        }));

        setQuestions(normalized);
      } catch (err) {
        setError("Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [quizId]);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!attemptId) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId]);

  /* -------- TAB SWITCH DETECTION -------- */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !showTabWarning) {
        setTabSwitchCount(c => c + 1);
        setShowTabWarning(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [showTabWarning]);

  /* ---------------- HELPERS ---------------- */
  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOptionSelect = async (option) => {
    const question = questions[current];
    if (!attemptId || !question) return;

    setAnswers(prev => ({
      ...prev,
      [question.id]: { optionKey: option.key, optionText: option.text }
    }));

    try {
      await saveAnswer(attemptId, {
        questionId: question.id,
        selectedOption: option.key
      });
    } catch (err) {
      console.error("Save answer failed", err);
    }
  };

  const toggleReview = () => {
    const qid = questions[current].id;
    setReviewed(prev => ({
      ...prev,
      [qid]: !prev[qid]
    }));
  };

  const handleFinalSubmit = async () => {
    try {
      await submitAttempt(attemptId);
      navigate(`/quiz/result?attemptId=${attemptId}`);
    } catch {
      alert("Failed to submit quiz");
    }
  };

  const unansweredCount =
    questions.length - Object.keys(answers).length;

  /* ---------------- GUARDS ---------------- */
  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading quiz…
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-red-400">
        {error}
      </div>
    );

  if (!questions.length || !questions[current]) return null;

  const question = questions[current];
  const selected = answers[question.id]?.optionText;

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] to-[#0f172a] text-white px-4 py-8">

      {/* -------- TAB WARNING -------- */}
      {showTabWarning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] p-6 rounded-2xl text-center max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              Tab Switch Detected
            </h3>
            <p className="text-gray-300 mb-4">
              Violations:{" "}
              <span className="text-red-400 font-bold">
                {tabSwitchCount}
              </span>
            </p>
            <button
              onClick={() => setShowTabWarning(false)}
              className="px-6 py-2 bg-indigo-600 rounded-xl"
            >
              Continue Exam
            </button>
          </div>
        </div>
      )}

      {/* -------- SUBMIT CONFIRM -------- */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] p-6 rounded-2xl text-center max-w-md">
            <h3 className="text-xl font-semibold mb-3">
              Unanswered Questions
            </h3>
            <p className="text-gray-300 mb-6">
              You still have{" "}
              <span className="text-red-400 font-bold">
                {unansweredCount}
              </span>{" "}
              unanswered question(s).
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-6 py-2 bg-gray-700 rounded-xl"
              >
                Go Back
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-2 bg-red-600 rounded-xl"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------- MAIN CARD -------- */}
      <div className="max-w-4xl mx-auto bg-[#0f172a]/90 rounded-3xl p-6 shadow-2xl">

        {/* -------- LEGEND -------- */}
        <div className="flex justify-center gap-4 text-xs text-gray-300 mb-4">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-indigo-600" /> Current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-600" /> Answered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-purple-600" /> Review
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-700" /> Pending
          </span>
        </div>

        {/* -------- QUESTION PALETTE -------- */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {questions.map((q, i) => {
            const answered = !!answers[q.id];
            const isReview = reviewed[q.id];
            const isCurrent = i === current;

            return (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className={`w-10 h-10 rounded-full font-semibold transition
                  ${
                    isCurrent
                      ? "bg-indigo-600 scale-110"
                      : isReview
                      ? "bg-purple-600"
                      : answered
                      ? "bg-green-600"
                      : "bg-gray-700"
                  }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* -------- HEADER -------- */}
        <div className="flex justify-between mb-4">
          <span className="text-gray-400">
            Question {current + 1} / {questions.length}
          </span>
          <span className="bg-red-600 px-4 py-1 rounded-full">
            ⏳ {formatTime()}
          </span>
        </div>

        {/* -------- QUESTION -------- */}
        <h2 className="text-xl font-semibold mb-6">
          {question.questionText}
        </h2>

        {/* -------- OPTIONS -------- */}
        <div className="space-y-4 mb-6">
          {question.options.map((opt, idx) => (
            <button
              key={`${question.id}-${opt.key}-${opt.text}`}
              onClick={() => handleOptionSelect(opt)}
              className={`w-full p-4 rounded-xl flex gap-4 transition
                ${
                  selected === opt.text
                    ? "bg-indigo-600"
                    : "bg-[#020617] hover:bg-indigo-700"
                }`}
            >
              <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center font-bold">
                {opt.key || optionLabels[idx]}
              </div>
              {opt.text}
            </button>
          ))}
        </div>

        {/* -------- ACTIONS -------- */}
        <div className="flex justify-between items-center">
          <button
            onClick={toggleReview}
            className={`px-4 py-2 rounded-xl
              ${
                reviewed[question.id]
                  ? "bg-purple-600"
                  : "bg-gray-700"
              }`}
          >
            {reviewed[question.id]
              ? "Unmark Review"
              : "Mark for Review"}
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-4 py-2 bg-gray-700 rounded-xl disabled:opacity-40"
            >
              Previous
            </button>

            {current === questions.length - 1 ? (
              <button
                onClick={() =>
                  unansweredCount > 0
                    ? setShowConfirm(true)
                    : handleFinalSubmit()
                }
                className="px-6 py-2 bg-green-600 rounded-xl font-semibold"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={() => setCurrent(c => c + 1)}
                className="px-4 py-2 bg-indigo-600 rounded-xl font-semibold"
              >
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
