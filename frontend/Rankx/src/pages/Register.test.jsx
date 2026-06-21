import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Register from "./Register";

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
  registerApi: vi.fn(),
  verifyOtpApi: vi.fn(),
}));

vi.mock("../utils/eventTracker", () => ({
  trackProductEvent: trackMock,
}));

const { registerApi, verifyOtpApi } = await import("../services/authService");

describe("Register", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    trackMock.mockReset();
    registerApi.mockResolvedValue({});
    verifyOtpApi.mockResolvedValue({});
  });

  it("moves from account details to OTP verification and completes signup", async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect(screen.getByText("Create your account")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "rankx_test" } });
    fireEvent.change(screen.getByLabelText("Mobile number"), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(registerApi).toHaveBeenCalledWith({
        username: "rankx_test",
        password: "secret123",
        mobile: "9876543210",
      });
    });

    expect(await screen.findByText("Verify your mobile")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("One-time password"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /verify otp/i }));

    await waitFor(() => {
      expect(verifyOtpApi).toHaveBeenCalledWith({
        mobile: "9876543210",
        otp: "123456",
      });
      expect(navigateMock).toHaveBeenCalledWith("/login", { replace: true });
      expect(trackMock).toHaveBeenCalled();
    });
  });
});
