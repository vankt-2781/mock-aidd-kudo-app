// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeScrollLink } from "./home-scroll-link";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

describe("HomeScrollLink", () => {
  it("scrolls to top instead of navigating when href equals the current path", () => {
    pathname = "/";
    const { getByText } = render(<HomeScrollLink href="/">home</HomeScrollLink>);
    const notPrevented = fireEvent.click(getByText("home"));
    expect(notPrevented).toBe(false);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 });
  });

  it("lets navigation proceed for a different path", () => {
    pathname = "/awards";
    const { getByText } = render(<HomeScrollLink href="/kudos">kudos</HomeScrollLink>);
    const notPrevented = fireEvent.click(getByText("kudos"));
    expect(notPrevented).toBe(true);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("does not hijack modified clicks", () => {
    pathname = "/";
    const { getByText } = render(<HomeScrollLink href="/">home</HomeScrollLink>);
    fireEvent.click(getByText("home"), { ctrlKey: true });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
