// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { HomeNotificationBell } from "./home-notification-bell";

afterEach(cleanup);

describe("HomeNotificationBell", () => {
  it("renders no badge and opens the empty panel", () => {
    const { getByLabelText, queryByRole, getByRole, container } = render(
      <HomeNotificationBell label="Thông báo" emptyLabel="Chưa có thông báo" />,
    );
    expect(container.querySelector(".bg-\\[\\#D4271D\\]")).toBeNull();
    expect(queryByRole("dialog")).toBeNull();
    fireEvent.click(getByLabelText("Thông báo"));
    expect(getByRole("dialog").textContent).toBe("Chưa có thông báo");
  });

  it("closes on outside click and Escape", () => {
    const { getByLabelText, queryByRole } = render(
      <HomeNotificationBell label="Thông báo" emptyLabel="Chưa có thông báo" />,
    );
    const bell = getByLabelText("Thông báo");
    fireEvent.click(bell);
    fireEvent.mouseDown(document.body);
    expect(queryByRole("dialog")).toBeNull();
    fireEvent.click(bell);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(bell);
  });
});
