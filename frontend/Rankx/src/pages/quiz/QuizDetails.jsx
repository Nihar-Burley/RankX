import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchQuizById } from "../../services/quizApi";

const QuizDetails = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    fetchQuizById(quizId)
      .then(res => setQuiz(res.data))
      .catch(console.error);
  }, [quizId]);

  if (!quiz) return <p className="text-white p-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex justify-center items-center">
      <div className="bg-[#0f172a] p-10 rounded-2xl max-w-xl">
        <h1 className="text-3xl font-bold mb-4">{quiz.title}</h1>

        <ul className="text-gray-400 space-y-2">
          <li>Total Questions: {quiz.totalQuestions}</li>
          <li>Time Limit: {quiz.durationMinutes} minutes</li>
          <li>Difficulty: {quiz.difficulty}</li>
        </ul>
    
        <button
          onClick={() => navigate(`/quiz/${quizId}/attempt`)}
          className="mt-8 w-full py-3 bg-green-600 rounded-xl"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizDetails;
