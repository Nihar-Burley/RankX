import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Analytics from "./Analytics";

const { navigateMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../services/userApi", () => ({
  getMyAnalytics: vi.fn(),
  normalizeRecommendation: vi.fn((value) => value),
}));

vi.mock("../services/authService", () => ({
  logoutUser: vi.fn(),
}));

vi.mock("../utils/eventTracker", () => ({
  trackProductEvent: trackMock,
}));

const { getMyAnalytics } = await import("../services/userApi");

describe("Analytics", () => {
  beforeEach(() => {
    localStorage.setItem("token", "token");
    getMyAnalytics.mockResolvedValue({
      codingPerformance: { acceptanceRate: 40, acceptedSubmissions: 2, strongTopics: [], weakTopics: [] },
      quizPerformance: { averagePercentage: 0, totalAttempts: 0, strongTopics: [], weakTopics: [] },
      activitySummary: {
        streakCount: 0,
        enrolledStudyPlans: 0,
        totalCompletedPlanItems: 0,
        latestCodingActivityAt: null,
        latestQuizActivityAt: null,
        latestOverallActivityAt: null,
      },
      primaryRecommendation: {
        title: "Complete onboarding",
        description: "Personalize the product.",
        route: "/onboarding",
        priority: "HIGH",
        reason: "Preferences are not set yet",
        recommendationType: "ONBOARDING",
      },
      recommendations: [],
    });
  });

  it("renders safe empty-state analytics values for new users", async () => {
    render(<Analytics />);

    expect(await screen.findByText("Performance and learning signals")).toBeInTheDocument();
    expect(screen.getAllByText("No activity yet").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Complete onboarding").length).toBeGreaterThan(0);
  });
});
