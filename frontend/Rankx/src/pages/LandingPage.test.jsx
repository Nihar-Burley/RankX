import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LandingPage from "./LandingPage";

function renderLandingPage() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe("LandingPage", () => {
  it("renders the hero content and primary calls to action", () => {
    renderLandingPage();

    expect(screen.getByText("Learn to code.")).toBeInTheDocument();
    expect(screen.getByText("Get assessed.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /start learning free/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /watch demo/i })).toBeInTheDocument();
  });

  it("toggles between dark and light mode and persists the preference", () => {
    renderLandingPage();

    const page = screen.getByText("Learn to code.").closest("[data-theme]");
    const toggle = screen.getByRole("button", { name: /switch to light mode/i });

    expect(page).toHaveAttribute("data-theme", "dark");

    fireEvent.click(toggle);

    expect(page).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("rankx-landing-theme")).toBe("light");
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
  });
});
