import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudyPlanList from "./StudyPlanList";

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

vi.mock("../services/studyPlanAdminApi", () => ({
  getStudyPlansAdmin: vi.fn(),
  deactivateStudyPlanAdmin: vi.fn(),
}));

const { getStudyPlansAdmin, deactivateStudyPlanAdmin } = await import("../services/studyPlanAdminApi");

describe("StudyPlanList", () => {
  beforeEach(() => {
    getStudyPlansAdmin.mockResolvedValue([
      {
        id: 1,
        title: "DSA Basics",
        description: "Foundational path",
        slug: "dsa-basics",
        track: "Coding",
        level: "Beginner",
        totalItems: 3,
        active: true,
      },
    ]);
    deactivateStudyPlanAdmin.mockResolvedValue({ id: 1, active: false });
  });

  it("renders plan stats and operator note", async () => {
    render(<StudyPlanList />);

    expect(await screen.findByText("Manage guided learning paths")).toBeInTheDocument();
    expect(screen.getByText("DSA Basics")).toBeInTheDocument();
    expect(screen.getByText(/operator note/i)).toBeInTheDocument();
  });

  it("deactivates a plan from the list", async () => {
    render(<StudyPlanList />);

    fireEvent.click(await screen.findByRole("button", { name: /deactivate/i }));
    await waitFor(() => {
      expect(deactivateStudyPlanAdmin).toHaveBeenCalledWith(1);
    });
  });
});
