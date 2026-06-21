import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaPlusCircle, FaArrowLeft, FaTrash, FaEdit } from "react-icons/fa";
import { getQuizById } from "../../quizzes/services/quizApi";
import { deleteQuestion, getQuestionsByQuiz } from "../services/questionApi";

const ManageQuestions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const quizData = await getQuizById(quizId);
        const questionData = await getQuestionsByQuiz(quizId);
        setQuiz(quizData);
        setQuestions(Array.isArray(questionData) ? questionData : []);
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId]);

  const handleDelete = async (questionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (err) {
      console.error("Failed to delete question", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-400 flex items-center justify-center">
        Loading questions...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Questions</h1>
          <p className="text-gray-400 mt-1">
            Quiz: <span className="font-semibold">{quiz?.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            <FaArrowLeft />
            Back
          </button>

          <button
            type="button"
            onClick={() => navigate(`/quizzes/${quizId}/questions/create`)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 rounded-lg font-semibold"
          >
            <FaPlusCircle />
            Add Question
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-400">
          Total Questions: <span className="font-semibold text-white">{questions.length}</span>
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          <p className="text-lg font-medium">No questions added yet</p>
          <p className="text-sm mt-1">Click “Add Question” to start building this quiz</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    Q{index + 1}. {question.questionText}
                  </h3>

                  <ul className="mt-3 space-y-1 text-gray-300">
                    {question.options.map((opt, optionIndex) => (
                      <li key={optionIndex} className="text-sm">
                        {String.fromCharCode(65 + optionIndex)}. {opt}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/quizzes/${quizId}/questions/${question.id}/edit`)}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                    title="Edit Question"
                  >
                    <FaEdit />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(question.id)}
                    className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                    title="Delete Question"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
