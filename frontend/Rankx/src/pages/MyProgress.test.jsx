import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MyProgress from "./MyProgress";

const { navigateMock, subscribeMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  subscribeMock: vi.fn(() => () => {}),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useSearchParams: () => [new URLSearchParams("plan=1")],
}));

vi.mock("../services/userApi", () => ({
  getMyProgressSummary: vi.fn(),
  getMyStudyPlans: vi.fn(),
  getStudyPlanProgress: vi.fn(),
}));

vi.mock("../services/authService", () => ({
  logoutUser: vi.fn(),
}));

vi.mock("../utils/progressSync", () => ({
  subscribeToProgressUpdates: subscribeMock,
}));

vi.mock("../utils/eventTracker", () => ({
  trackProductEvent: trackMock,
}));

const { getMyProgressSummary, getMyStudyPlans, getStudyPlanProgress } = await import("../services/userApi");

describe("MyProgress", () => {
  beforeEach(() => {
    getMyProgressSummary.mockResolvedValue({
      streakCount: 3,
      currentPlan: {
        title: "DSA Basics",
        completionPercentage: 50,
        nextItemTitle: "Java basics quiz",
      },
    });
    getMyStudyPlans.mockResolvedValue([
      {
        studyPlanId: 1,
        title: "DSA Basics",
        track: "Coding",
        level: "Beginner",
        completionPercentage: 50,
        nextItemTitle: "Java basics quiz",
      },
    ]);
    getStudyPlanProgress.mockResolvedValue({
      title: "DSA Basics",
      completionPercentage: 50,
      completedItems: 1,
      totalItems: 2,
      nextItemTitle: "Java basics quiz",
      items: [
        { itemId: 11, sequenceNumber: 1, title: "Arrays warmup", itemType: "CODING_PROBLEM", progressState: "COMPLETED" },
        { itemId: 12, sequenceNumber: 2, title: "Java basics quiz", itemType: "QUIZ", progressState: "NEXT" },
      ],
    });
  });

  it("renders current plan progress and real activity messaging", async () => {
    render(<MyProgress />);

    expect(await screen.findByText("My study progress")).toBeInTheDocument();
    expect(screen.getAllByText("DSA Basics").length).toBeGreaterThan(0);
    expect(screen.getByText("Progress updates from real quiz completion")).toBeInTheDocument();
  });
});
