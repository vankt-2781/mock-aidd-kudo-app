// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddLinkModal } from "./add-link-modal";
import { ADD_LINK_COPY_VI as copy } from "./add-link-validation";

afterEach(cleanup);

function setup() {
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(<AddLinkModal onSave={onSave} onClose={onClose} />);
  const text = screen.getByLabelText(copy.textLabel) as HTMLInputElement;
  const url = screen.getByLabelText(copy.urlLabel) as HTMLInputElement;
  const save = () => fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.save) }));
  return { onSave, onClose, text, url, save };
}
const type = (el: HTMLInputElement, value: string) => fireEvent.change(el, { target: { value } });

describe("AddLinkModal", () => {
  it("opens with the title and both fields empty", () => {
    const { text, url } = setup();
    expect(screen.getByText(copy.title)).toBeTruthy();
    expect(text.value).toBe("");
    expect(url.value).toBe("");
  });

  it("clicking a label focuses its input", () => {
    const { text } = setup();
    fireEvent.click(screen.getByText(copy.textLabel));
    expect(text.id).toBe("add-link-text");
    expect(screen.getByLabelText(copy.textLabel)).toBe(text);
  });

  it("Hủy closes without saving, and a double click is harmless", () => {
    const { onSave, onClose } = setup();
    const cancel = screen.getByRole("button", { name: new RegExp(copy.cancel) });
    fireEvent.doubleClick(cancel);
    fireEvent.click(cancel);
    fireEvent.click(cancel);
    expect(onClose).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("Esc closes without bubbling to the compose modal", () => {
    const parent = vi.fn();
    const onClose = vi.fn();
    render(
      <div onKeyDown={parent}>
        <AddLinkModal onSave={() => {}} onClose={onClose} />
      </div>,
    );
    fireEvent.keyDown(screen.getByLabelText(copy.textLabel), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(parent).not.toHaveBeenCalled();
  });

  it("Text: required, whitespace-only and >100 chars are rejected on blur", () => {
    const { text } = setup();
    fireEvent.blur(text);
    expect(screen.getByText(copy.textRequired)).toBeTruthy();
    type(text, "   ");
    fireEvent.blur(text);
    expect(screen.getByText(copy.textRequired)).toBeTruthy();
    type(text, "a".repeat(101));
    fireEvent.blur(text);
    expect(screen.getByText(copy.textTooLong)).toBeTruthy();
    type(text, "a".repeat(100));
    fireEvent.blur(text);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("Link: required, bad format, www and >2048 chars rejected; 2048 accepted", () => {
    const { url } = setup();
    fireEvent.blur(url);
    expect(screen.getByText(copy.urlRequired)).toBeTruthy();
    for (const bad of ["not a url", "www", "www.example.com", "ftp://example.com", "javascript:alert(1)"]) {
      type(url, bad);
      fireEvent.blur(url);
      expect(screen.getByRole("alert").textContent).toMatch(/URL/);
    }
    type(url, "https://a.co/" + "a".repeat(2048 - 13 + 1));
    fireEvent.blur(url);
    expect(screen.getByText(copy.urlTooLong)).toBeTruthy();
    type(url, "https://a.co/" + "a".repeat(2048 - 13));
    fireEvent.blur(url);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("save with errors shows both and keeps the modal open (no save, no close)", () => {
    const { onSave, onClose, save } = setup();
    save();
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(onSave).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("valid save hands back the text and the trimmed url", () => {
    const { onSave, text, url, save } = setup();
    type(text, "Docs");
    type(url, " https://example.com/x ");
    save();
    expect(onSave).toHaveBeenCalledWith({ text: "Docs", url: "https://example.com/x" });
  });
});
