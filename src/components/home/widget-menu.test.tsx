// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WidgetMenu } from "./widget-menu";

const props = { label: "Thao tác nhanh", sendKudosLabel: "Gửi Kudos", backToTopLabel: "Về đầu trang" };

beforeEach(() => {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});
afterEach(cleanup);

describe("WidgetMenu", () => {
  it("opens with the two items and links Gửi Kudos to /kudos", () => {
    const { getByLabelText, getAllByRole, getByText, queryByRole } = render(<WidgetMenu {...props} />);
    expect(queryByRole("menu")).toBeNull();
    fireEvent.click(getByLabelText(props.label));
    expect(getAllByRole("menuitem")).toHaveLength(2);
    expect(getByText("Gửi Kudos").getAttribute("href")).toBe("/kudos");
  });

  it("scrolls to top and closes on Về đầu trang", () => {
    const { getByLabelText, getByText, queryByRole } = render(<WidgetMenu {...props} />);
    fireEvent.click(getByLabelText(props.label));
    fireEvent.click(getByText("Về đầu trang"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 });
    expect(queryByRole("menu")).toBeNull();
  });

  it("closes on Escape (focus back on the button) and outside click", () => {
    const { getByLabelText, queryByRole } = render(<WidgetMenu {...props} />);
    const button = getByLabelText(props.label);
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    fireEvent.mouseDown(document.body);
    expect(queryByRole("menu")).toBeNull();
  });

  it("reflects open state in aria-expanded", () => {
    const { getByLabelText } = render(<WidgetMenu {...props} />);
    const button = getByLabelText(props.label);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });
});
