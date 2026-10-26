import { describe, expect, it } from "vitest";
import { validateComposeForm } from "./kudos-compose-form-validation";

const ok = { recipientId: "r1", hashtagCount: 1, title: "", anonymousName: "" };

describe("validateComposeForm", () => {
  it("passes with recipient, content and a hashtag", () => {
    expect(validateComposeForm(ok, { editorEmpty: false })).toEqual({});
  });
  it("flags every missing required field on an empty form", () => {
    expect(validateComposeForm({ ...ok, recipientId: null, hashtagCount: 0 }, { editorEmpty: true })).toEqual({
      recipient: "required",
      content: "required",
      hashtags: "required",
    });
  });
  it("treats a typed-but-unpicked recipient as missing (null id)", () => {
    expect(validateComposeForm({ ...ok, recipientId: null }, { editorEmpty: false })).toEqual({ recipient: "required" });
  });
  it("flags only content when editor is empty", () => {
    expect(validateComposeForm(ok, { editorEmpty: true })).toEqual({ content: "required" });
  });
  it("flags over-long title and anonymous name", () => {
    expect(
      validateComposeForm({ ...ok, title: "x".repeat(61), anonymousName: "y".repeat(31) }, { editorEmpty: false }),
    ).toEqual({ title: "tooLong", anonymousName: "tooLong" });
  });
  it("accepts boundary lengths", () => {
    expect(
      validateComposeForm({ ...ok, title: "x".repeat(60), anonymousName: "y".repeat(30) }, { editorEmpty: false }),
    ).toEqual({});
  });
});
