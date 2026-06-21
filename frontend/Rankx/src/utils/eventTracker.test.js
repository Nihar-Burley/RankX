import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../services/api";
import { trackProductEvent } from "./eventTracker";

vi.mock("../services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("trackProductEvent", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    api.post.mockReset();
  });

  it("returns null when no auth token is present", async () => {
    const result = await trackProductEvent({
      eventName: "DASHBOARD_VIEWED",
      eventCategory: "ANALYTICS",
    });

    expect(result).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("dedupes once-per-session events", async () => {
    localStorage.setItem("token", "token");
    api.post.mockResolvedValue({ data: {} });

    await trackProductEvent(
      { eventName: "DASHBOARD_VIEWED", eventCategory: "ANALYTICS" },
      { oncePerSessionKey: "dashboard-viewed" }
    );
    await trackProductEvent(
      { eventName: "DASHBOARD_VIEWED", eventCategory: "ANALYTICS" },
      { oncePerSessionKey: "dashboard-viewed" }
    );

    expect(api.post).toHaveBeenCalledTimes(1);
  });
});
