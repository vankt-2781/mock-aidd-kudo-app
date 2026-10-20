// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LanguageSelector } from "./language-selector";

afterEach(cleanup);

const trigger = () => screen.getByRole("button", { name: "Select language" });

describe("LanguageSelector", () => {
  it("TC011/TC034: vi shows VN and the flag; dropdown is closed initially", () => {
    const { container } = render(
      <LanguageSelector locale="vi" onLocaleChange={vi.fn()} languageLabel="Select language" />,
    );
    expect(trigger()).toHaveTextContent("VN");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(container.querySelector("img")).not.toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("TC035: en shows EN", () => {
    render(<LanguageSelector locale="en" onLocaleChange={vi.fn()} languageLabel="Select language" />);
    expect(trigger()).toHaveTextContent("EN");
  });

  it("TC012: unsupported locale value falls back to the VN option", () => {
    // Cast: simulates a tampered value reaching the component at runtime.
    render(
      <LanguageSelector
        locale={"fr" as unknown as "vi"}
        onLocaleChange={vi.fn()}
        languageLabel="Select language"
      />,
    );
    expect(trigger()).toHaveTextContent("VN");
  });

  it("TC032: opening lists VN/EN with the current one selected", async () => {
    render(<LanguageSelector locale="vi" onLocaleChange={vi.fn()} languageLabel="Select language" />);
    await userEvent.click(trigger());
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["VN", "EN"]);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  it("TC032: picking EN calls onLocaleChange('en') and closes the dropdown", async () => {
    const onLocaleChange = vi.fn();
    render(
      <LanguageSelector locale="vi" onLocaleChange={onLocaleChange} languageLabel="Select language" />,
    );
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("button", { name: "EN" }));
    expect(onLocaleChange).toHaveBeenCalledWith("en");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("TC032: trigger click toggles the dropdown closed again", async () => {
    render(<LanguageSelector locale="vi" onLocaleChange={vi.fn()} languageLabel="Select language" />);
    await userEvent.click(trigger());
    await userEvent.click(trigger());
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("TC032: Escape closes the dropdown", async () => {
    render(<LanguageSelector locale="vi" onLocaleChange={vi.fn()} languageLabel="Select language" />);
    await userEvent.click(trigger());
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("TC032: click outside closes the dropdown without changing locale", async () => {
    const onLocaleChange = vi.fn();
    render(
      <div>
        <span>outside</span>
        <LanguageSelector locale="vi" onLocaleChange={onLocaleChange} languageLabel="Select language" />
      </div>,
    );
    await userEvent.click(trigger());
    await userEvent.click(screen.getByText("outside"));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onLocaleChange).not.toHaveBeenCalled();
  });
});
