// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const signInWithOAuth = vi.fn();
const setLocaleAction = vi.fn();

vi.mock("@/lib/supabase/supabase-browser-client", () => ({
  createSupabaseBrowserClient: () => ({ auth: { signInWithOAuth } }),
}));
vi.mock("@/lib/i18n/set-locale-action", () => ({
  setLocaleAction: (v: string) => setLocaleAction(v),
}));

import { LoginPageClient } from "./login-page-client";

const VI_ERROR = "Đăng nhập không thành công. Vui lòng thử lại.";
const EN_ERROR = "Sign-in failed. Please try again.";
const loginButton = () => screen.getByRole("button", { name: "LOGIN With Google" });

beforeEach(() => {
  signInWithOAuth.mockReset();
  setLocaleAction.mockReset().mockResolvedValue("en");
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("LoginPageClient", () => {
  it("TC034: first visit renders VN selector, Vietnamese text, enabled button, no alert", () => {
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    expect(screen.getByRole("button", { name: "Chọn ngôn ngữ" })).toHaveTextContent("VN");
    expect(screen.getByText("Bắt đầu hành trình của bạn cùng SAA 2025.", { exact: false })).toBeInTheDocument();
    expect(loginButton()).toBeEnabled();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.documentElement.lang).toBe("vi");
  });

  it("TC016/TC038: initialHasError shows the error and a usable button", () => {
    render(<LoginPageClient initialLocale="vi" initialHasError />);
    expect(screen.getByRole("alert")).toHaveTextContent(VI_ERROR);
    expect(loginButton()).toBeEnabled();
  });

  it("TC014/TC018/TC036: click -> loading (disabled) and signInWithOAuth called with google + callback redirectTo", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {})); // browser navigating away
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.click(loginButton());
    expect(loginButton()).toBeDisabled();
    expect(loginButton()).toHaveAttribute("aria-busy", "true");
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
    });
  });

  it("returnTo=/kudos is carried on the callback redirectTo", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    render(<LoginPageClient initialLocale="vi" initialHasError={false} returnTo="/kudos" />);
    await userEvent.click(loginButton());
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=%2Fkudos`, queryParams: { prompt: "select_account" } },
    });
  });

  it("returnTo=null keeps the plain callback redirectTo", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    render(<LoginPageClient initialLocale="vi" initialHasError={false} returnTo={null} />);
    await userEvent.click(loginButton());
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
    });
  });

  it("TC024: repeated clicks while loading start exactly one sign-in", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.dblClick(loginButton());
    await userEvent.click(loginButton());
    expect(signInWithOAuth).toHaveBeenCalledTimes(1);
  });

  it("TC019: SDK error returns to idle with the error message and no retry loop", async () => {
    signInWithOAuth.mockResolvedValue({ error: new Error("provider not configured") });
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.click(loginButton());
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(VI_ERROR));
    expect(loginButton()).toBeEnabled();
    expect(signInWithOAuth).toHaveBeenCalledTimes(1);
  });

  it("TC019/TC029: thrown rejection is handled the same way", async () => {
    signInWithOAuth.mockRejectedValue(new Error("network"));
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.click(loginButton());
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(loginButton()).toBeEnabled();
  });

  it("TC017: clicking again from error clears the message and re-enters loading", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    render(<LoginPageClient initialLocale="vi" initialHasError />);
    await userEvent.click(loginButton());
    expect(screen.queryByRole("alert")).toBeNull();
    expect(loginButton()).toBeDisabled();
  });

  it("TC015: pageshow with persisted=true (Back from Google) re-enables the button", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.click(loginButton());
    expect(loginButton()).toBeDisabled();
    act(() => {
      const ev = new Event("pageshow") as PageTransitionEvent;
      Object.defineProperty(ev, "persisted", { value: true });
      window.dispatchEvent(ev);
    });
    expect(loginButton()).toBeEnabled();
  });

  it("TC015: non-persisted pageshow leaves loading untouched", async () => {
    signInWithOAuth.mockReturnValue(new Promise(() => {}));
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.click(loginButton());
    act(() => {
      const ev = new Event("pageshow") as PageTransitionEvent;
      Object.defineProperty(ev, "persisted", { value: false });
      window.dispatchEvent(ev);
    });
    expect(loginButton()).toBeDisabled();
  });

  it("TC032/TC035: picking EN switches all text, sets <html lang>, persists via setLocaleAction", async () => {
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Chọn ngôn ngữ" }));
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("button", { name: "Select language" })).toHaveTextContent("EN");
    expect(screen.getByText("Begin your journey with SAA 2025.", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Copyright belongs to Sun* © 2025")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    await waitFor(() => expect(setLocaleAction).toHaveBeenCalledWith("en"));
  });

  it("TC031: visible error message is re-rendered in English after switching to EN", async () => {
    render(<LoginPageClient initialLocale="vi" initialHasError />);
    expect(screen.getByRole("alert")).toHaveTextContent(VI_ERROR);
    await userEvent.click(screen.getByRole("button", { name: "Chọn ngôn ngữ" }));
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("alert")).toHaveTextContent(EN_ERROR);
  });

  it("TC030: failed locale persistence is logged and the UI still switches", async () => {
    setLocaleAction.mockRejectedValue(new Error("cookies blocked"));
    render(<LoginPageClient initialLocale="vi" initialHasError={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Chọn ngôn ngữ" }));
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("button", { name: "Select language" })).toHaveTextContent("EN");
    await waitFor(() => expect(console.error).toHaveBeenCalled());
  });
});
