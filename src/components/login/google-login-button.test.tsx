// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GoogleLoginButton } from "./google-login-button";

afterEach(cleanup);

describe("GoogleLoginButton", () => {
  it("TC034: idle state renders the label, Google icon and is enabled", () => {
    const { container } = render(<GoogleLoginButton label="LOGIN With Google" />);
    const button = screen.getByRole("button", { name: "LOGIN With Google" });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute("aria-busy", "false");
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("TC014/TC036: loading state disables the button and shows a loader instead of the icon", () => {
    const { container } = render(<GoogleLoginButton label="LOGIN With Google" loading />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  it("TC014: click in idle calls onLogin once", async () => {
    const onLogin = vi.fn();
    render(<GoogleLoginButton label="Go" onLogin={onLogin} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("TC024: clicks while loading are ignored", async () => {
    const onLogin = vi.fn();
    render(<GoogleLoginButton label="Go" onLogin={onLogin} loading />);
    await userEvent.dblClick(screen.getByRole("button"));
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("TC014: disabled prop also blocks clicks", async () => {
    const onLogin = vi.fn();
    render(<GoogleLoginButton label="Go" onLogin={onLogin} disabled />);
    await userEvent.click(screen.getByRole("button"));
    expect(onLogin).not.toHaveBeenCalled();
  });
});
