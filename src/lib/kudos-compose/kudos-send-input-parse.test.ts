import { describe, expect, it } from "vitest";
import { parseSendKudosInput, type SendKudosContext } from "./kudos-send-input-parse";

const UID = "6f1c2f1e-8a3b-4c55-9d1e-0a1b2c3d4e5f";
const PATH = `${UID}/11111111-2222-4333-8444-555555555555`;
const ME = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const BASE = "http://127.0.0.1:54321/storage/v1/object/public";
const ctx: SendKudosContext = {
  viewerProfileId: ME,
  existingHashtags: ["IDOL GIỚI TRẺ", "Pioneer"],
  storagePublicBase: BASE,
};
const valid = {
  receiverId: OTHER,
  title: " Cảm ơn ",
  contentHtml: "<p>Hello</p>",
  hashtags: ["Pioneer"],
  images: [] as string[],
  isAnonymous: false,
  anonymousName: "",
};
const fields = (raw: unknown) => {
  const r = parseSendKudosInput(raw, ctx);
  return r.ok ? null : r.fields;
};

describe("parseSendKudosInput", () => {
  it("returns a typed, trimmed value for valid input", () => {
    const r = parseSendKudosInput(valid, ctx);
    expect(r).toEqual({
      ok: true,
      value: {
        receiverId: OTHER,
        title: "Cảm ơn",
        html: "<p>Hello</p>",
        text: "Hello",
        hashtags: ["Pioneer"],
        images: [],
        isAnonymous: false,
        anonymousName: null,
      },
    });
  });

  it("rejects non-object payloads", () => {
    expect(fields(null)).not.toBeNull();
    expect(fields("x")).not.toBeNull();
  });

  it("recipient: non-uuid, self, missing", () => {
    expect(fields({ ...valid, receiverId: "nope" })).toContain("recipient");
    expect(fields({ ...valid, receiverId: ME })).toContain("recipient");
    expect(fields({ ...valid, receiverId: undefined })).toContain("recipient");
  });

  it("content: blank text, script-only, over 5000 chars, raw html too large, non-string", () => {
    expect(fields({ ...valid, contentHtml: "<p> </p>" })).toContain("content");
    expect(fields({ ...valid, contentHtml: "<script>x</script>" })).toContain("content");
    expect(fields({ ...valid, contentHtml: `<p>${"a".repeat(5001)}</p>` })).toContain("content");
    expect(fields({ ...valid, contentHtml: `<p>${"a ".repeat(30_000)}</p>` })).toContain("content");
    expect(fields({ ...valid, contentHtml: 5 })).toContain("content");
  });

  it("content: exactly 5000 chars is fine and html is sanitized", () => {
    const r = parseSendKudosInput({ ...valid, contentHtml: `<p onclick="x">${"a".repeat(5000)}</p>` }, ctx);
    expect(r.ok && r.value.html.startsWith("<p>")).toBe(true);
  });

  it("title: over 60 rejected, blank becomes null", () => {
    expect(fields({ ...valid, title: "x".repeat(61) })).toContain("title");
    const r = parseSendKudosInput({ ...valid, title: "   " }, ctx);
    expect(r.ok && r.value.title).toBeNull();
  });

  it("hashtags: 0, 6, bad charset, too long, non-array, dedupe, existing spaced tag", () => {
    expect(fields({ ...valid, hashtags: [] })).toContain("hashtags");
    expect(fields({ ...valid, hashtags: ["a", "b", "c", "d", "e", "f"] })).toContain("hashtags");
    expect(fields({ ...valid, hashtags: ["a-b"] })).toContain("hashtags");
    expect(fields({ ...valid, hashtags: ["x".repeat(31)] })).toContain("hashtags");
    expect(fields({ ...valid, hashtags: "a" })).toContain("hashtags");
    expect(fields({ ...valid, hashtags: [1] })).toContain("hashtags");
    const r = parseSendKudosInput({ ...valid, hashtags: ["#pioneer", "PIONEER", "idol giới trẻ"] }, ctx);
    expect(r.ok && r.value.hashtags).toEqual(["Pioneer", "IDOL GIỚI TRẺ"]);
  });

  it("images: reserved-shape ok; more than 5, nested path, external rejected", () => {
    const own = (n: number) => `${BASE}/kudos-images/${UID}/00000000-0000-4000-8000-00000000000${n}.png`;
    const six = [1, 2, 3, 4, 5, 6].map(own);
    expect(parseSendKudosInput({ ...valid, images: six.slice(0, 5) }, ctx).ok).toBe(true);
    expect(fields({ ...valid, images: six })).toContain("images");
    expect(fields({ ...valid, images: [`${BASE}/kudos-images/${PATH}/a.png`] })).toContain("images");
    expect(fields({ ...valid, images: ["https://evil.test/a.png"] })).toContain("images");
    expect(fields({ ...valid, images: "x" })).toContain("images");
  });

  it("anonymous: name kept only when anonymous, bounded to 30", () => {
    const a = parseSendKudosInput({ ...valid, isAnonymous: true, anonymousName: " Bí mật " }, ctx);
    expect(a.ok && a.value.anonymousName).toBe("Bí mật");
    const n = parseSendKudosInput({ ...valid, isAnonymous: false, anonymousName: "ghost" }, ctx);
    expect(n.ok && n.value.anonymousName).toBeNull();
    expect(fields({ ...valid, isAnonymous: true, anonymousName: "x".repeat(31) })).toContain("anonymousName");
    expect(fields({ ...valid, isAnonymous: "yes" })).not.toBeNull();
  });

  it("ignores a forged sender id", () => {
    const r = parseSendKudosInput({ ...valid, senderId: OTHER, sender_id: OTHER }, ctx);
    expect(r.ok && "senderId" in r.value).toBe(false);
  });

  it("reports every failing field at once", () => {
    expect(fields({ ...valid, receiverId: "x", contentHtml: "", hashtags: [] })).toEqual(
      expect.arrayContaining(["recipient", "content", "hashtags"]),
    );
  });
});
