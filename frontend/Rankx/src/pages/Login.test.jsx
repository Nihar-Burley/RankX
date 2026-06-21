import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login";

const { navigateMock, trackMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  trackMock: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../services/authService", () => ({
  loginApi: vi.fn(),
}));

vi.mock("../utils/jwtUtils", () => ({
  getRoleFromToken: vi.fn(),
}));

vi.mock("../utils/eventTracker", () => ({
  trackProductEvent: trackMock,
}));

const { loginApi } = await import("../services/authService");
const { getRoleFromToken } = await import("../utils/jwtUtils");

describe("Login", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    trackMock.mockReset();
    loginApi.mockResolvedValue({ data: { accessToken: "token" } });
    getRoleFromToken.mockReturnValue("ROLE_USER");
  });

  it("renders the premium auth shell and signs in the user", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sign in to RankX")).toBeInTheDocument();
    expect(screen.getByText("Welcome back to your journey.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "rankx_test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(loginApi).toHaveBeenCalledWith({ username: "rankx_test", password: "secret" });
      expect(navigateMock).toHaveBeenCalledWith("/home");
      expect(trackMock).toHaveBeenCalled();
    });
  });
});
