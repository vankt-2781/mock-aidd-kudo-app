import { describe, expect, it } from "vitest";
import { profileCopy } from "../../components/profile/profile-copy";
import { kudosDictionary } from "./kudos-dictionary";
import { LOCALES } from "./locale";
import { formatProfileCopy, getProfileMessages, profileDictionary } from "./profile-dictionary";

function shape(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
}

describe("profile dictionary", () => {
  it("vi and en expose the identical key shape with non-empty strings", () => {
    expect(shape(profileDictionary.en)).toEqual(shape(profileDictionary.vi));
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(profileDictionary[locale])) {
        if (typeof value === "string") expect(value.trim(), `${locale}.${key}`).not.toBe("");
      }
    }
  });

  it("vi copy matches the Figma-sourced profile-copy and the plan literals", () => {
    const vi = getProfileMessages("vi");
    expect(vi.badgeCollectionHeadingSelf).toBe(profileCopy.badgeCollectionHeading);
    expect(vi.sectionCaption).toBe(profileCopy.sectionCaption);
    expect(vi.sectionTitle).toBe(profileCopy.sectionTitle);
    expect(formatProfileCopy(vi.directionReceived, { count: 5 })).toBe(profileCopy.directionReceived(5));
    expect(formatProfileCopy(vi.directionSent, { count: 5 })).toBe(profileCopy.directionSent(5));
    expect(vi.directionListLabel).toBe(profileCopy.directionListLabel);
    expect(vi.badgeLockedSuffix).toBe(profileCopy.badgeLockedSuffix);
    expect(vi).toMatchObject({
      badgeCollectionHeadingOther: "Bộ sưu tập icon",
      staticReceivedLabel: "Đã nhận",
      emptyReceived: "Hiện tại chưa có Kudos nào.",
      emptySent: "Bạn chưa gửi Kudos nào.",
      writeBar: "Gửi lời cám ơn và ghi nhận đến {name}",
      anonymousChip: "Ẩn danh",
      openSecretBox: "Mở Secret Box",
      notFoundTitle: "Không tìm thấy hồ sơ",
      notFoundHome: "Về trang chủ",
    });
  });

  it.each(LOCALES)("%s reuses the kudos stats and heroLabels objects by identity", (locale) => {
    const messages = getProfileMessages(locale);
    expect(messages.stats).toBe(kudosDictionary[locale].stats);
    expect(messages.heroLabels).toBe(kudosDictionary[locale].heroLabels);
  });

  it("returns the locale's messages", () => {
    expect(getProfileMessages("en")).toBe(profileDictionary.en);
  });
});

describe("formatProfileCopy", () => {
  it("substitutes name and count placeholders", () => {
    expect(formatProfileCopy("Hi {name} ({count})", { name: "An", count: 3 })).toBe("Hi An (3)");
  });
  it("substitutes every occurrence and is not re-expanded by a name containing a placeholder", () => {
    expect(formatProfileCopy("{name}/{name}", { name: "{count}" })).toBe("{count}/{count}");
  });
  it("leaves unprovided placeholders untouched", () => {
    expect(formatProfileCopy("{name} ({count})", { count: 0 })).toBe("{name} (0)");
  });
});
