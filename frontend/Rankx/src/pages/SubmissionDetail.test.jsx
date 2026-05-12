import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubmissionDetail from "./SubmissionDetail";

const { navigateMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ submissionId: "44" }),
}));

vi.mock("../services/submissionApi", () => ({
  getSubmissionDetail: vi.fn(),
  getProblemAttemptSummary: vi.fn(),
}));

vi.mock("../utils/eventTracker", () => ({
  trackProductEvent: trackMock,
}));

const { getSubmissionDetail, getProblemAttemptSummary } = await import("../services/submissionApi");

describe("SubmissionDetail", () => {
  beforeEach(() => {
    localStorage.setItem("token", "token");
    getSubmissionDetail.mockResolvedValue({
      id: 44,
      problemId: 101,
      languageKey: "java",
      runtimeMs: 120,
      memoryKb: 256,
      status: "ACCEPTED",
      createdAt: "2026-05-12T10:00:00Z",
      sourceCode: "class Main {}",
    });
    getProblemAttemptSummary.mockResolvedValue({
      totalAttempts: 3,
      acceptedAttempts: 1,
      bestRuntimeMs: 120,
      languagesUsed: ["java", "python"],
    });
  });

  it("renders submission review details and problem summary", async () => {
    render(<SubmissionDetail />);

    expect(await screen.findByText("Coding Review")).toBeInTheDocument();
    expect(screen.getByText("Problem #101")).toBeInTheDocument();
    expect(screen.getByText(/converging toward stable accepted outcomes/i)).toBeInTheDocument();
    expect(screen.getByText("Problem Attempts")).toBeInTheDocument();
  });
});
