// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeAccountMenu } from "./home-account-menu";

vi.mock("@/app/todo/sign-out-action", () => ({ signOutAction: vi.fn() }));

const BASE = [
  { key: "profile", label: "Profile" },
  { key: "signOut", label: "Logout" },
] as const;
const ADMIN = [...BASE, { key: "adminDashboard", label: "Admin Dashboard" }] as const;

afterEach(cleanup);

describe("HomeAccountMenu", () => {
  it("is closed initially and opens on trigger click", () => {
    const { getByLabelText, queryByRole } = render(<HomeAccountMenu accountLabel="Account" items={[...BASE]} />);
    expect(queryByRole("menu")).toBeNull();
    fireEvent.click(getByLabelText("Account"));
    expect(queryByRole("menu")).not.toBeNull();
  });

  it("shows 2 items for a normal user and 3 for an admin", () => {
    const normal = render(<HomeAccountMenu accountLabel="Account" items={[...BASE]} />);
    fireEvent.click(normal.getByLabelText("Account"));
    expect(normal.getAllByRole("menuitem")).toHaveLength(2);
    cleanup();
    const admin = render(<HomeAccountMenu accountLabel="Account" items={[...ADMIN]} />);
    fireEvent.click(admin.getByLabelText("Account"));
    expect(admin.getAllByRole("menuitem").map((e) => e.textContent)).toEqual([
      "Profile",
      "Logout",
      "Admin Dashboard",
    ]);
  });

  it("links Profile and Admin Dashboard and posts Logout via a form", () => {
    const { getByLabelText, getByText } = render(<HomeAccountMenu accountLabel="Account" items={[...ADMIN]} />);
    fireEvent.click(getByLabelText("Account"));
    expect(getByText("Profile").getAttribute("href")).toBe("/profile");
    expect(getByText("Admin Dashboard").getAttribute("href")).toBe("/admin");
    const signOut = getByText("Logout");
    expect(signOut.getAttribute("role")).toBe("menuitem");
    expect(signOut.closest("form")).not.toBeNull();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    const { getByLabelText, queryByRole } = render(<HomeAccountMenu accountLabel="Account" items={[...BASE]} />);
    const trigger = getByLabelText("Account");
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when a link item is selected", () => {
    const { getByLabelText, getByText, queryByRole } = render(
      <HomeAccountMenu accountLabel="Account" items={[...BASE]} />,
    );
    fireEvent.click(getByLabelText("Account"));
    fireEvent.click(getByText("Profile"));
    expect(queryByRole("menu")).toBeNull();
  });
});
