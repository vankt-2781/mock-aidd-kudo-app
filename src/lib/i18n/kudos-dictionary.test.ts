import { describe, expect, it } from "vitest";
import { KUDOS_COPY } from "../../components/kudos/kudos-copy";
import { getKudosMessages, kudosDictionary } from "./kudos-dictionary";

/** Copy taken verbatim from the "Viết Kudo" Figma frames (mm:520:11602, mm:1002:13013). */
const FRAME_COPY = {
  title: "Gửi lời cám ơn và ghi nhận đến đồng đội",
  recipient: "Người nhận",
  recipientPlaceholder: "Tìm kiếm",
  badge: "Danh hiệu",
  badgePlaceholder: "Dành tặng một danh hiệu cho đồng đội",
  badgeHint: "Ví dụ: Người truyền động lực cho tôi.\nDanh hiệu sẽ hiển thị làm tiêu đề Kudos của bạn.",
  guidelines: "Tiêu chuẩn cộng đồng",
  editorPlaceholder: "Hãy gửi gắm lời cám ơn và ghi nhận đến đồng đội tại đây nhé!",
  mentionHint: "Bạn có thể “@ + tên” để nhắc tới đồng nghiệp khác",
  hashtag: "Hashtag",
  image: "Image",
  maxFive: "Tối đa 5",
  anonymous: "Gửi lời cám ơn và ghi nhận ẩn danh",
  anonymousNamePlaceholder: "Tên hiển thị ẩn danh",
  cancel: "Hủy",
  send: "Gửi",
  required: "Không được để trống",
  removeImage: "Xóa ảnh",
  removeHashtag: "Xóa hashtag",
} as const;

const COMPOSE_FORMAT_LABELS = {
  bold: "In đậm",
  italic: "In nghiêng",
  strike: "Gạch ngang",
  list: "Danh sách đánh số",
  link: "Chèn liên kết",
  quote: "Trích dẫn",
} as const;

function shape(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k));
}

function leaves(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(leaves);
}

describe("kudos dictionary", () => {
  it("has identical deep key shape in vi and en", () => {
    expect(shape(kudosDictionary.en).sort()).toEqual(shape(kudosDictionary.vi).sort());
  });

  it("has non-empty string values in both locales", () => {
    for (const locale of ["vi", "en"] as const) {
      const values = leaves(getKudosMessages(locale));
      expect(values.length).toBeGreaterThan(40);
      for (const v of values) expect(v.trim()).not.toBe("");
    }
  });

  it("returns the locale's own messages", () => {
    expect(getKudosMessages("vi")).toBe(kudosDictionary.vi);
    expect(getKudosMessages("en")).toBe(kudosDictionary.en);
  });

  it("pins vi to the frame copy extracted by Track A", () => {
    const vi = getKudosMessages("vi");
    expect(vi.banner.title).toBe(KUDOS_COPY.bannerTitle);
    expect(vi.banner.logoAlt).toBe(KUDOS_COPY.logoAlt);
    expect(vi.actionBar.composePlaceholder).toBe(KUDOS_COPY.composePlaceholder);
    expect(vi.actionBar.searchSunnerLabel).toBe(KUDOS_COPY.searchSunnerLabel);
    expect(vi.section.caption).toBe(KUDOS_COPY.sectionCaption);
    expect(vi.section.highlightTitle).toBe(KUDOS_COPY.highlightTitle);
    expect(vi.section.spotlightTitle).toBe(KUDOS_COPY.spotlightTitle);
    expect(vi.section.allKudosTitle).toBe(KUDOS_COPY.allKudosTitle);
    expect(vi.filters.hashtag).toBe(KUDOS_COPY.hashtagFilter);
    expect(vi.filters.department).toBe(KUDOS_COPY.departmentFilter);
    expect(vi.carousel.prev).toBe(KUDOS_COPY.prevLabel);
    expect(vi.carousel.next).toBe(KUDOS_COPY.nextLabel);
    expect(vi.spotlight.searchPlaceholder).toBe(KUDOS_COPY.spotlightSearchPlaceholder);
    expect(vi.spotlight.panZoomLabel).toBe(KUDOS_COPY.spotlightPanZoomLabel);
    expect(vi.card.copyLink).toBe(KUDOS_COPY.copyLink);
    expect(vi.card.viewDetail).toBe(KUDOS_COPY.viewDetail);
    expect(vi.card.heartLabel).toBe(KUDOS_COPY.heartLabel);
    expect(vi.stats).toEqual(KUDOS_COPY.stats);
    expect(vi.giftList.title).toBe(KUDOS_COPY.giftListTitle);
    expect(vi.heroLabels).toEqual(KUDOS_COPY.heroLabels);
  });

  it("uses exact VI star tooltip copy (spec B.3.2/B.3.6)", () => {
    const { tooltip } = getKudosMessages("vi").stars;
    expect(tooltip[1]).toBe("Sunner đã nhận được 10 Kudos và bắt đầu lan tỏa năng lượng ấm áp đến mọi người xung quanh.");
    expect(tooltip[2]).toBe("Sunner đã nhận được 20 Kudos và chứng minh sức ảnh hưởng của mình qua những hành động lan tỏa tích cực mỗi ngày.");
    expect(tooltip[3]).toBe("Sunner đã nhận được 50 Kudos và trở thành hình mẫu của sự công nhận, sẻ chia và lan tỏa tinh thần Sun*.");
  });

  it("uses exact VI critical copy", () => {
    const vi = getKudosMessages("vi");
    expect(vi.banner.title).toBe("Hệ thống ghi nhận và cảm ơn");
    expect(vi.stats.openBox).toBe("Mở Secret Box");
    expect(vi.card.emptyKudos).toBe("Hiện tại chưa có Kudos nào.");
    expect(vi.giftList.empty).toBe("Chưa có dữ liệu");
    expect(vi.filters.all).toBe("Tất cả");
    expect(vi.spotlight.searchPlaceholder).toBe("Tìm kiếm");
    expect(vi.heroLabels).toEqual({ new: "New Hero", rising: "Rising Hero", super: "Super Hero", legend: "Legend Hero" });
    expect(vi.meta.title).toBe("Sun* Kudos | Sun* Annual Awards 2025");
  });

  it("keeps the copied toast identical in both locales", () => {
    expect(getKudosMessages("vi").card.copied).toBe("Link copied — ready to share!");
    expect(getKudosMessages("en").card.copied).toBe("Link copied — ready to share!");
  });

  it("keeps the {name} placeholder in the activity template of both locales", () => {
    for (const locale of ["vi", "en"] as const) {
      expect(getKudosMessages(locale).spotlight.activityText).toContain("{name}");
    }
    expect(getKudosMessages("vi").spotlight.activityText).toBe("{name} đã nhận được một Kudos mới");
    expect(getKudosMessages("vi").spotlight.activityLabel).toBe("Kudos mới nhất");
    expect(getKudosMessages("vi").spotlight.totalSuffix).toBe("KUDOS");
  });

  it("pins vi compose copy to the frame copy (exact)", () => {
    const { compose } = getKudosMessages("vi");
    expect(compose.title).toBe(FRAME_COPY.title);
    expect(compose.recipient).toBe(FRAME_COPY.recipient);
    expect(compose.recipientPlaceholder).toBe(FRAME_COPY.recipientPlaceholder);
    expect(compose.badge).toBe(FRAME_COPY.badge);
    expect(compose.badgePlaceholder).toBe(FRAME_COPY.badgePlaceholder);
    expect(compose.badgeHint).toBe(FRAME_COPY.badgeHint);
    expect(compose.guidelines).toBe(FRAME_COPY.guidelines);
    expect(compose.editorPlaceholder).toBe(FRAME_COPY.editorPlaceholder);
    expect(compose.mentionHint).toBe(FRAME_COPY.mentionHint);
    expect(compose.hashtag).toBe(FRAME_COPY.hashtag);
    expect(compose.image).toBe(FRAME_COPY.image);
    expect(compose.maxFive).toBe(FRAME_COPY.maxFive);
    expect(compose.anonymous).toBe(FRAME_COPY.anonymous);
    expect(compose.anonymousNamePlaceholder).toBe(FRAME_COPY.anonymousNamePlaceholder);
    expect(compose.cancel).toBe(FRAME_COPY.cancel);
    expect(compose.send).toBe(FRAME_COPY.send);
    expect(compose.required).toBe(FRAME_COPY.required);
    expect(compose.removeImage).toBe(FRAME_COPY.removeImage);
    expect(compose.removeHashtag).toBe(FRAME_COPY.removeHashtag);
    expect(compose.format).toEqual(COMPOSE_FORMAT_LABELS);
  });

  it("uses exact VI compose criticals and anonymous alias", () => {
    const vi = getKudosMessages("vi");
    expect(vi.compose.title).toBe("Gửi lời cám ơn và ghi nhận đến đồng đội");
    expect(vi.compose.required).toBe("Không được để trống");
    expect(vi.compose.maxHashtags).toBe("Tối đa 5 hashtag");
    expect(vi.compose.maxFive).toBe("Tối đa 5");
    expect(vi.compose.anonymous).toBe("Gửi lời cám ơn và ghi nhận ẩn danh");
    expect(vi.card.anonymousAlias).toBe("Ẩn danh");
  });

  it("provides non-empty compose strings and anonymous alias in en", () => {
    const en = getKudosMessages("en");
    expect(leaves(en.compose).length).toBeGreaterThan(30);
    expect(en.card.anonymousAlias.trim()).not.toBe("");
  });
});
