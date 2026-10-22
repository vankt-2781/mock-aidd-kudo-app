# Sun* Kudos - Live board — MoMorph digest (screen MaZUn5xHXZ, figma 2940:13431)

Source: download_specs 64 items + download_test_cases 41 rows, fetched 2026-10-21. Re-fetchable via MoMorph MCP screen_id MaZUn5xHXZ. File: SAA 2025 - Internal Live Coding (fileKey 9ypp4enmFmdK3YAFJLIu6C). Design status: in_progress, spec: done.

## Page sections (64 spec rows, grouped)

- **A — KV banner**: title "Hệ thống ghi nhận lời cảm ơn" + SAA 2025 KUDOS logo graphic. Readonly.
- **A.1 — Input pill**: pencil icon, placeholder "Hôm nay, bạn muốn gửi lời cảm ơn và ghi nhận đến ai?". Click → opens send-kudos dialog (SEPARATE screen "Viết Kudo" ihQ26W78P2 — stub per clarification). Required string in that dialog.
- **B — HIGHLIGHT KUDOS**: section header (subtitle "Sun* Annual Awards 2025" + title) + filter dropdowns Hashtag (B.1.1) & Phòng ban (B.1.2) — both lists queried from DB; filters apply to BOTH Highlight and All Kudos; filter change resets carousel pagination to 1; dropdown shows active-option state.
- **B.2/B.3 — Carousel**: top-5 kudos by hearts across the event. Center card prominent, side cards faded/non-interactive; prev disabled on slide 1, next disabled on slide 5; pagination "2/5" (B.5). Card contents: sender avatar+name+dept+star-count (hoa thị), arrow icon, receiver ditto, time "10:00 - 10/30/2025" (HH:mm - MM/DD/YYYY), content clamp 3 lines + "...", hashtags max 5 on one line + "...", actions: heart+count (gray inactive/red active), Copy Link, Xem chi tiết. Empty state: "Hiện tại chưa có Kudos nào."
  - Star (hoa thị) tooltips: 1=10 kudos, 2=20 kudos, 3=50 kudos (exact VI copy in spec rows B.3.2/B.3.6).
  - Avatar/name click → profile (stub); hover → preview profile (separate frame — stub/skip).
  - Hashtag click (B.4.3) → sets Hashtag filter to that tag (affects both sections).
- **B.6/B.7 — SPOTLIGHT BOARD**: header + interactive word-cloud of recipient names. "388 KUDOS" total count from DB (B.7.1). Pan/Zoom toggle icon button w/ tooltip (B.7.2). Search input (B.7.3): placeholder "Tìm kiếm", max 100 chars, optional (clarified: filter/highlight nodes; empty = no-op; TC-9e689933 deviation). Node hover → tooltip (name + time received); node click → kudos detail (stub). States: loading, empty, interactive.
- **C — ALL KUDOS feed**: header + vertical card list, infinite scroll. Post card (C.3): sender info block (avatar, name, star/danh hiệu), sent icon, receiver info block (avatar, name, dept e.g. CEVC10, danh hiệu), time, content clamp 5 lines + "...", gallery up to 5 square thumbnails (click → full-size image), hashtags (click filters), heart+count + Copy Link (no Xem chi tiết in feed variant). Empty: "Hiện tại chưa có Kudos nào."
- **C.4.1 — Like rules (critical BL)**: 1 like per user per kudos; sender of a kudos CANNOT like it (disabled); each like gives the kudos SENDER +1 heart (+2 if liked on an admin-configured special day); unlike revokes exactly what was awarded (1 or 2). databaseNote: must distinguish normal vs special likes for correct revoke.
- **D — Right sidebar**: personal stats (6 rows: Số Kudos bạn nhận được / đã gửi / Số tim bạn nhận được / divider / Số Secret Box đã mở / chưa mở, sample value 25) + "Mở quà" button → Secret Box dialog (separate screen — stub; may be disabled when not eligible) + 2 lists: "10 SUNNER CÓ SỰ THĂNG HẠNG MỚI NHẤT" & "10 SUNNER NHẬN QUÀ MỚI NHẤT" (avatar 64px white border, gold name #FFEA9E 22px bold, white 16px description e.g. "Nhận được 1 áo phông SAA"). Sidebar scrolls independently. Empty list: "Chưa có dữ liệu".
- Copy Link (all variants): clipboard + toast "Link copied — ready to share!" (exact EN copy per design).

## Test cases (41) — buckets
- ACCESSING (3): profile nav from card/sidebar (auth); detail nav from card/spotlight node; TC-71b3ef43 unauthenticated → UI viewable, interactions redirect to login.
- GUI (15): banner layout/readonly; pill input shape+icon+placeholder exact VI; highlight header/filters/carousel alignment; filter buttons visible + active/inactive states; carousel 5 slides, arrow disabled at ends, center prominent; card fields complete; search bar visible + icon + placeholder "Tìm kiếm"; spotlight word-cloud + count + pan/zoom + loading/empty; feed alignment + sidebar + infinite scroll + empty copy; post card fields + non-interactive icons unresponsive; sidebar headers/labels/dividers/leaderboards.
- FUNCTION (23): required check in send dialog (dialog = stub → deviation/deferred); search 100-char max accepted, 101 rejected, empty required (clarified deviation: empty no-op); kudos save to DB (send dialog task — deferred); empty feed copy; empty leaderboard copy; no self-like; one like per user; special day +2 hearts; "Mở quà" opens dialog (stub → deviation note); spotlight loading/empty/interactive; hashtag dropdown filter + clear; department dropdown filter + clear; hashtag tag click filters; carousel arrows + disabled ends + pagination; heart toggle gray↔red + count ±; copy link toast exact copy; view details nav; sender/receiver profile nav; pan/zoom toggle; node hover tooltip + click detail; gallery thumbnail → full-size; leaderboard click profile + hover preview.

## Clarified decisions (clarifications.md — authoritative)
1. Scope: Live board only; Viết Kudo dialog, Kudo detail, Profile, Secret Box dialog, hover preview = stubs (separate screen tasks exist in Figma).
2. Real Supabase schema: migrations + RLS + seed matching frame (kudos, kudos_likes, hashtags, departments, profiles…); server queries.
3. Optimistic like updates + revalidate; no Realtime subscription.
4. /kudos public viewing; interactions require login → /login; personal stats only when signed in.
5. Full like logic: hearts_awarded (1|2) stored per like; special_days table + 1 seed day; admin UI deferred.
6. Spotlight: hand-rolled SVG (no new deps), viewBox pan/zoom, tooltip, click → stub.
7. Leaderboards: title_events + gift_events tables, seeded; event-writing logic deferred to Viết Kudo task.
8. Search: filter/highlight nodes, empty no-op, max 100 enforced; TC deviation recorded.
9. (Round 1 Q4) Guest sees public board; sidebar personal stats box hidden/placeholder when signed out.

## Existing code to reuse
- src/app/(site)/kudos/page.tsx — placeholder page to REPLACE (Track A doing presentational pass now, background).
- (site) layout: shared header/footer; src/lib/auth/* (get-current-viewer, is-admin-user); src/lib/supabase/* (server client); src/lib/i18n/* dictionary-lite pattern (add kudos dictionary; NOTE: most copy is VI design copy, EN = dev draft).
- e2e/fixtures.ts (testUser/adminUser contexts); supabase/ local project (migrations dir, config).
- Track A output (background, in progress): src/components/kudos/**, src/app/(site)/kudos/**, public/images/kudos/** — props-driven presentational components with typed interfaces.
