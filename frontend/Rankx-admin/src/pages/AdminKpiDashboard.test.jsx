import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminKpiDashboard from "./AdminKpiDashboard";

const { trackMock } = vi.hoisted(() => ({
  trackMock: vi.fn(),
}));

vi.mock("../services/adminAnalyticsApi", () => ({
  getAdminKpis: vi.fn(),
}));

vi.mock("../utils/eventTracker", () => ({
  trackAdminEvent: trackMock,
}));

const { getAdminKpis } = await import("../services/adminAnalyticsApi");

describe("AdminKpiDashboard", () => {
  beforeEach(() => {
    getAdminKpis.mockResolvedValue({
      totalTrackedUsers: 100,
      activeUsersLast7Days: 42,
      activationRate: 63,
      engagementRate: 55,
      totalEvents: 500,
      loginEvents: 120,
      onboardingCompletions: 20,
      codingEvents: 160,
      quizEvents: 130,
      progressEvents: 70,
      highlights: [
        { title: "Healthy activation", valueLabel: "63%", description: "Users are activating at a stable rate." },
      ],
    });
  });

  it("renders KPI metrics and highlights", async () => {
    render(<AdminKpiDashboard />);

    expect(await screen.findByText("Activation and engagement health")).toBeInTheDocument();
    expect(screen.getByText("Tracked users")).toBeInTheDocument();
    expect(screen.getByText(/use these callouts/i)).toBeInTheDocument();
    expect(trackMock).toHaveBeenCalled();
  });
});
