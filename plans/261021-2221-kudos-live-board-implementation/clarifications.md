# Clarifications — Sun* Kudos - Live board (screen MaZUn5xHXZ)

## Session 2026-10-21

- Q: Task scope vs adjacent screens (Viết Kudo dialog, Kudo detail, Profile, Secret Box dialog, hover preview — all separate Figma frames)? → A: Live board only — all on-board behaviors real (feed, carousel, filters, like, copy link, spotlight, sidebar); clicks to send-dialog/detail/profile/secret-box go to stub routes or placeholders, built in their own screen tasks later
- Q: Data layer? → A: Real Supabase schema — migrations + RLS + seed data matching the frame (kudos, kudos_likes, hashtags, departments, profiles…); page reads via server queries; foundation for later Kudos screens
- Q: "Live" updates? → A: Optimistic like updates + revalidate; no Supabase Realtime subscription yet (spec has none; add later if asked)
- Q: /kudos access? → A: Public viewing; interactions (like, send, open gift, profile/detail navigation) require login → redirect /login per TC-71b3ef43; personal stats sidebar only shows when signed in
- Q: Like rules depth (1 like/user/kudos, no self-like, special-day ×2 hearts, revoke exact amount) with no admin screen yet? → A: Full logic — kudos_likes stores hearts_awarded (1|2) for exact revoke; special_days table with migration + 1 seeded sample day; admin config UI deferred to the Admin screen task; all rules unit-tested
- Q: Spotlight word-cloud implementation? → A: Hand-rolled SVG, no new dependency — simple layout algorithm, pan/zoom via viewBox transform, hover tooltip, click node → stub detail route
- Q: Leaderboard "10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT" source? → A: title_events table (user, milestone, timestamp) with seed rows; gift leaderboard likewise (gift_events seed); writing events when a like/kudos crosses a milestone belongs to the Viết Kudo task later
- Q: Spotlight search behavior (spec: optional; TC-9e689933: empty → required error — contradiction)? → A: Typing filters/highlights matching nodes in the word-cloud; empty input is a no-op per spec; max 100 chars enforced; TC deviation recorded for PM
- Q: Highlight top-5 ranking basis? → A: Like count (the number shown on the card); special-day ×2 affects only the sender's received hearts, not post ranking
- Q: Spotlight nodes and click target? → A: All receivers, node size by kudos received; click opens that person's latest kudos (stub detail route)
- Q: Danh hiệu tier display? → A: Derive from stars — 0=New Hero, 1=Rising, 2=Super, 3=Legend (matches the 4 Figma hover frames); card shows stars + label
- Q: Secret Box opened/unopened counts source? → A: Seeded secret_boxes table with owner-only RLS; Mở quà button stays a stub
- Q: Sidebar lists — spec CSV says 2, frame draws only 1? → A: Follow the frame (precedent from F004): single "10 SUNNER NHẬN QUÀ MỚI NHẤT" list backed by seeded gift_events; drop title_events; deviation recorded for PM
- Q: Post-login redirect from a gated action (callback hardcodes /todo)? → A: Return-to via allow-list — login from the board returns to /kudos; next param accepts only allow-listed internal paths (no open redirect)
- Q: Signed-out sidebar? → A: Hide the personal stats box; keep Mở quà visible (click → /login); gift list stays public

## Orchestrator technical defaults (recorded, not asked)
- profiles links to auth via nullable unique auth_user_id; profile created on first sign-in by DB trigger on auth.users insert
- kudos has no title column — "IDOL GIỚI TRẺ" is a hashtag (spec row D.4)
- Timezone for special days and displayed times: Asia/Ho_Chi_Minh
- Filter clear: "Tất cả" (All) option at the top of each dropdown
- Like/unlike as one DB function; filter state in URL search params; feed keyset paging (created_at,id) page size 10
- Signed-in user opening /login?next=<valid allow-listed path> follows next (instead of the default /todo) — keeps the return-to flow consistent
- Q: Phòng ban filter matches whose department? → A: The RECEIVER's department (consistent with the Spotlight receiver word-cloud)
