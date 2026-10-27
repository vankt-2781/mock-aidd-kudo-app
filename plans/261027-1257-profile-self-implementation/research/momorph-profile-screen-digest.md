# Profile bản thân — MoMorph digest (screen 3FoIx6ALVb, figma 362:5037)

Source: download_specs 28 items (mostly DRAFT rows — only mms_A has prose) + download_test_cases 30 rows (RICH — they are the real behavior contract), fetched 2026-10-27. Re-fetchable via screen_id 3FoIx6ALVb. Related frame: w4WUvsJ9KI "Profile người khác" (362:5097). NOTE: the TCs were authored against ANOTHER implementation's paths (PUBLIC_ROUTES in proxy.ts, app/kudos/use-board-interactions.ts, locales/*.json) — adopt the BEHAVIOR, adapt the mechanics to our codebase (dictionary-lite, decide-route-redirect, kudos_feed views). This is a clean-restart run: the previous F008 Profile delivery was discarded pre-push at the user's request; decisions below carry over.

## Spec rows (28, mostly layout identifiers)
- mms_3 Keyvisual, mms_A Info region (avatar A.1, name A.2, huy hiệu A.3) — note on A: "Lấy thông tin user đang đăng nhập. Bộ sưu tập icon của tôi tuân theo icon mở được trong Secret box. Nếu chưa có icon nào thì để icon xám."
- mms_B Thống kê (B.1 kudos nhận, B.2 kudos gửi, B.3 tim nhận, B.4 box đã mở, B.5 box chưa mở, B.6 button Mở quà) — same 5 counters as the board sidebar.
- B2..B7: 6 Huy hiệu slots (badge collection, artwork per frame).
- mms_C KUDOS section header (C.1 title, C.2 KUDOS title, C.3 Button — the direction dropdown trigger).
- mms_D Post all (feed of kudos cards) + D.3.1 Status chip (orange "Spam") — DEFERRED, never rendered (no moderation model); carry a typed status field.

## Behavior contract (30 TCs condensed — IDs TC_WEB_PROFILE_*)
- ACC_001: /profile PRIVATE — guest → /login (route guard; page re-checks session as defense in depth). ACC_002: self view renders hero + badges + stats + KUDOS section.
- FUN_001..005 (?id resolution): ?id={profileId} → that Sunner's profile; own id → canonical SELF view; unknown valid UUID → 404; malformed (banana, SQLi, 42, truncated UUID) → 404 with shape-check BEFORE any query (uuid regex); empty ?id= → self; repeated ?id&id → 404.
- GUI_001 hero: keyvisual artwork only (no ghost nav/avatar), avatar, gold name, department, tier badge + stars one row. CLARIFIED: tier derived from stars per the F006 rule (TC's distinct-senders denominator = recorded deviation).
- GUI_002/003 badges: exactly 6 slots, fixed order, real artwork desaturated, all locked; heading "Bộ sưu tập icon của tôi" (self) / "Bộ sưu tập icon" (other); unlocked list drives future lighting.
- GUI_004/005 stats: self ONLY — 5 counters (viewer_kudos_stats incl. anonymous) with second-person labels matching the board sidebar; Secret Box rows + "Mở Secret Box" button DISABLED (no dialog; the Secret Box open feature is not built).
- FUN_006/007/008 other-face: stats slot replaced by write-Kudo bar "Gửi lời cám ơn và ghi nhận đến {name}"; clicking it opens the EXISTING Viết Kudo modal with the viewed Sunner preselected as recipient (optional prop defaulting null — board/homepage flows unchanged); no write bar on self.
- FUN_009 + SEC_001: KUDOS dropdown — self offers "Đã nhận (N)" + "Đã gửi (M)" (counts from stats, Received default, trigger shows ACTIVE direction); other profiles offer Received ONLY — no Đã gửi label/count anywhere (anonymous-send differential leak; the MOST important case).
- SEC_002/003: own Sent list INCLUDES anonymous kudos, shows SELF as author (still marked anonymous); caller-scoped SECURITY DEFINER view is the boundary; two sessions never see each other's sent lists.
- GUI_006: cards identical to the board (same mapper/components; anonymous masked on Received lists).
- FUN_010/011/012/013: direction switch loads page 1 + discards old pages, label updates only after load; re-picking active = no-op (no request); per-direction empty copy ("Hiện tại chưa có Kudos nào." / "Bạn chưa gửi Kudos nào."); infinite scroll 10/page via the board keyset cursor. End-of-feed message: DROPPED (board parity — F006 has none).
- FUN_014/015: heart reuses the board server action (self-kudo refusal incl. own anonymous in Sent); hashtag click → /kudos?hashtag=...; Copy Link + board toast.
- GUI_007 no Spam chip; GUI_008 vi/en parity with counts/name substitution; GUI_009 sparse profile (null avatar/dept, 0 kudos) renders placeholder avatar, no dept line, NO badge/stars at zero; SEC_004 read-only page, no email/auth ids in payload (profiles.auth_user_id already revoked in F007).

## Existing code to reuse
- Guard: add /profile to src/lib/auth/decide-route-redirect.ts (today it guards only /todo; e2e asserts guest /profile → /login via the placeholder page's own redirect) + "/profile" into RETURN_TO_ALLOW_LIST (exact match).
- Data: kudos_feed view (exposes receiver_id — filter for Received), viewer_kudos_stats (self stats; Secret Box counts from owner-only secret_boxes rows as in getViewerStats), profile_kudos_stats (stars for tier), src/lib/kudos/* (mappers mapFeedRow, cursor, FEED_PAGE_SIZE, like store/button, kudos-viewer getKudosViewer), profiles public columns (id, display_name, avatar_url, department_id, created_at — auth_user_id revoked).
- NEW DB: own_sent_kudos SECURITY DEFINER view (caller-scoped WHERE sender = caller profile via auth.uid(); includes anonymous with real author fields; MIRROR kudos_feed's 19 columns exactly so cursor+mapper are reused; omit anonymous_name; grant authenticated only).
- Compose modal: KudosComposeController accepts optional initialRecipient (default null); launcher pattern in src/components/kudos/kudos-compose-launcher.tsx.
- i18n: NEW profile-dictionary (vi/en); vi exact copy.
- e2e fixtures: testUser/personaContext (persona profile 00000000-0000-4000-8000-000000010100, 25/25 stats); seed has sparse profiles + Pioneer hashtag paging data; seed has NO anonymous kudos → anonymous own-sent e2e needs a writes-project spec with cleanup.
- Known test pitfalls from the prior run: don't assert the bare string "Đã gửi" (compose toast contains it); window.scrollTo(0, scrollHeight) does NOT trigger the intersection-observer infinite scroll — scroll a sentinel into view; persona specs need a separate serial Playwright project (claim races vs kudos-board-persona); notFound() under cacheComponents streaming returns HTTP 200 — assert the not-found TEXT.
