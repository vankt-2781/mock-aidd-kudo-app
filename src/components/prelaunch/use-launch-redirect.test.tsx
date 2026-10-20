// @vitest-environment jsdom
import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

import { useLaunchRedirect } from "./use-launch-redirect";

describe("useLaunchRedirect", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    replace.mockClear();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("never redirects while inactive", () => {
    renderHook(() => useLaunchRedirect(false));
    vi.advanceTimersByTime(60_000);
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to / once after 1500 ms, then retries every 5000 ms", () => {
    renderHook(() => useLaunchRedirect(true));
    vi.advanceTimersByTime(1499);
    expect(replace).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/");
    vi.advanceTimersByTime(4999);
    expect(replace).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(replace).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(5000);
    expect(replace).toHaveBeenCalledTimes(3);
  });

  it("starts when active flips to true", () => {
    const { rerender } = renderHook(({ active }) => useLaunchRedirect(active), {
      initialProps: { active: false },
    });
    vi.advanceTimersByTime(10_000);
    rerender({ active: true });
    vi.advanceTimersByTime(1500);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("clears timers on unmount", () => {
    const { unmount } = renderHook(() => useLaunchRedirect(true));
    vi.advanceTimersByTime(1500);
    unmount();
    vi.advanceTimersByTime(30_000);
    expect(replace).toHaveBeenCalledTimes(1);
  });
});
