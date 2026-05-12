import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizReview from "./QuizReview";

const { navigateMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ attemptId: "attempt-1" }),
}));

vi.mock("../../services/resultApi", () => ({
  getResultReview: vi.fn(),
}));

vi.mock("../../utils/eventTracker", () => ({
  trackProductEvent: trackMock,
}));

const { getResultReview } = await import("../../services/resultApi");

describe("QuizReview", () => {
  beforeEach(() => {
    localStorage.setItem("token", "token");
    getResultReview.mockResolvedValue({
      data: {
        quizId: "quiz-1",
        quizTitle: "Java Basics Quiz",
        score: 7,
        totalQuestions: 10,
        percentage: 70,
        category: "Java",
        subCategory: "Collections",
        correctAnswers: 7,
        incorrectAnswers: 3,
        unansweredQuestions: 0,
        previousAttemptPercentage: 60,
        bestPreviousPercentage: 60,
        percentageDelta: 10,
        questions: [],
      },
    });
  });

  it("renders improvement guidance when score delta is positive", async () => {
    render(<QuizReview />);

    expect(await screen.findByText("Java Basics Quiz")).toBeInTheDocument();
    expect(screen.getByText("What this attempt tells you")).toBeInTheDocument();
    expect(screen.getByText(/improved on this quiz/i)).toBeInTheDocument();
  });
});
