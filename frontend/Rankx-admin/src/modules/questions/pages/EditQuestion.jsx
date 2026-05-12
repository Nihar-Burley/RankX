import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import QuestionForm from "../components/QuestionForm";
import { getQuestionsByQuiz, updateQuestion } from "../services/questionApi";

const EditQuestion = () => {
  const { quizId, questionId } = useParams();
  const navigate = useNavigate();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadQuestion = async () => {
      try {
        setLoading(true);
        const questions = await getQuestionsByQuiz(quizId);
        const question = questions.find((q) => q.id === questionId);

        if (!question) {
          navigate(-1);
          return;
        }

        setInitialData({
          questionText: question.questionText,
          optionA: question.options[0] || "",
          optionB: question.options[1] || "",
          optionC: question.options[2] || "",
          optionD: question.options[3] || "",
          correctOption: question.correctOption,
        });
      } catch (err) {
        console.error("Failed to load question", err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestion();
  }, [navigate, questionId, quizId]);

  const handleUpdate = async (formData) => {
    try {
      setSubmitting(true);

      const payload = {
        quizId,
        questionText: formData.questionText,
        optionA: formData.optionA,
        optionB: formData.optionB,
        optionC: formData.optionC,
        optionD: formData.optionD,
        correctOption: formData.correctOption,
      };

      await updateQuestion(questionId, payload);
      navigate(`/quizzes/${quizId}/questions`);
    } catch (err) {
      console.error("Failed to update question", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-400 flex items-center justify-center">
        Loading question...
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

        <h1 className="text-3xl font-bold">Edit Question</h1>
      </div>

      <QuestionForm
        key={questionId}
        initialData={initialData}
        onSubmit={handleUpdate}
        submitting={submitting}
      />
    </div>
  );
};

export default EditQuestion;
