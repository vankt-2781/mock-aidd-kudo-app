import { describe, expect, it } from "vitest";
import { config } from "./proxy";

// Next compiles the "/((?!...).*)" matcher idiom with path-to-regexp; for this shape the
// result is equivalent to the anchored regex below. The test documents which paths the
// proxy (and therefore the launch gate) sees — if the matcher changes, this must change too.
const [pattern] = config.matcher;
const inner = pattern.slice("/(".length, -")".length);
const matcher = new RegExp(`^/(${inner})$`);

const seenByProxy = [
  "/",
  "/awards",
  "/kudos",
  "/todo",
  "/profile",
  "/admin",
  "/countdown",
  "/login",
  "/api/event-config",
  "/api/other",
  "/auth/other",
] as const;

const skippedByMatcher = [
  "/_next/static/chunks/main.js",
  "/_next/image",
  "/favicon.ico",
  "/images/home/icon-saa.svg",
  "/auth/callback",
  "/logo.png",
  "/images/prelaunch/prelaunch-bg.png",
] as const;

describe("proxy config.matcher (launch-gate coverage)", () => {
  it.each(seenByProxy)("runs the proxy for %s", (path) => {
    expect(matcher.test(path)).toBe(true);
  });

  it.each(skippedByMatcher)("skips %s (static asset or auth callback)", (path) => {
    expect(matcher.test(path)).toBe(false);
  });
});
