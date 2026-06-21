import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Onboarding from "./Onboarding";

const { navigateMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../services/userApi", () => ({
  getMyPreferences: vi.fn(),
  updateMyPreferences: vi.fn(),
}));

vi.mock("../utils/eventTracker", () => ({
  trackProductEvent: trackMock,
}));

const { getMyPreferences, updateMyPreferences } = await import("../services/userApi");

describe("Onboarding", () => {
  const clickCard = (label) => {
    const cardTitle = screen.getByText(label);
    const button = cardTitle.closest("button");
    if (!button) {
      throw new Error(`Missing button wrapper for onboarding card: ${label}`);
    }
    fireEvent.click(button);
  };

  beforeEach(() => {
    localStorage.setItem("token", "token");
    navigateMock.mockReset();
    trackMock.mockReset();
    getMyPreferences.mockResolvedValue({
      onboardingCompleted: false,
      goal: "",
      preferredTrack: "",
      skillLevel: "",
    });
    updateMyPreferences.mockResolvedValue({});
  });

  it("redirects completed users back to home", async () => {
    getMyPreferences.mockResolvedValueOnce({ onboardingCompleted: true });

    render(<Onboarding />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/home", { replace: true });
    });
  });

  it("saves preferences and tracks onboarding completion", async () => {
    render(<Onboarding />);

    await screen.findByText("Set up your learning workspace");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByText("What is your main goal?");
    clickCard("Interview Prep");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByText("Which track should RankX prioritize?");
    clickCard("Coding");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByText("How would you describe your current level?");
    clickCard("Intermediate");
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await screen.findByText("Your plan preview");
    fireEvent.click(screen.getByRole("button", { name: "Start learning" }));

    await waitFor(() => {
      expect(updateMyPreferences).toHaveBeenCalledWith({
        goal: "Interview Prep",
        preferredTrack: "Coding",
        skillLevel: "Intermediate",
      });
    });
    expect(trackMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/home", { replace: true });
  });
});
