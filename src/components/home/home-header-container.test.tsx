// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getHomeMessages } from "@/lib/i18n/home-dictionary";
import { HomeHeaderContainer, selectedNavIndex } from "./home-header-container";

let pathname = "/";
const refresh = vi.fn();
const setLocaleAction = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ refresh }),
}));
vi.mock("@/lib/i18n/set-locale-action", () => ({ setLocaleAction: (l: string) => setLocaleAction(l) }));
vi.mock("@/app/todo/sign-out-action", () => ({ signOutAction: vi.fn() }));

const vi_ = getHomeMessages("vi");

beforeEach(() => {
  pathname = "/";
  refresh.mockClear();
  setLocaleAction.mockReset();
  setLocaleAction.mockResolvedValue("en");
});
afterEach(cleanup);

describe("selectedNavIndex", () => {
  it("maps routes to nav indexes", () => {
    expect(selectedNavIndex("/")).toBe(0);
    expect(selectedNavIndex("/awards")).toBe(1);
    expect(selectedNavIndex("/awards/x")).toBe(1);
    expect(selectedNavIndex("/kudos")).toBe(2);
    expect(selectedNavIndex("/profile")).toBeUndefined();
  });
});

describe("HomeHeaderContainer", () => {
  it("shows the Login link (no bell/account) for a visitor", () => {
    const { getByText, queryByLabelText } = render(
      <HomeHeaderContainer initialLocale="vi" messages={vi_} viewer={{ signedIn: false }} />,
    );
    expect(getByText(vi_.header.loginLabel).getAttribute("href")).toBe("/login");
    expect(queryByLabelText(vi_.header.notificationsLabel)).toBeNull();
    expect(queryByLabelText(vi_.header.accountLabel)).toBeNull();
  });

  it("shows bell + account for a signed-in viewer, admin item only for admins", () => {
    const user = render(
      <HomeHeaderContainer initialLocale="vi" messages={vi_} viewer={{ signedIn: true, isAdmin: false }} />,
    );
    expect(user.queryByText(vi_.header.loginLabel)).toBeNull();
    fireEvent.click(user.getByLabelText(vi_.header.accountLabel));
    expect(user.getAllByRole("menuitem")).toHaveLength(2);
    cleanup();
    const admin = render(
      <HomeHeaderContainer initialLocale="vi" messages={vi_} viewer={{ signedIn: true, isAdmin: true }} />,
    );
    fireEvent.click(admin.getByLabelText(vi_.header.accountLabel));
    expect(admin.getAllByRole("menuitem")).toHaveLength(3);
  });

  it("marks the nav link of the current route as selected", () => {
    pathname = "/kudos";
    const { getByText } = render(
      <HomeHeaderContainer initialLocale="vi" messages={vi_} viewer={{ signedIn: false }} />,
    );
    expect(getByText(vi_.nav.kudos).getAttribute("aria-current")).toBe("page");
    expect(getByText(vi_.nav.about).getAttribute("aria-current")).toBeNull();
  });

  it("persists locale, refreshes and syncs html lang on language change", async () => {
    const { getByLabelText, getByText } = render(
      <HomeHeaderContainer initialLocale="vi" messages={vi_} viewer={{ signedIn: false }} />,
    );
    expect(document.documentElement.lang).toBe("vi");
    fireEvent.click(getByLabelText(vi_.header.languageLabel));
    fireEvent.click(getByText("EN"));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(setLocaleAction).toHaveBeenCalledWith("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("reverts the locale when persisting fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    setLocaleAction.mockRejectedValue(new Error("boom"));
    const { getByLabelText, getByText } = render(
      <HomeHeaderContainer initialLocale="vi" messages={vi_} viewer={{ signedIn: false }} />,
    );
    fireEvent.click(getByLabelText(vi_.header.languageLabel));
    fireEvent.click(getByText("EN"));
    await waitFor(() => expect(document.documentElement.lang).toBe("vi"));
    expect(refresh).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
