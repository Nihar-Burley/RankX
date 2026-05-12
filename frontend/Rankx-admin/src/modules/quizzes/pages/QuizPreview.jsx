import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import { getQuestionsByQuiz } from "../../questions/services/questionApi";
import { getQuizById } from "../services/quizApi";

const QuizPreview = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [quizRes, questionRes] = await Promise.allSettled([
          getQuizById(quizId),
          getQuestionsByQuiz(quizId),
        ]);

        if (quizRes.status === "fulfilled") {
          setQuiz(quizRes.value);
        }

        if (questionRes.status === "fulfilled") {
          setQuestions(Array.isArray(questionRes.value) ? questionRes.value : []);
        }
      } catch (err) {
        console.error("Failed to load quiz preview", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-400 flex items-center justify-center">
        Loading preview...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-8 py-10">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <FaArrowLeft />
          Back
        </button>

        <h1 className="text-3xl font-bold">Quiz Preview</h1>
      </div>

      {quiz ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
          <p className="text-gray-400 mb-4">{quiz.description}</p>

          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span>{quiz.durationMinutes} min</span>
            <span>{quiz.category}</span>
            <span>{quiz.subCategory}</span>
            <span>{quiz.difficulty}</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                quiz.status === "PUBLISHED"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {quiz.status}
            </span>
          </div>
        </div>
      ) : null}

      {questions.length === 0 ? (
        <p className="text-gray-400">No questions added yet.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <p className="font-semibold mb-4">
                {index + 1}. {q.questionText}
              </p>

              <ul className="space-y-2">
                {q.options.map((opt, optionIndex) => {
                  const optionKey = ["A", "B", "C", "D"][optionIndex];
                  const isCorrect = optionKey === q.correctOption;

                  return (
                    <li
                      key={optionIndex}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        isCorrect ? "bg-green-600/20 border border-green-500" : "bg-gray-800"
                      }`}
                    >
                      <span>
                        {optionKey}. {opt}
                      </span>
                      {isCorrect ? <FaCheckCircle className="text-green-400" /> : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPreview;
