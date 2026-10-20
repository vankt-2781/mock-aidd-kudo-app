// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useDismissableMenu } from "./use-dismissable-menu";

function Harness() {
  const { open, toggle, close, containerRef, triggerRef } = useDismissableMenu();
  return (
    <div>
      <div ref={containerRef}>
        <button ref={triggerRef} onClick={toggle}>
          trigger
        </button>
        {open && (
          <button role="menuitem" onClick={() => close()}>
            item
          </button>
        )}
      </div>
      <p>outside</p>
    </div>
  );
}

afterEach(cleanup);

describe("useDismissableMenu", () => {
  it("toggles on trigger click", () => {
    const { getByText, queryByRole } = render(<Harness />);
    expect(queryByRole("menuitem")).toBeNull();
    fireEvent.click(getByText("trigger"));
    expect(queryByRole("menuitem")).not.toBeNull();
    fireEvent.click(getByText("trigger"));
    expect(queryByRole("menuitem")).toBeNull();
  });

  it("closes on outside mousedown but not inside", () => {
    const { getByText, queryByRole } = render(<Harness />);
    fireEvent.click(getByText("trigger"));
    fireEvent.mouseDown(getByText("item"));
    expect(queryByRole("menuitem")).not.toBeNull();
    fireEvent.mouseDown(getByText("outside"));
    expect(queryByRole("menuitem")).toBeNull();
  });

  it("closes on Escape and returns focus to the trigger", () => {
    const { getByText, queryByRole } = render(<Harness />);
    const trigger = getByText("trigger");
    fireEvent.click(trigger);
    act(() => getByText("item").focus());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(queryByRole("menuitem")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when an item is selected", () => {
    const { getByText, queryByRole } = render(<Harness />);
    fireEvent.click(getByText("trigger"));
    fireEvent.click(getByText("item"));
    expect(queryByRole("menuitem")).toBeNull();
  });
});
