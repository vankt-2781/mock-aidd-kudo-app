import { describe, expect, it } from "vitest";

import { composeReducer, initialComposeState } from "./kudos-compose-reducer";
import type { ComposeImage } from "./kudos-compose-types";

const sunner = { id: "s1", name: "An", avatarUrl: "/a.png" };
const image = (over: Partial<ComposeImage> = {}): ComposeImage => ({
  id: "i1",
  url: "",
  alt: "a.png",
  status: "uploading",
  ...over,
});

describe("composeReducer", () => {
  it("starts empty with everything closed", () => {
    const s = initialComposeState();
    expect(s.submitting).toBe(false);
    expect(s.recipientOpen).toBe(false);
    expect(s.values.hashtags).toEqual([]);
  });

  it("picking a recipient fills it, closes the list and clears its error", () => {
    let s = composeReducer(initialComposeState(), { type: "setErrors", errors: { recipient: "x" } });
    s = composeReducer(s, { type: "setRecipientOpen", open: true });
    s = composeReducer(s, { type: "pickRecipient", sunner });
    expect(s.values.recipient).toEqual(sunner);
    expect(s.recipientOpen).toBe(false);
    expect(s.errors.recipient).toBeUndefined();
  });

  it("typing after a pick clears the recipient and opens the list", () => {
    let s = composeReducer(initialComposeState(), { type: "pickRecipient", sunner });
    s = composeReducer(s, { type: "setRecipientQuery", query: "B" });
    expect(s.values.recipient).toBeNull();
    expect(s.values.recipientQuery).toBe("B");
    expect(s.recipientOpen).toBe(true);
  });

  it("sets and removes hashtags, clearing the field error", () => {
    let s = composeReducer(initialComposeState(), { type: "setErrors", errors: { hashtags: "x" } });
    s = composeReducer(s, { type: "setHashtags", hashtags: ["A", "B"] });
    expect(s.values.hashtags.map((h) => h.id)).toEqual(["A", "B"]);
    expect(s.values.hashtags[0].label).toBe("#A");
    expect(s.errors.hashtags).toBeUndefined();
    s = composeReducer(s, { type: "removeHashtag", id: "A" });
    expect(s.values.hashtags.map((h) => h.id)).toEqual(["B"]);
  });

  it("hashtag error is shown without touching the selection", () => {
    let s = composeReducer(initialComposeState(), { type: "setHashtags", hashtags: ["A"] });
    s = composeReducer(s, { type: "setFieldError", field: "hashtags", message: "max" });
    expect(s.errors.hashtags).toBe("max");
    expect(s.values.hashtags).toHaveLength(1);
  });

  it("walks an image through uploading -> done / failed and ignores unknown ids", () => {
    let s = composeReducer(initialComposeState(), { type: "addImage", image: image() });
    s = composeReducer(s, { type: "imageDone", id: "i1", url: "https://x/y.png" });
    expect(s.values.images[0]).toMatchObject({ status: "done", url: "https://x/y.png" });
    s = composeReducer(s, { type: "imageStatus", id: "i1", status: "uploading" });
    s = composeReducer(s, { type: "imageFailed", id: "i1", error: "boom" });
    expect(s.values.images[0]).toMatchObject({ status: "failed", error: "boom" });
    const same = composeReducer(s, { type: "imageDone", id: "nope", url: "u" });
    expect(same).toBe(s);
  });

  it("clears the images error once every upload has settled to done", () => {
    let s = composeReducer(initialComposeState(), { type: "addImage", image: image() });
    s = composeReducer(s, { type: "setFieldError", field: "images", message: "wait" });
    s = composeReducer(s, { type: "imageDone", id: "i1", url: "https://x/y.png" });
    expect(s.errors.images).toBeUndefined();
  });

  it("keeps the images error while another image is still uploading", () => {
    let s = composeReducer(initialComposeState(), { type: "addImage", image: image() });
    s = composeReducer(s, { type: "addImage", image: { ...image(), id: "i2" } });
    s = composeReducer(s, { type: "setFieldError", field: "images", message: "wait" });
    s = composeReducer(s, { type: "imageDone", id: "i1", url: "https://x/y.png" });
    expect(s.errors.images).toBe("wait");
  });

  it("removes an image", () => {
    let s = composeReducer(initialComposeState(), { type: "addImage", image: image() });
    s = composeReducer(s, { type: "removeImage", id: "i1" });
    expect(s.values.images).toEqual([]);
  });

  it("submit start is a no-op while already submitting", () => {
    const s1 = composeReducer(initialComposeState(), { type: "submitStart" });
    expect(s1.submitting).toBe(true);
    expect(composeReducer(s1, { type: "submitStart" })).toBe(s1);
    expect(composeReducer(s1, { type: "submitEnd" }).submitting).toBe(false);
  });

  it("title and anonymous edits clear their errors; unchecking anonymous clears the name", () => {
    let s = composeReducer(initialComposeState(), { type: "setErrors", errors: { title: "t", anonymousName: "a" } });
    s = composeReducer(s, { type: "setTitle", title: "Hi" });
    expect(s.errors.title).toBeUndefined();
    s = composeReducer(s, { type: "setAnonymous", checked: true });
    s = composeReducer(s, { type: "setAnonymousName", name: "Ghost" });
    expect(s.errors.anonymousName).toBeUndefined();
    s = composeReducer(s, { type: "setAnonymous", checked: false });
    expect(s.values.anonymousName).toBe("");
  });

  it("closing one dropdown does not touch the other", () => {
    let s = composeReducer(initialComposeState(), { type: "setHashtagOpen", open: true });
    s = composeReducer(s, { type: "setRecipientOpen", open: true });
    expect(s.hashtagOpen).toBe(true);
  });
});
