import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <div className="surface-card w-full max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-white">Invalid attempt</h1>
          <p className="mt-3 text-sm text-slate-400">We could not find a valid quiz attempt to show.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-white text-xl animate-pulse">Calculating your result...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <div className="surface-card w-full max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-white">Result unavailable</h1>
          <p className="mt-3 text-sm text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const isPassed = result.percentage >= 40;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex justify-center items-center px-4">
      <div className="w-full max-w-xl bg-[#0f172a] rounded-3xl p-10 shadow-2xl text-center">
        <div className="mb-4 text-xs uppercase tracking-[0.22em] text-slate-500">Quiz result</div>

        <h1 className="text-3xl font-bold mb-2">
          {isPassed ? "Nice work" : "Keep going"}
        </h1>

        <p className="mb-8 text-slate-400">
          {isPassed
            ? "You completed this quiz with a passing score."
            : "You completed the quiz. Review the result and try another attempt when ready."}
        </p>

        <div className="bg-[#020617] rounded-2xl py-6 mb-6">
          <p className="text-slate-400 text-sm mb-1">Your score</p>
          <p className="text-5xl font-extrabold text-indigo-400">
            {result.score}
            <span className="text-2xl text-slate-400"> / {result.totalQuestions}</span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="text-sm text-slate-400">Percentage</p>
            <p className={`mt-2 text-2xl font-semibold ${isPassed ? "text-green-400" : "text-red-400"}`}>
              {result.percentage.toFixed(2)}%
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4">
            <p className="text-sm text-slate-400">Next best move</p>
            <p className="mt-2 text-base font-medium text-white">
              {isPassed ? "Continue your dashboard plan" : "Review and attempt another quiz"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-lg font-medium"
          >
            Go to dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/quiz")}
            className="w-full py-3 rounded-xl border border-slate-600 hover:bg-slate-800 transition text-lg"
          >
            Attempt another quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
