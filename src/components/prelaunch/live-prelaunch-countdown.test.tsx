// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- test stub for next/image
  default: () => <img alt="" />,
}));

import { LivePrelaunchCountdown } from "./live-prelaunch-countdown";

const START = "2025-12-26T18:30:00+07:00";
const startMs = Date.parse(START);
const LABELS = { days: "DAYS", hours: "HOURS", minutes: "MINUTES" };

function units(container: HTMLElement) {
  return Array.from(container.querySelectorAll('[role="group"]')).map((el) => el.getAttribute("aria-label"));
}

function setup(initialNow: number, title = "Event starts in") {
  vi.setSystemTime(initialNow);
  return render(<LivePrelaunchCountdown startAtIso={START} initialNow={initialNow} title={title} labels={LABELS} />);
}

describe("LivePrelaunchCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replace.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders padded values and passes title through", () => {
    const { container, getByText } = setup(startMs - (2 * 1440 + 5 * 60 + 9) * 60_000);
    expect(units(container)).toEqual(["02 DAYS", "05 HOURS", "09 MINUTES"]);
    expect(getByText("Event starts in")).toBeTruthy();
  });

  it("decrements minutes as time advances", () => {
    const { container } = setup(startMs - 10 * 60_000);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(units(container)).toEqual(["00 DAYS", "00 HOURS", "09 MINUTES"]);
  });

  it("caps days at 99", () => {
    const { container } = setup(startMs - 150 * 1440 * 60_000);
    expect(units(container)[0]).toBe("99 DAYS");
  });

  it("shows zeros at start and redirects after 1.5 s", () => {
    const { container } = setup(startMs);
    expect(units(container)).toEqual(["00 DAYS", "00 HOURS", "00 MINUTES"]);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("does not redirect before zero", () => {
    setup(startMs - 5 * 60_000);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it("flips to zero and redirects when the clock crosses the start", () => {
    const { container } = setup(startMs - 2000);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(units(container)).toEqual(["00 DAYS", "00 HOURS", "00 MINUTES"]);
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(replace).toHaveBeenCalledTimes(1);
  });
});
