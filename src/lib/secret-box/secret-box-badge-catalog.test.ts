import { describe, expect, it } from "vitest";
import { SECRET_BOX_BADGE_KEYS, badgeFor, isBadgeKey, toBadgeSlots } from "./secret-box-badge-catalog";

describe("secret box badge catalog", () => {
  it("lists the six keys in weight order", () => {
    expect(SECRET_BOX_BADGE_KEYS).toEqual([
      "stay_gold",
      "flow_to_horizon",
      "beyond_the_boundary",
      "root_further",
      "touch_of_light",
      "revival",
    ]);
  });

  it("recognises only catalog keys", () => {
    expect(isBadgeKey("revival")).toBe(true);
    expect(isBadgeKey("nope")).toBe(false);
    expect(isBadgeKey(null)).toBe(false);
  });

  it("resolves known keys to name and image", () => {
    expect(badgeFor("touch_of_light")).toEqual({
      key: "touch_of_light",
      name: "Touch of Light",
      imageUrl: "/images/secret-box/badges/touch-of-light.png",
    });
    expect(badgeFor("stay_gold").imageUrl).toBe("/images/secret-box/badges/stay-gold.svg");
  });

  it("falls back for unknown or null keys", () => {
    for (const key of ["zzz", null, undefined]) {
      const entry = badgeFor(key);
      expect(entry.key).toBe("unknown");
      expect(entry.name).toBe("Secret Box badge");
      expect(entry.imageUrl).toBe("/images/secret-box/secret-box-closed.svg");
    }
  });

  it("always returns six slots in fixed order", () => {
    const slots = toBadgeSlots([]);
    expect(slots.map((s) => s.id)).toEqual([...SECRET_BOX_BADGE_KEYS]);
    expect(slots.every((s) => !s.unlocked)).toBe(true);
  });

  it("unlocks owned keys, ignoring duplicates and unknown keys", () => {
    const slots = toBadgeSlots(["revival", "revival", "bogus", "stay_gold"]);
    expect(slots).toHaveLength(6);
    expect(slots.filter((s) => s.unlocked).map((s) => s.id)).toEqual(["stay_gold", "revival"]);
    expect(slots[0]).toEqual({
      id: "stay_gold",
      label: "Stay Gold",
      unlocked: true,
      imageSrc: "/images/secret-box/badges/stay-gold.svg",
    });
  });
});
