import { describe, expect, it } from "vitest";

import { profileDirectionHref } from "./profile-direction-hrefs";

const ID = "00000000-0000-4000-8000-000000010100";

describe("profileDirectionHref", () => {
  it("builds the bare links when no id was given", () => {
    expect(profileDirectionHref("received", null)).toBe("/profile");
    expect(profileDirectionHref("sent", null)).toBe("/profile?dir=sent");
  });

  it("keeps an explicit own id", () => {
    expect(profileDirectionHref("received", ID)).toBe(`/profile?id=${ID}`);
    expect(profileDirectionHref("sent", ID)).toBe(`/profile?id=${ID}&dir=sent`);
  });
});
