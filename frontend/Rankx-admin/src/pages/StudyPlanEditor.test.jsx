import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudyPlanEditor from "./StudyPlanEditor";

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => navigateMock,
  useParams: () => ({}),
}));

vi.mock("../services/studyPlanAdminApi", () => ({
  createStudyPlanAdmin: vi.fn(),
  getStudyPlanAdmin: vi.fn(),
  updateStudyPlanAdmin: vi.fn(),
}));

const { createStudyPlanAdmin } = await import("../services/studyPlanAdminApi");

describe("StudyPlanEditor", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    createStudyPlanAdmin.mockResolvedValue({ id: 8 });
  });

  it("creates a study plan and navigates to item mapping", async () => {
    render(<StudyPlanEditor />);

    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: "mixed-interview-prep" } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Mixed Interview Prep" } });
    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Guided prep path" } });
    fireEvent.click(screen.getByRole("button", { name: /create plan/i }));

    await waitFor(() => {
      expect(createStudyPlanAdmin).toHaveBeenCalled();
    });
    expect(navigateMock).toHaveBeenCalledWith("/admin/plans/8/items", expect.any(Object));
  });
});
