import { describe, expect, it } from "vitest";
import { COUNTDOWN_PATH, decideLaunchGateRedirect } from "./decide-launch-gate-redirect";

const start = new Date("2026-12-26T18:30:00+07:00");
const before = new Date(start.getTime() - 1000);
const after = new Date(start.getTime() + 1000);

const paths = [
  "/",
  "/awards",
  "/todo",
  "/countdown",
  "/login",
  "/auth/callback",
  "/api/event-config",
  "/loginx",
  "/apix",
  "/countdownx",
  "/api/other",
  "/auth/other",
] as const;

// Expected pre-launch result for a non-admin; admin bypasses everything except /countdown (still allowed).
const preLaunchNonAdmin: Record<(typeof paths)[number], string | null> = {
  "/": COUNTDOWN_PATH,
  "/awards": COUNTDOWN_PATH,
  "/todo": COUNTDOWN_PATH,
  "/countdown": null,
  "/login": null,
  "/auth/callback": null,
  "/api/event-config": null,
  "/loginx": COUNTDOWN_PATH,
  "/apix": COUNTDOWN_PATH,
  "/countdownx": COUNTDOWN_PATH,
  "/api/other": COUNTDOWN_PATH,
  "/auth/other": COUNTDOWN_PATH,
};

describe("decideLaunchGateRedirect (DEC-001)", () => {
  describe("pre-launch, non-admin", () => {
    it.each(paths)("%s", (pathname) => {
      expect(decideLaunchGateRedirect({ pathname, now: before, start, isAdmin: false })).toBe(
        preLaunchNonAdmin[pathname],
      );
    });
  });

  describe("pre-launch, admin bypasses the gate", () => {
    it.each(paths)("%s", (pathname) => {
      expect(decideLaunchGateRedirect({ pathname, now: before, start, isAdmin: true })).toBeNull();
    });
  });

  describe.each([
    ["now == start", start],
    ["now > start", after],
  ])("post-launch (%s)", (_label, now) => {
    it.each(paths)("%s", (pathname) => {
      const expected = pathname === "/countdown" ? "/" : null;
      expect(decideLaunchGateRedirect({ pathname, now, start, isAdmin: false })).toBe(expected);
      expect(decideLaunchGateRedirect({ pathname, now, start, isAdmin: true })).toBe(expected);
    });
  });

  describe("start null (fail-open, BR-003)", () => {
    it.each(paths)("%s", (pathname) => {
      const expected = pathname === "/countdown" ? "/" : null;
      expect(decideLaunchGateRedirect({ pathname, now: before, start: null, isAdmin: false })).toBe(
        expected,
      );
    });
  });
});
