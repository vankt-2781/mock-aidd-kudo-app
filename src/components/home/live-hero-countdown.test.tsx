// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveHeroCountdown } from "./live-hero-countdown";

const START = "2025-12-26T18:30:00+07:00"; // 2025-12-26T11:30:00Z
const startMs = Date.parse(START);
const LABEL = "Coming soon";

function digits(container: HTMLElement) {
  return Array.from(container.querySelectorAll("[aria-label]")).map((el) => el.getAttribute("aria-label"));
}

describe("LiveHeroCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders values from initialNow on first render", () => {
    const initialNow = startMs - (2 * 1440 + 3 * 60 + 4) * 60_000;
    vi.setSystemTime(initialNow);
    const { container, getByText } = render(
      <LiveHeroCountdown targetDate={START} initialNow={initialNow} comingSoonLabel={LABEL} />,
    );
    expect(digits(container)).toEqual(["02 DAYS", "03 HOURS", "04 MINUTES"]);
    expect(getByText(LABEL)).toBeTruthy();
  });

  it("re-syncs to Date.now() after mount", () => {
    const initialNow = startMs - 10 * 60_000;
    vi.setSystemTime(startMs - 5 * 60_000);
    const { container } = render(<LiveHeroCountdown targetDate={START} initialNow={initialNow} comingSoonLabel={LABEL} />);
    expect(digits(container)).toEqual(["00 DAYS", "00 HOURS", "05 MINUTES"]);
  });

  it("drops MINUTES by one per minute with rollover (TC ID-39)", () => {
    const now = startMs - 60 * 60_000; // exactly 1h
    vi.setSystemTime(now);
    const { container } = render(<LiveHeroCountdown targetDate={START} initialNow={now} comingSoonLabel={LABEL} />);
    expect(digits(container)).toEqual(["00 DAYS", "01 HOURS", "00 MINUTES"]);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(digits(container)).toEqual(["00 DAYS", "00 HOURS", "59 MINUTES"]);
  });

  it("aligns the first tick to the minute boundary of the remaining time", () => {
    const now = startMs - 5 * 60_000 - 20_000; // 5m20s left -> shows 05, boundary in 20s
    vi.setSystemTime(now);
    const { container } = render(<LiveHeroCountdown targetDate={START} initialNow={now} comingSoonLabel={LABEL} />);
    expect(digits(container)[2]).toBe("05 MINUTES");
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(digits(container)[2]).toBe("05 MINUTES"); // remaining is exactly 5:00
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(digits(container)[2]).toBe("04 MINUTES");
  });

  it("hides Coming soon at zero and stops ticking (TC ID-41/42)", () => {
    const now = startMs - 60_000;
    vi.setSystemTime(now);
    const { container, queryByText } = render(
      <LiveHeroCountdown targetDate={START} initialNow={now} comingSoonLabel={LABEL} />,
    );
    expect(queryByText(LABEL)).not.toBeNull();
    act(() => {
      vi.advanceTimersByTime(60_001);
    });
    expect(digits(container)).toEqual(["00 DAYS", "00 HOURS", "00 MINUTES"]);
    expect(queryByText(LABEL)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows 00s and no Coming soon when already started", () => {
    vi.setSystemTime(startMs + 1000);
    const { container, queryByText } = render(
      <LiveHeroCountdown targetDate={START} initialNow={startMs + 1000} comingSoonLabel={LABEL} />,
    );
    expect(digits(container)).toEqual(["00 DAYS", "00 HOURS", "00 MINUTES"]);
    expect(queryByText(LABEL)).toBeNull();
  });

  it.each([undefined, "", "garbage"])("renders 00s without crashing for invalid target %j (TC ID-60)", (target) => {
    vi.setSystemTime(startMs);
    const { container, queryByText } = render(
      <LiveHeroCountdown targetDate={target} initialNow={startMs} comingSoonLabel={LABEL} />,
    );
    expect(digits(container)).toEqual(["00 DAYS", "00 HOURS", "00 MINUTES"]);
    expect(queryByText(LABEL)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears its timer on unmount", () => {
    const now = startMs - 3 * 60_000;
    vi.setSystemTime(now);
    const { unmount } = render(<LiveHeroCountdown targetDate={START} initialNow={now} comingSoonLabel={LABEL} />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
