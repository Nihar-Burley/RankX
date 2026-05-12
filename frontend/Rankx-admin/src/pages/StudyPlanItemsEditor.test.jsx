import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudyPlanItemsEditor from "./StudyPlanItemsEditor";

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useParams: () => ({ id: "1" }),
  useLocation: () => ({ state: { notice: "Ready" } }),
}));

vi.mock("../services/studyPlanAdminApi", () => ({
  getStudyPlanAdmin: vi.fn(),
  updateStudyPlanAdmin: vi.fn(),
}));

const { getStudyPlanAdmin, updateStudyPlanAdmin } = await import("../services/studyPlanAdminApi");

describe("StudyPlanItemsEditor", () => {
  beforeEach(() => {
    getStudyPlanAdmin.mockResolvedValue({
      id: 1,
      slug: "dsa-basics",
      title: "DSA Basics",
      description: "Foundations",
      track: "Coding",
      level: "Beginner",
      active: true,
      items: [],
    });
    updateStudyPlanAdmin.mockResolvedValue({
      id: 1,
      slug: "dsa-basics",
      title: "DSA Basics",
      description: "Foundations",
      track: "Coding",
      level: "Beginner",
      active: true,
      items: [
        {
          id: 11,
          sequenceNumber: 1,
          title: "Arrays warmup",
          description: "Practice arrays",
          itemType: "CODING_PROBLEM",
          referenceType: "problem",
          referenceId: "101",
          referenceKey: "problem-101",
          estimatedMinutes: 20,
        },
      ],
    });
  });

  it("adds an item and saves through the admin API", async () => {
    render(<StudyPlanItemsEditor />);

    await screen.findByText("DSA Basics");
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Arrays warmup" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Practice arrays" } });
    fireEvent.change(screen.getByLabelText("Reference ID"), { target: { value: "101" } });
    fireEvent.click(screen.getByRole("button", { name: /add item/i }));

    await waitFor(() => {
      expect(updateStudyPlanAdmin).toHaveBeenCalled();
    });
    expect(await screen.findByText("problem-101 • 20 min")).toBeInTheDocument();
  });
});
