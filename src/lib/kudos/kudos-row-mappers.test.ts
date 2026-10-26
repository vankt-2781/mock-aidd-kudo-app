import { describe, expect, it } from "vitest";
import { mapFeedRow, mapGiftRow, mapSpotlightRows, mapViewerStats, type KudosFeedRow } from "./kudos-row-mappers";

const row: KudosFeedRow = {
  id: "k1",
  created_at: "2025-10-30T03:00:00+00:00",
  content: "Thanks",
  title: "Hero",
  is_anonymous: false,
  viewer_is_sender: false,
  images: ["/a.png"],
  sender_id: "p-sender",
  sender_display_name: "Sender",
  sender_avatar_url: null,
  sender_department_code: "CEVC10",
  sender_stars: 1,
  receiver_id: "p-recv",
  receiver_display_name: "Receiver",
  receiver_avatar_url: "/r.png",
  receiver_department_code: null,
  receiver_stars: 3,
  hashtag_names: ["Pioneer", "Dedicated"],
  like_count: 7,
};

describe("mapFeedRow", () => {
  it("maps users, tiers, label, hashtags and links", () => {
    const post = mapFeedRow(row, new Set());
    expect(post.title).toBe("Hero");
    expect(post.senderAnonymous).toBe(false);
    expect(post.sender).toMatchObject({
      profileId: "p-sender",
      name: "Sender",
      department: "CEVC10",
      stars: 1,
      heroTier: "rising",
      avatarSrc: "/images/kudos/avatar-sunner.png",
    });
    expect(post.receiver).toMatchObject({ stars: 3, heroTier: "legend", department: "", avatarSrc: "/r.png" });
    expect(post.sentAtLabel).toBe("10:00 - 10/30/2025");
    expect(post.createdAt).toBe(row.created_at);
    expect(post.hashtags).toEqual(["#Pioneer", "#Dedicated"]);
    expect(post.detailHref).toBe("/kudos/k1");
    expect(post.likeCount).toBe(7);
    expect(post.images).toEqual(["/a.png"]);
  });

  it("flags liked posts and reads viewer_is_sender from the row (never from sender_id)", () => {
    expect(mapFeedRow(row, new Set(["k1"]))).toMatchObject({ likedByViewer: true, viewerIsSender: false });
    expect(mapFeedRow({ ...row, viewer_is_sender: true }, new Set())).toMatchObject({ viewerIsSender: true });
  });

  it("normalizes title: blank and null become null", () => {
    expect(mapFeedRow({ ...row, title: "   " }, new Set()).title).toBeNull();
    expect(mapFeedRow({ ...row, title: null }, new Set()).title).toBeNull();
  });

  it("masks an anonymous sender: alias, default avatar, no stars/department/identity", () => {
    const post = mapFeedRow(
      { ...row, is_anonymous: true, viewer_is_sender: true, sender_id: null, sender_display_name: "Ghost", sender_avatar_url: null, sender_department_code: null, sender_stars: null },
      new Set(),
    );
    expect(post.senderAnonymous).toBe(true);
    expect(post.viewerIsSender).toBe(true);
    expect(post.sender).toEqual({
      profileId: "",
      name: "Ghost",
      department: "",
      stars: 0,
      heroTier: "new",
      avatarSrc: "/images/kudos/avatar-sunner.png",
    });
  });

  it("leaves the anonymous name empty for the card to fill with the default alias", () => {
    const post = mapFeedRow({ ...row, is_anonymous: true, sender_id: null, sender_display_name: null }, new Set());
    expect(post.sender.name).toBe("");
  });

  it("ignores any leaked sender fields on an anonymous row", () => {
    const post = mapFeedRow({ ...row, is_anonymous: true, sender_avatar_url: "/leak.png", sender_stars: 3 }, new Set());
    expect(post.sender).toMatchObject({ stars: 0, avatarSrc: "/images/kudos/avatar-sunner.png", profileId: "" });
  });

  it("clamps unexpected star values", () => {
    expect(mapFeedRow({ ...row, sender_stars: 99 }, new Set()).sender.stars).toBe(3);
  });
});

describe("mapGiftRow", () => {
  it("maps to a SunnerRef with avatar fallback", () => {
    expect(
      mapGiftRow({ id: "g1", description: "Nhận 1 áo", profiles: { display_name: "An", avatar_url: null } }),
    ).toEqual({ id: "g1", name: "An", description: "Nhận 1 áo", avatarSrc: "/images/kudos/avatar-sunner.png" });
  });

  it("tolerates a missing profile", () => {
    expect(mapGiftRow({ id: "g2", description: "x", profiles: null }).name).toBe("");
  });
});

describe("mapSpotlightRows", () => {
  it("maps nodes and activity with the template", () => {
    const data = mapSpotlightRows(
      7,
      [{ receiver_id: "r1", display_name: "An", kudos_count: 3, latest_kudos_id: "k9", latest_received_at: "2025-10-30T13:30:00Z" }],
      [{ id: "k9", created_at: "2025-10-30T13:30:00Z", receiver_display_name: "An" }],
      "{name} got a Kudos",
    );
    expect(data.total).toBe(7);
    expect(data.nodes[0]).toEqual({
      profileId: "r1",
      name: "An",
      kudosCount: 3,
      latestKudosId: "k9",
      latestReceivedAt: "2025-10-30T13:30:00Z",
    });
    expect(data.activity).toEqual([{ id: "k9", time: "08:30PM", text: "An got a Kudos" }]);
  });
});

describe("mapViewerStats", () => {
  it("combines stats row and box counts", () => {
    expect(
      mapViewerStats(
        { kudos_received: 25, kudos_sent: 24, hearts_received: 23 },
        [{ opened_at: "2025-01-01T00:00:00Z" }, { opened_at: null }, { opened_at: null }],
      ),
    ).toEqual({ kudosReceived: 25, kudosSent: 24, heartsReceived: 23, secretBoxOpened: 1, secretBoxUnopened: 2 });
  });

  it("defaults to zeros when the stats row is missing", () => {
    expect(mapViewerStats(null, [])).toEqual({
      kudosReceived: 0,
      kudosSent: 0,
      heartsReceived: 0,
      secretBoxOpened: 0,
      secretBoxUnopened: 0,
    });
  });
});
