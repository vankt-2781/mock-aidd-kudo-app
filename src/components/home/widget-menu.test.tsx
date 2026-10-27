// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetMenu } from "./widget-menu";

const props = { label: "Thao tác nhanh", sendKudosLabel: "Viết KUDOS", viewRulesLabel: "Thể lệ" };

const rulesPanel = () => document.querySelector('[data-testid="rules-panel"]');

afterEach(cleanup);

describe("WidgetMenu", () => {
  it("opens with the two items and links Viết KUDOS to /kudos", () => {
    const { getByLabelText, getAllByRole, getByRole, queryByRole } = render(<WidgetMenu {...props} />);
    expect(queryByRole("menu")).toBeNull();
    fireEvent.click(getByLabelText(props.label));
    expect(getAllByRole("menuitem")).toHaveLength(2);
    expect(getByRole("menuitem", { name: "Viết KUDOS" }).getAttribute("href")).toBe("/kudos");
  });

  it("opens the rules panel and closes the menu on Thể lệ; Đóng closes the panel", () => {
    const { getByLabelText, getByRole, getByText, queryByRole } = render(<WidgetMenu {...props} />);
    fireEvent.click(getByLabelText(props.label));
    expect(rulesPanel()?.hasAttribute("open")).toBe(false);
    fireEvent.click(getByRole("menuitem", { name: "Thể lệ" }));
    expect(queryByRole("menu")).toBeNull();
    expect(rulesPanel()?.hasAttribute("open")).toBe(true);
    fireEvent.click(getByText("Đóng"));
    expect(rulesPanel()?.hasAttribute("open")).toBe(false);
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
