import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudyPlans from "./StudyPlans";

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../services/authService", () => ({
  logoutUser: vi.fn(),
}));

vi.mock("../services/userApi", () => ({
  getStudyPlans: vi.fn(),
  getMyProgressSummary: vi.fn(),
  getMyStudyPlans: vi.fn(),
  getStudyPlanProgress: vi.fn(),
}));

const { getStudyPlans, getMyProgressSummary, getMyStudyPlans, getStudyPlanProgress } =
  await import("../services/userApi");

describe("StudyPlans", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getStudyPlans.mockResolvedValue([
      {
        id: 1,
        title: "Full-Stack Engineering Path",
        description: "A structured learning path.",
        track: "BOTH",
        level: "INTERMEDIATE",
        totalItems: 24,
        enrolled: true,
      },
      {
        id: 2,
        title: "Frontend Foundations",
        description: "UI and React path.",
        track: "QUIZ",
        level: "BEGINNER",
        totalItems: 12,
        enrolled: false,
      },
    ]);
    getMyProgressSummary.mockResolvedValue({
      enrolledPlans: 1,
      streakCount: 4,
      currentPlan: {
        studyPlanId: 1,
        title: "Full-Stack Engineering Path",
        completionPercentage: 65,
        nextItemTitle: "Binary Trees - Level Order Traversal",
      },
    });
    getMyStudyPlans.mockResolvedValue([
      {
        studyPlanId: 1,
        title: "Full-Stack Engineering Path",
        track: "BOTH",
        level: "INTERMEDIATE",
        completionPercentage: 65,
        nextItemTitle: "Binary Trees - Level Order Traversal",
      },
    ]);
    getStudyPlanProgress.mockResolvedValue({
      title: "Full-Stack Engineering Path",
      completionPercentage: 65,
      completedItems: 13,
      totalItems: 24,
      nextItemTitle: "Binary Trees - Level Order Traversal",
      items: [
        {
          itemId: 11,
          sequenceNumber: 1,
          title: "Arrays and Hashing",
          itemType: "CODING_PROBLEM",
          progressState: "COMPLETED",
        },
        {
          itemId: 12,
          sequenceNumber: 2,
          title: "Binary Trees - Level Order Traversal",
          itemType: "CODING_PROBLEM",
          progressState: "NEXT",
        },
      ],
    });
  });

  it("renders the active plan dashboard and opens a plan", async () => {
    render(<StudyPlans />);

    expect(await screen.findByText("Guided study plans built around progress, momentum, and what to do next")).toBeInTheDocument();
    expect(screen.getAllByText("Full-Stack Engineering Path").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Binary Trees - Level Order Traversal").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /continue plan/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/study-plans/1");
    });
  });
});
