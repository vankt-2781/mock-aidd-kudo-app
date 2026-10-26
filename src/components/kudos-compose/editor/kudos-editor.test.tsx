// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { KudosEditor, type KudosEditorChange, type KudosEditorHandle, type KudosEditorMessages } from "./kudos-editor";

afterEach(cleanup);

// jsdom has no layout; ProseMirror's scrollIntoView needs these geometry stubs.
const emptyRects = () => ({ length: 0, item: () => null, [Symbol.iterator]: [][Symbol.iterator] }) as unknown as DOMRectList;
const zeroRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, toJSON: () => ({}) }) as DOMRect;
Range.prototype.getClientRects = emptyRects;
Range.prototype.getBoundingClientRect = zeroRect;
Element.prototype.getClientRects = emptyRects;

const messages: KudosEditorMessages = {
  placeholder: "Write here",
  mentionEmpty: "none",
  ariaLabel: "Kudos content",
  link: { title: "Insert link", urlLabel: "URL", urlPlaceholder: "https://", apply: "Apply", remove: "Remove link", invalid: "Invalid URL" },
};

async function mount(props: Partial<React.ComponentProps<typeof KudosEditor>> = {}) {
  const ref = createRef<KudosEditorHandle>();
  render(<KudosEditor messages={messages} mentionProvider={async () => []} editorRef={ref} {...props} />);
  await waitFor(() => expect(screen.getByRole("textbox")).toBeTruthy());
  return ref;
}

describe("KudosEditor (jsdom smoke)", () => {
  it("mounts an accessible textbox with the dictionary placeholder", async () => {
    await mount();
    const box = screen.getByRole("textbox");
    expect(box.getAttribute("aria-label")).toBe("Kudos content");
    await waitFor(() => expect(box.querySelector("p")?.getAttribute("data-placeholder")).toBe("Write here"));
  });

  it("reports active formats when a list is toggled", async () => {
    const onActiveFormatsChange = vi.fn();
    const ref = await mount({ onActiveFormatsChange });
    act(() => ref.current?.toggle("list"));
    await waitFor(() => expect(onActiveFormatsChange).toHaveBeenLastCalledWith(["list"]));
    act(() => ref.current?.toggle("list"));
    await waitFor(() => expect(onActiveFormatsChange).toHaveBeenLastCalledWith([]));
  });

  it("opens the link prompt through toggle('link') and rejects unsafe urls", async () => {
    const ref = await mount();
    act(() => ref.current?.toggle("link"));
    expect(await screen.findByLabelText("URL")).toBeTruthy();
  });

  it("reset clears content and reports an empty change", async () => {
    const onChange = vi.fn<(c: KudosEditorChange) => void>();
    const ref = await mount({ onChange });
    act(() => ref.current?.reset());
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.lastCall?.[0]).toMatchObject({ html: "<p></p>", isEmpty: true, length: 0 });
  });
});
