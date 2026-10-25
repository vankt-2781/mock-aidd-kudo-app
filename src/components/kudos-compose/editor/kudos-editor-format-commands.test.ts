import { describe, expect, it, vi } from "vitest";

import { COMPOSE_FORMATS, FORMAT_SPECS, collectActiveFormats } from "./kudos-editor-format-commands";
import { debounceShared } from "./kudos-editor-debounce";
import { isSafeLinkUrl, normalizeLinkUrl } from "./kudos-editor-url-check";
import { nextMentionIndex } from "./kudos-mention-keys";

describe("FORMAT_SPECS", () => {
  it("covers all six toolbar formats", () => {
    expect([...COMPOSE_FORMATS].sort()).toEqual(["bold", "italic", "link", "list", "quote", "strike"]);
    expect(Object.keys(FORMAT_SPECS).sort()).toEqual([...COMPOSE_FORMATS].sort());
  });

  it("maps formats to tiptap command + active names", () => {
    expect(FORMAT_SPECS.bold).toEqual({ command: "toggleBold", active: "bold" });
    expect(FORMAT_SPECS.italic).toEqual({ command: "toggleItalic", active: "italic" });
    expect(FORMAT_SPECS.strike).toEqual({ command: "toggleStrike", active: "strike" });
    expect(FORMAT_SPECS.list).toEqual({ command: "toggleOrderedList", active: "orderedList" });
    expect(FORMAT_SPECS.quote).toEqual({ command: "toggleBlockquote", active: "blockquote" });
    expect(FORMAT_SPECS.link.active).toBe("link");
  });

  it("collects active formats from an isActive predicate", () => {
    const active = collectActiveFormats((name) => name === "bold" || name === "orderedList");
    expect(active).toEqual(["bold", "list"]);
  });
});

describe("url check", () => {
  it.each(["http://a.com", "https://a.com/x?y=1", "mailto:a@b.com"])("accepts %s", (u) => {
    expect(isSafeLinkUrl(u)).toBe(true);
  });
  it.each(["javascript:alert(1)", "data:text/html,x", "/relative", "example.com", "", "  ", "JaVaScRiPt:1"])(
    "rejects %s",
    (u) => {
      expect(isSafeLinkUrl(u)).toBe(false);
    },
  );
  it("trims input", () => {
    expect(normalizeLinkUrl("  https://a.com ")).toBe("https://a.com");
  });
});

describe("nextMentionIndex", () => {
  it("wraps ArrowDown / ArrowUp", () => {
    expect(nextMentionIndex("ArrowDown", 2, 3)).toBe(0);
    expect(nextMentionIndex("ArrowUp", 0, 3)).toBe(2);
    expect(nextMentionIndex("ArrowDown", 0, 3)).toBe(1);
  });
  it("returns null for other keys or empty list", () => {
    expect(nextMentionIndex("a", 0, 3)).toBeNull();
    expect(nextMentionIndex("ArrowDown", 0, 0)).toBeNull();
  });
});

describe("debounceShared", () => {
  it("collapses rapid calls into one invocation resolved to all callers", async () => {
    vi.useFakeTimers();
    const fn = vi.fn(async (q: string) => [q]);
    const d = debounceShared(fn, 250);
    const a = d("a");
    const b = d("ab");
    await vi.advanceTimersByTimeAsync(250);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(await a).toEqual(["ab"]);
    expect(await b).toEqual(["ab"]);
    vi.useRealTimers();
  });

  it("rejects all callers when the provider fails", async () => {
    vi.useFakeTimers();
    const d = debounceShared(async () => { throw new Error("boom"); }, 10);
    const p = d("x").catch((e: Error) => e.message);
    await vi.advanceTimersByTimeAsync(10);
    expect(await p).toBe("boom");
    vi.useRealTimers();
  });
});
