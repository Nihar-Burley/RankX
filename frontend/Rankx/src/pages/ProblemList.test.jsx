import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProblemList from "./ProblemList";

const { navigateMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const apiModule = await import("../services/api");
const api = apiModule.default;

describe("ProblemList", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    api.get.mockImplementation((url) => {
      if (url === "/problems") {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 101,
                title: "Two Sum",
                difficulty: "EASY",
                tags: ["Array", "Hash Map"],
                languages: [{ languageKey: "java17" }, { languageKey: "python3" }],
              },
            ],
          },
        });
      }

      if (url === "/problems/101") {
        return Promise.resolve({
          data: {
            id: 101,
            title: "Two Sum",
            difficulty: "EASY",
            tags: ["Array", "Hash Map"],
            statement: "Find two values that add up to the target.",
            constraints: "2 <= nums.length <= 10^4",
            languages: [{ displayName: "Java 17" }, { displayName: "Python 3" }],
          },
        });
      }

      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });
  });

  it("renders the redesigned catalog and opens the workspace route", async () => {
    render(<ProblemList />);

    expect(await screen.findByText("Practice coding with instant evaluation")).toBeInTheDocument();
    expect(screen.getAllByText("Two Sum").length).toBeGreaterThan(0);
    expect((await screen.findAllByText("Find two values that add up to the target.")).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /run code/i }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/problems/101");
    });
  });
});
