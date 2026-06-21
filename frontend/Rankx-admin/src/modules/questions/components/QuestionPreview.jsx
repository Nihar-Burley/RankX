import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { getQuizById } from "../services/quizApi";
import { getQuestionsByQuiz } from "../../questions/services/questionApi";

const QuizPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const quizData = await getQuizById(id);
        const questionData = await getQuestionsByQuiz(id);
        setQuiz(quizData);
        setQuestions(questionData || []);
      } catch (err) {
        console.error("Failed to load quiz preview", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-400 flex items-center justify-center">
        Loading preview...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-8 py-10">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <FaArrowLeft />
        Back
      </button>

      <h1 className="text-3xl font-bold">{quiz.title}</h1>
      <p className="text-gray-400 mt-1">{quiz.description}</p>
      <p className="mt-2">Duration: {quiz.durationMinutes} mins</p>

      <div className="mt-8 space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold">
              Q{index + 1}. {q.questionText}
            </h3>

            <ul className="mt-3 space-y-1 text-gray-300">
              {q.options.map((opt, optionIndex) => (
                <li key={optionIndex}>
                  {String.fromCharCode(65 + optionIndex)}. {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizPreview;
