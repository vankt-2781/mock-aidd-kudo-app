---
status: draft
authored_by: takumi
created: 2026-10-27
lang: en
---

# Business Context — Profile

## Why It Matters

The Kudos board shows thanks, but a Sunner has no place to see their own standing: who thanked them, whom they thanked, their stars and their gift boxes. The profile page is that place. Opening a colleague's profile from a card closes the loop: see who they are and thank them directly. Trust is the constraint: a person may send Kudos anonymously, so the page must never let anyone work out an anonymous sender, even by comparing counts. Hence a colleague's profile shows only what they received, with no numbers, while the owner sees their full history including anonymous sends.

## Who Uses It

- **Visitor (not signed in)** — cannot open any profile; goes to login and returns to their own profile after sign-in.
- **Signed-in Sunner (owner)** — sees own hero, badges, personal counters, received and sent Kudos (anonymous ones marked "Ẩn danh").
- **Signed-in Sunner (viewer of a colleague)** — sees hero, badges, received Kudos only, and a bar to thank the colleague.
- **Recipient/Sender of anonymous Kudos** — anonymity holds on every surface except the sender's own Sent list.
- **Admin / operator** — no admin screen here.

## What They Do

1. A signed-in Sunner opens "Profile" from the menu or sidebar and sees their own page.
2. They read their tier badge and stars, the six locked badges, and five counters (received, sent, hearts, boxes opened, boxes unopened). "Mở Secret Box" is visible but disabled for now.
3. In the KUDOS section they switch between "Đã nhận (N)" and "Đã gửi (M)"; the page can be shared or reloaded on a direction by URL.
4. They scroll; ten more Kudos load each time; the list simply stops at the end.
5. In Sent, an anonymous Kudos shows their real name plus an "Ẩn danh" chip, so they know it went out anonymously.
6. They can heart other people's Kudos, click a hashtag to the board, or copy a Kudos link, as on the board. They cannot heart their own Kudos.
7. Clicking a person on a board card opens that Sunner's profile: hero, badges, label "Đã nhận" and their received Kudos, no counts.
8. They click "Gửi lời cám ơn và ghi nhận đến {name}", and the Viết Kudo dialog opens with that Sunner already chosen.
9. A wrong or broken profile link shows "Không tìm thấy hồ sơ" with a link home; it never says why.
10. A brand-new Sunner with no avatar, department or Kudos still gets a clean page: placeholder avatar, no badge, empty-state text.

## Unresolved Questions

- **Copy pending PM review:** stats error text, "Không tìm thấy hồ sơ" / "Về trang chủ", all English strings (developer drafts).
- **Tier rule:** test cases count distinct senders; we keep the F006 star rule. PM to confirm.
- **End-of-feed message:** dropped to match the board.
- **Spam chip:** deferred; no moderation exists.
- **Secret Box:** counters are real, opening is not built; button stays disabled.
- **Department label:** name vs code on the hero (assumed name).
- **Out of scope:** editing a profile, badge unlocking, notifications, follow or social graph.
