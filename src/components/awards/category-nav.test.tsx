// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategoryNav } from "./category-nav";

const items = [
  { slug: "top-talent", label: "Top Talent" },
  { slug: "top-project", label: "Top Project" },
  { slug: "mvp", label: "MVP" },
];

let ioCallback: (() => void) | null = null;
const disconnect = vi.fn();
const rects: Record<string, { top: number; bottom: number }> = {};

class FakeIO {
  constructor(cb: () => void) {
    ioCallback = cb;
  }
  observe = vi.fn();
  disconnect = disconnect;
}

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches: reduce }) as unknown as typeof window.matchMedia;
}

function layout(activeIndex: number) {
  items.forEach((item, i) => {
    const top = (i - activeIndex) * 700;
    rects[item.slug] = { top, bottom: top + 700 };
  });
}

function mountDom() {
  render(
    <>
      <CategoryNav items={items} ariaLabel="Hệ thống giải thưởng" />
      {items.map((item) => (
        <section key={item.slug} id={item.slug}>
          <h2 tabIndex={-1}>{item.label} heading</h2>
        </section>
      ))}
    </>,
  );
  for (const item of items) {
    const el = document.getElementById(item.slug)!;
    el.scrollIntoView = vi.fn();
    el.getBoundingClientRect = () => ({ ...rects[item.slug] }) as DOMRect;
  }
}

const current = () => screen.getAllByRole("link").filter((a) => a.getAttribute("aria-current") === "true");
const fireSpy = () => act(() => ioCallback?.());

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", FakeIO);
  Object.defineProperty(window, "innerHeight", { value: 900, configurable: true });
  setReducedMotion(false);
  layout(0);
  window.history.replaceState(null, "", "/awards");
  ioCallback = null;
  disconnect.mockClear();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("CategoryNav scroll-spy and focus", () => {
  it("unknown hash falls back to the first item (TC ID-13)", () => {
    window.history.replaceState(null, "", "/awards#nope");
    mountDom();
    expect(current()).toHaveLength(1);
    expect(current()[0]).toHaveTextContent("Top Talent");
  });

  it("deep link /awards#slug sets that item active", () => {
    window.history.replaceState(null, "", "/awards#mvp");
    mountDom();
    expect(current()).toHaveLength(1);
    expect(current()[0]).toHaveTextContent("MVP");
  });

  it("scroll updates the single active item and never writes the hash", () => {
    const replace = vi.spyOn(window.history, "replaceState");
    const push = vi.spyOn(window.history, "pushState");
    mountDom();
    layout(1);
    fireSpy();
    expect(current()).toHaveLength(1);
    expect(current()[0]).toHaveTextContent("Top Project");
    layout(2);
    fireSpy();
    expect(current()[0]).toHaveTextContent("MVP");
    expect(replace).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("");
  });

  it("click scrolls, sets the hash, activates, and focuses the heading after the scroll settles", () => {
    vi.useFakeTimers();
    mountDom();
    fireEvent.click(screen.getByRole("link", { name: "MVP" }));
    expect(document.getElementById("mvp")!.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(window.location.hash).toBe("#mvp");
    expect(current()[0]).toHaveTextContent("MVP");
    expect(document.activeElement).not.toBe(document.querySelector("#mvp h2"));
    act(() => {
      window.dispatchEvent(new Event("scrollend"));
    });
    expect(document.activeElement).toBe(document.querySelector("#mvp h2"));
  });

  it("pauses the spy while a click scroll is in flight, then resumes", () => {
    vi.useFakeTimers();
    mountDom();
    fireEvent.click(screen.getByRole("link", { name: "MVP" }));
    layout(1); // intermediate position during smooth scroll
    fireSpy();
    expect(current()[0]).toHaveTextContent("MVP");
    act(() => {
      vi.advanceTimersByTime(1000); // fallback release
    });
    expect(document.activeElement).toBe(document.querySelector("#mvp h2"));
    fireSpy();
    expect(current()[0]).toHaveTextContent("Top Project");
  });

  it("reduced motion: instant scroll and immediate focus", async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    mountDom();
    await user.click(screen.getByRole("link", { name: "Top Project" }));
    expect(document.getElementById("top-project")!.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    expect(document.activeElement).toBe(document.querySelector("#top-project h2"));
  });

  it("missing section target: no throw, click not intercepted (browser handles the anchor)", () => {
    render(<CategoryNav items={items} ariaLabel="Hệ thống giải thưởng" />);
    const notPrevented = fireEvent.click(screen.getByRole("link", { name: "MVP" }));
    expect(notPrevented).toBe(true);
    expect(current()).toHaveLength(1);
  });

  it("hashchange (back/forward) updates the active item", () => {
    mountDom();
    act(() => {
      window.history.replaceState(null, "", "/awards#top-project");
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(current()[0]).toHaveTextContent("Top Project");
  });

  it("disconnects the observer on unmount", () => {
    mountDom();
    cleanup();
    expect(disconnect).toHaveBeenCalled();
  });
});
