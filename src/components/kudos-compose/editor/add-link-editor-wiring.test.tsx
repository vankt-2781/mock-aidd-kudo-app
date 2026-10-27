// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ADD_LINK_COPY_VI as copy } from "./add-link-validation";
import { KudosEditor, type KudosEditorChange, type KudosEditorHandle } from "./kudos-editor";

afterEach(cleanup);

const emptyRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
const zeroRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect;
Range.prototype.getClientRects = emptyRects;
Range.prototype.getBoundingClientRect = zeroRect;
Element.prototype.getClientRects = emptyRects;

const messages = {
  placeholder: "p",
  mentionEmpty: "none",
  ariaLabel: "Kudos content",
  link: { title: "", urlLabel: "URL", urlPlaceholder: "", apply: "", remove: "", invalid: "" },
};

async function mount() {
  const ref = createRef<KudosEditorHandle>();
  const onChange = vi.fn<(c: KudosEditorChange) => void>();
  render(<KudosEditor messages={messages} mentionProvider={async () => []} editorRef={ref} onChange={onChange} />);
  await waitFor(() => expect(screen.getByRole("textbox")).toBeTruthy());
  return { ref, onChange };
}

describe("toolbar link -> Add Link modal", () => {
  it("opens one modal, saves a link with the typed text, then closes", async () => {
    const { ref, onChange } = await mount();
    act(() => ref.current?.toggle("link"));
    act(() => ref.current?.toggle("link"));
    expect(screen.getAllByLabelText(copy.textLabel)).toHaveLength(1);
    fireEvent.change(screen.getByLabelText(copy.textLabel), { target: { value: "Docs" } });
    fireEvent.change(screen.getByLabelText(copy.urlLabel), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.save) }));
    await waitFor(() => expect(onChange.mock.lastCall?.[0].html).toContain('href="https://example.com"'));
    expect(onChange.mock.lastCall?.[0].text).toBe("Docs");
    expect(screen.queryByLabelText(copy.textLabel)).toBeNull();
  });

  it("toggle inside an existing link removes it instead of opening the modal", async () => {
    const { ref, onChange } = await mount();
    act(() => ref.current?.toggle("link"));
    fireEvent.change(screen.getByLabelText(copy.textLabel), { target: { value: "Docs" } });
    fireEvent.change(screen.getByLabelText(copy.urlLabel), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByRole("button", { name: new RegExp(copy.save) }));
    await waitFor(() => expect(onChange.mock.lastCall?.[0].html).toContain("<a "));
    const anchorText = screen.getByRole("textbox").querySelector("a")!.firstChild!;
    // ProseMirror syncs DOM selection asynchronously; retry until the editor reports the cursor inside the link.
    await waitFor(() => {
      act(() => {
        window.getSelection()?.setBaseAndExtent(anchorText, 2, anchorText, 2);
        document.dispatchEvent(new Event("selectionchange"));
      });
      expect(ref.current?.isActive("link")).toBe(true);
    });
    act(() => ref.current?.toggle("link"));
    await waitFor(() => expect(onChange.mock.lastCall?.[0].html).not.toContain("<a "));
    expect(screen.queryByLabelText(copy.textLabel)).toBeNull();
  });
});
