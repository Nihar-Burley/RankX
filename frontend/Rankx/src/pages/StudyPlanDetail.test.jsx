import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudyPlanDetail from "./StudyPlanDetail";

const { navigateMock, subscribeMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  subscribeMock: vi.fn(() => () => {}),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ id: "1" }),
}));

vi.mock("../services/userApi", () => ({
  getStudyPlanDetail: vi.fn(),
  enrollInStudyPlan: vi.fn(),
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

const { getStudyPlanDetail, enrollInStudyPlan } = await import("../services/userApi");

describe("StudyPlanDetail", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    trackMock.mockReset();
    getStudyPlanDetail.mockResolvedValue({
      id: 1,
      title: "DSA Basics",
      description: "Foundational path",
      track: "Coding",
      level: "Beginner",
      enrolled: false,
      items: [
        {
          id: 11,
          sequenceNumber: 1,
          title: "Arrays warmup",
          description: "Solve arrays.",
          itemType: "CODING_PROBLEM",
          referenceKey: "problem-101",
          estimatedMinutes: 20,
          progressState: "NEXT",
        },
      ],
    });
    enrollInStudyPlan.mockResolvedValue({});
  });

  it("renders plan details and item action", async () => {
    render(<StudyPlanDetail />);

    expect(await screen.findByText("DSA Basics")).toBeInTheDocument();
    expect(screen.getByText("Coding activity unlocks this step")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open problem/i }));
    expect(navigateMock).toHaveBeenCalledWith("/problems/101");
  });

  it("enrolls and reloads the plan", async () => {
    render(<StudyPlanDetail />);

    await screen.findByText("DSA Basics");
    fireEvent.click(screen.getByRole("button", { name: /enroll in plan/i }));

    await waitFor(() => {
      expect(enrollInStudyPlan).toHaveBeenCalledWith("1");
    });
  });
});
