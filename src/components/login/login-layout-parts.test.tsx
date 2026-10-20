// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { loginDictionary } from "@/lib/i18n/login-dictionary";
import { LoginFooter } from "./login-footer";
import { LoginHeader } from "./login-header";
import { LoginHero } from "./login-hero";

afterEach(cleanup);

describe("LoginFooter", () => {
  it.each(["vi", "en"] as const)("TC013/TC035: renders the %s copyright text", (locale) => {
    const text = loginDictionary[locale].footerCopyright;
    render(<LoginFooter text={text} />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent(text);
  });
});

describe("LoginHeader", () => {
  it("TC034: renders the logo and the language selector on VN", () => {
    render(<LoginHeader locale="vi" onLocaleChange={vi.fn()} languageLabel="Chọn ngôn ngữ" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByAltText("Sun* Annual Awards 2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Chọn ngôn ngữ" })).toHaveTextContent("VN");
  });

  it("TC032: forwards locale changes from the selector", async () => {
    const onLocaleChange = vi.fn();
    render(<LoginHeader locale="vi" onLocaleChange={onLocaleChange} languageLabel="Chọn ngôn ngữ" />);
    await userEvent.click(screen.getByRole("button", { name: "Chọn ngôn ngữ" }));
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
  });
});

describe("LoginHero", () => {
  const heroProps = (locale: "vi" | "en") => ({
    subtitle: loginDictionary[locale].heroSubtitle,
    tagline: loginDictionary[locale].heroTagline,
    buttonLabel: loginDictionary[locale].loginButton,
  });

  it.each(["vi", "en"] as const)("TC034/TC035: renders %s hero texts, logo and button", (locale) => {
    render(<LoginHero {...heroProps(locale)} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByAltText("ROOT FURTHER")).toBeInTheDocument();
    expect(screen.getByText(loginDictionary[locale].heroSubtitle, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(loginDictionary[locale].heroTagline, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: loginDictionary[locale].loginButton })).toBeEnabled();
  });

  it("TC016/TC038: errorMessage renders as role=alert under the button", () => {
    render(<LoginHero {...heroProps("vi")} errorMessage={loginDictionary.vi.loginError} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Đăng nhập không thành công. Vui lòng thử lại.");
  });

  it("TC031: English error wording renders when supplied", () => {
    render(<LoginHero {...heroProps("en")} errorMessage={loginDictionary.en.loginError} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Sign-in failed. Please try again.");
  });

  it("TC034: no alert is rendered without an error", () => {
    render(<LoginHero {...heroProps("vi")} />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("TC014: loading disables the button; click invokes onLogin when idle", async () => {
    const onLogin = vi.fn();
    const { rerender } = render(<LoginHero {...heroProps("vi")} onLogin={onLogin} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onLogin).toHaveBeenCalledTimes(1);
    rerender(<LoginHero {...heroProps("vi")} onLogin={onLogin} loading />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
