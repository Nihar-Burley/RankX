import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuizList from "./QuizList";

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../../services/quizApi", () => ({
  fetchQuizzes: vi.fn(),
}));

const { fetchQuizzes } = await import("../../services/quizApi");

describe("QuizList", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    fetchQuizzes.mockResolvedValue({
      data: [
        {
          id: "quiz-101",
          title: "React Fundamentals",
          description: "Timed frontend assessment.",
          durationMinutes: 20,
          difficulty: "EASY",
          category: "FRONTEND",
          subCategory: "MCQ",
          status: "PUBLISHED",
        },
      ],
    });
  });

  it("renders the quiz grid and navigates into a quiz", async () => {
    render(<QuizList />);

    expect(await screen.findByText("Quiz assessment that stays clear under pressure")).toBeInTheDocument();
    expect(screen.getByText("React Fundamentals")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /start quiz/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/quiz/quiz-101");
    });
  });
});
