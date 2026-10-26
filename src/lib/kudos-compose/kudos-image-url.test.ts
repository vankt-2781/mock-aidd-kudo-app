import { describe, expect, it } from "vitest";
import { isKudosImageUrl } from "./kudos-image-url";

const BASE = "http://127.0.0.1:54321/storage/v1/object/public";
const A = "6f1c2f1e-8a3b-4c55-9d1e-0a1b2c3d4e5f";
const B = "11111111-2222-4333-8444-555555555555";
const ok = `${BASE}/kudos-images/${A}/${B}`;

describe("isKudosImageUrl", () => {
  it("accepts jpg, jpeg and png reserved-shape paths", () => {
    expect(isKudosImageUrl(`${ok}.jpg`, BASE)).toBe(true);
    expect(isKudosImageUrl(`${ok}.jpeg`, BASE)).toBe(true);
    expect(isKudosImageUrl(`${ok}.png`, BASE)).toBe(true);
  });
  it.each([
    ["other bucket", `${BASE}/avatars/${A}/${B}.jpg`],
    ["external host", `https://evil.test/storage/v1/object/public/kudos-images/${A}/${B}.jpg`],
    ["gif", `${ok}.gif`],
    ["traversal", `${BASE}/kudos-images/${A}/../${B}.jpg`],
    ["legacy named file", `${BASE}/kudos-images/${A}/a.jpg`],
    ["subfolder", `${BASE}/kudos-images/${A}/x/${B}.jpg`],
    ["query string", `${ok}.jpg?x=1`],
    ["uppercase uuid", `${BASE}/kudos-images/${A.toUpperCase()}/${B}.jpg`],
    ["over 500 chars", `${ok}.jpg${"a".repeat(500)}`],
  ])("rejects %s", (_n, url) => {
    expect(isKudosImageUrl(url, BASE)).toBe(false);
  });
  it("rejects non-strings", () => {
    expect(isKudosImageUrl(42, BASE)).toBe(false);
  });
});
