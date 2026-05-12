import api from "../services/api";

const inFlightKeys = new Map();

export async function trackAdminEvent(event, options = {}) {
  const token = localStorage.getItem("token");
  if (!token || !event?.eventName || !event?.eventCategory) {
    return null;
  }

  const payload = {
    ...event,
    occurredAt: event.occurredAt || new Date().toISOString(),
  };
  const dedupeKey = options.dedupeKey;
  const oncePerSessionKey = options.oncePerSessionKey;

  if (oncePerSessionKey && typeof window !== "undefined") {
    const storageKey = `rankx-admin:event:${oncePerSessionKey}`;
    if (window.sessionStorage.getItem(storageKey) === "sent") {
      return null;
    }
    window.sessionStorage.setItem(storageKey, "sent");
  }

  if (dedupeKey && inFlightKeys.has(dedupeKey)) {
    return inFlightKeys.get(dedupeKey);
  }

  const request = api
    .post("/users/events", payload)
    .catch((error) => {
      if (oncePerSessionKey && typeof window !== "undefined") {
        window.sessionStorage.removeItem(`rankx-admin:event:${oncePerSessionKey}`);
      }
      if (typeof window !== "undefined" && window.location.hostname === "localhost") {
        console.debug("Admin event tracking skipped", payload.eventName, error?.message);
      }
      return null;
    })
    .finally(() => {
      if (dedupeKey) {
        inFlightKeys.delete(dedupeKey);
      }
    });

  if (dedupeKey) {
    inFlightKeys.set(dedupeKey, request);
  }

  return request;
}
