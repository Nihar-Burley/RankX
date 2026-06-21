import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProblemWorkspace from "./ProblemWorkspace";

const { navigateMock, emitProgressUpdatedMock, trackProductEventMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  emitProgressUpdatedMock: vi.fn(),
  trackProductEventMock: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }) => (
    <textarea
      data-testid="code-editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../utils/progressSync", () => ({
  emitProgressUpdated: emitProgressUpdatedMock,
}));

vi.mock("../utils/eventTracker", () => ({
  trackProductEvent: trackProductEventMock,
}));

const api = (await import("../services/api")).default;

const problem = {
  id: 101,
  title: "Two Sum",
  statement: "Find two indices that add up to the target.",
  difficulty: "EASY",
  tags: ["Arrays", "Hash Map"],
  constraints: "2 <= nums.length <= 10^4",
  editorial: "Use a hash map to store seen values.",
  languages: [
    { languageKey: "java17", displayName: "Java 17", editorMode: "java" },
    { languageKey: "python3", displayName: "Python 3", editorMode: "python" },
    { languageKey: "javascript", displayName: "JavaScript", editorMode: "javascript" },
  ],
  templates: [
    { languageKey: "java17", starterCode: "class Main { public static void main(String[] args) {} }" },
    { languageKey: "python3", starterCode: "print('python')" },
    { languageKey: "javascript", starterCode: "console.log('js');" },
  ],
};

const sampleCases = [
  { input: "2\n2 7 11 15\n9", expectedOutput: "0 1" },
  { input: "2\n3 3\n6", expectedOutput: "0 1" },
];

describe("ProblemWorkspace", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    emitProgressUpdatedMock.mockReset();
    trackProductEventMock.mockReset();
    api.get.mockReset();
    api.post.mockReset();

    api.get.mockImplementation((url) => {
      if (url === "/problems") {
        return Promise.resolve({ data: { content: [problem] } });
      }

      if (url === `/problems/${problem.id}/testcases/samples`) {
        return Promise.resolve({ data: sampleCases });
      }

      return Promise.reject(new Error(`Unexpected GET ${url}`));
    });
  });

  it("renders all supported language options", async () => {
    render(<ProblemWorkspace problem={problem} />);

    await screen.findByRole("heading", { name: "Two Sum" });

    const select = screen.getByLabelText(/select language/i);
    const options = Array.from(select.options).map((option) => option.value);

    expect(options).toEqual(["java17", "python3", "javascript"]);
  });

  it.each([
    ["java17", "java", "class Main { public static void main(String[] args) {} }"],
    ["python3", "python", "print('python')"],
    ["javascript", "javascript", "console.log('js');"],
  ])("lets the user select %s and loads the matching starter code", async (languageKey, editorMode, starterCode) => {
    render(<ProblemWorkspace problem={problem} />);

    await screen.findByRole("heading", { name: "Two Sum" });

    fireEvent.change(screen.getByLabelText(/select language/i), {
      target: { value: languageKey },
    });

    expect(screen.getByLabelText(/select language/i)).toHaveValue(languageKey);
    expect(screen.getByText(editorMode)).toBeInTheDocument();
    expect(screen.getByTestId("code-editor")).toHaveValue(starterCode);
  });

  it.each([
    ["java17", "class Main { public static void main(String[] args) { System.out.print(12); } }"],
    ["python3", "print(12)"],
    ["javascript", "console.log(12);"],
  ])("runs custom input with the selected language %s", async (languageKey, sourceCode) => {
    api.post.mockResolvedValueOnce({
      data: {
        results: [
          {
            input: "5 7",
            expectedOutput: "",
            actualOutput: "12",
            passed: true,
          },
        ],
      },
    });

    render(<ProblemWorkspace problem={problem} />);

    await screen.findByRole("heading", { name: "Two Sum" });

    fireEvent.change(screen.getByLabelText(/select language/i), {
      target: { value: languageKey },
    });
    fireEvent.change(screen.getByTestId("code-editor"), {
      target: { value: sourceCode },
    });
    fireEvent.click(screen.getByRole("button", { name: /custom input/i }));
    fireEvent.change(screen.getByLabelText(/custom input/i), {
      target: { value: "5 7" },
    });
    fireEvent.click(screen.getByRole("button", { name: /run custom input/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/submissions/run", {
        problemId: 101,
        languageKey,
        sourceCode,
        customInput: "5 7",
      });
    });

    expect(await screen.findByText(/Case 1:/i)).toBeInTheDocument();
  });

  it.each([
    ["java17", "class Main { public static void main(String[] args) { System.out.print(3); } }"],
    ["python3", "print(3)"],
    ["javascript", "console.log(3);"],
  ])("submits accepted code for %s and emits progress updates", async (languageKey, sourceCode) => {
    api.post.mockResolvedValueOnce({
      data: {
        submissionId: 9001,
        verdict: "ACCEPTED",
        results: [{ index: 1, passed: true }, { index: 2, passed: true }],
      },
    });

    render(<ProblemWorkspace problem={problem} />);

    await screen.findByRole("heading", { name: "Two Sum" });

    fireEvent.change(screen.getByLabelText(/select language/i), {
      target: { value: languageKey },
    });
    fireEvent.change(screen.getByTestId("code-editor"), {
      target: { value: sourceCode },
    });
    fireEvent.click(screen.getByRole("button", { name: /^submit$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/submissions/submit", {
        problemId: 101,
        languageKey,
        sourceCode,
      });
    });

    expect(trackProductEventMock).toHaveBeenCalled();
    expect(emitProgressUpdatedMock).toHaveBeenCalledWith({
      source: "submission",
      problemId: 101,
      submissionId: 9001,
    });
    expect(await screen.findByText(/FINAL VERDICT: ACCEPTED/i)).toBeInTheDocument();
  });

  it("submits wrong-answer code without emitting progress", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        submissionId: 9010,
        verdict: "WRONG_ANSWER",
        results: [{ index: 1, passed: false }],
      },
    });

    render(<ProblemWorkspace problem={problem} />);

    await screen.findByRole("heading", { name: "Two Sum" });

    fireEvent.click(screen.getByRole("button", { name: /^submit$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/submissions/submit", {
        problemId: 101,
        languageKey: "java17",
        sourceCode: "class Main { public static void main(String[] args) {} }",
      });
    });

    expect(trackProductEventMock).toHaveBeenCalledTimes(1);
    expect(emitProgressUpdatedMock).not.toHaveBeenCalled();
    expect(await screen.findByText(/FINAL VERDICT: WRONG_ANSWER/i)).toBeInTheDocument();
  });
});
