// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosLinkDialog } from "./kudos-link-dialog";

afterEach(cleanup);

const labels = { title: "Insert link", urlLabel: "URL", urlPlaceholder: "https://", apply: "Apply", remove: "Remove link", invalid: "Invalid URL" };

function setup(initialUrl = "") {
  const onApply = vi.fn();
  const onRemove = vi.fn();
  const onClose = vi.fn();
  render(<KudosLinkDialog labels={labels} initialUrl={initialUrl} onApply={onApply} onRemove={onRemove} onClose={onClose} />);
  return { onApply, onRemove, onClose, input: screen.getByLabelText("URL") as HTMLInputElement };
}

describe("KudosLinkDialog", () => {
  it("applies a valid https url (trimmed)", () => {
    const { onApply, input } = setup();
    fireEvent.change(input, { target: { value: " https://a.com " } });
    fireEvent.click(screen.getByText("Apply"));
    expect(onApply).toHaveBeenCalledWith("https://a.com");
  });

  it("shows an inline error and does not apply javascript: urls", () => {
    const { onApply, input } = setup();
    fireEvent.change(input, { target: { value: "javascript:alert(1)" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Invalid URL");
  });

  it("removes the link when applying an empty url", () => {
    const { onApply, onRemove } = setup("https://old.com");
    fireEvent.change(screen.getByLabelText("URL"), { target: { value: "" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(onRemove).toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it("Escape closes the dialog without bubbling", () => {
    const parent = vi.fn();
    const onClose = vi.fn();
    render(
      <div onKeyDown={parent}>
        <KudosLinkDialog labels={labels} initialUrl="" onApply={() => {}} onRemove={() => {}} onClose={onClose} />
      </div>,
    );
    fireEvent.keyDown(screen.getByLabelText("URL"), { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
    expect(parent).not.toHaveBeenCalled();
  });
});
