import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";

const { navigateMock, subscribeMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  subscribeMock: vi.fn(() => () => {}),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useOutletContext: () => ({ profile: { email: "user@example.com" } }),
}));

vi.mock("../services/userApi", () => ({
  getMyProfile: vi.fn(),
  getMyDashboardSummary: vi.fn(),
  getMyAnalytics: vi.fn(),
  normalizeRecommendation: vi.fn((value) => value),
}));

vi.mock("../services/resultApi", () => ({
  getMyResults: vi.fn(),
}));

vi.mock("../services/submissionApi", () => ({
  getMyRecentSubmissions: vi.fn(),
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

const { getMyProfile, getMyDashboardSummary, getMyAnalytics } = await import("../services/userApi");
const { getMyResults } = await import("../services/resultApi");
const { getMyRecentSubmissions } = await import("../services/submissionApi");

describe("Home", () => {
  beforeEach(() => {
    localStorage.setItem("token", "token");
    navigateMock.mockReset();
    trackMock.mockReset();
    getMyProfile.mockResolvedValue({
      displayName: "Nihar",
      username: "nihar",
      role: "ROLE_USER",
    });
    getMyDashboardSummary.mockResolvedValue({
      onboardingCompleted: true,
      goal: "Interview Prep",
      preferredTrack: "Coding",
      skillLevel: "Intermediate",
      streakCount: 4,
      currentStudyPlan: {
        title: "DSA Basics",
        nextItemTitle: "Arrays warmup",
        completionPercentage: 40,
      },
      checklist: [],
    });
    getMyAnalytics.mockResolvedValue({
      primaryRecommendation: {
        title: "Continue DSA Basics",
        description: "Stay on the current path.",
        route: "/my-progress",
        priority: "HIGH",
        reason: "Unfinished study plan item is available right now",
        recommendationType: "STUDY_PLAN_NEXT_ITEM",
      },
      codingPerformance: {
        acceptedSubmissions: 2,
        totalSubmissions: 3,
      },
      quizPerformance: {
        averagePercentage: 62,
        totalAttempts: 2,
      },
      activitySummary: {
        latestOverallActivityAt: "2026-05-10T10:30:00Z",
      },
      recommendations: [],
    });
    getMyResults.mockResolvedValue({ data: [] });
    getMyRecentSubmissions.mockResolvedValue([]);
  });

  it("redirects to onboarding when onboarding is incomplete", async () => {
    getMyDashboardSummary.mockResolvedValueOnce({ onboardingCompleted: false });

    render(<Home />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/onboarding", { replace: true });
    });
  });

  it("renders focused dashboard content and primary recommendation", async () => {
    render(<Home />);

    expect(await screen.findByText(/Welcome back, Nihar/i)).toBeInTheDocument();
    expect(screen.getByText("Current progress")).toBeInTheDocument();
    expect(screen.getAllByText("DSA Basics").length).toBeGreaterThan(0);
    expect(screen.getByText("Continue DSA Basics")).toBeInTheDocument();
    expect(screen.getByText(/Recommended Next Move/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue plan/i }));
    expect(navigateMock).toHaveBeenCalledWith("/my-progress");
    expect(trackMock).toHaveBeenCalled();
  });
});
