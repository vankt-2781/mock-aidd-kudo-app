# Project Changelog

> Living document. Every significant change, feature, and fix is recorded here.

## 2026-10-28 — F009: Open Secret Box (feature)

**Summary:** "Mở Secret Box" is live from both entries (Kudos board sidebar "Mở quà" and own Profile): a modal reveals one badge per open and unlocks the matching slot in the owner's Profile badge collection (self face only).

**Shipped:**

- Migration `20261028000001`: `secret_boxes.badge` (nullable, check on six keys: `stay_gold`, `flow_to_horizon`, `beyond_the_boundary`, `root_further`, `touch_of_light`, `revival`) and SECURITY DEFINER `open_secret_box()` doing a server-side weighted draw (30/25/10/5/20/10), granted to `authenticated` only. Legacy opened boxes keep `badge` null.
- `src/lib/secret-box/` (action, queries, badge catalog), `src/components/secret-box/` (modal, opener, copy); sidebar and Profile buttons replace the placeholder dialog / disabled state; Profile badge collection reads opened boxes.
- Assets in `public/images/secret-box/badges/`: 2 design crops plus 4 fallback SVGs pending final art.
- Tests: unit 826, e2e 281 (two consecutive runs); new e2e specs for entry gating, open flow and DB rules.

**Security:** only the owner reads `badge`; no client insert/update/delete on `secret_boxes`; guests are sent to login; other-face and guest boundary unchanged.

**Docs impact:** major. `docs/features/F009_OpenSecretBox/` promoted; `docs/system/permissions.md`, `architecture.md` (DEC-005), roadmap, codebase summary and F006/F008 specs updated.

## 2026-10-27 — F008: Profile (feature, shipped)

**Summary:** Private `/profile` page. SELF face: hero, 6 locked badge slots, 5 counters with a disabled "Mở Secret Box", KUDOS feed (`?dir=received|sent`, 10 per page, infinite scroll, board card reuse). OTHER face (`?id=<uuid>`): hero + badges, a write-Kudo bar that opens the compose modal with the recipient preselected (`initialRecipient`), Received feed only, no counts (anonymity boundary). Board card sender/receiver links now go to `/profile?id=` (anonymous senders get no link).

**Shipped:**

- Guard: `decideRouteRedirect` sends guests to `/login?next=%2Fprofile`; `/profile` is an exact entry in the return-to allow-list. `?id` is uuid-checked server-side; malformed and unknown ids give the same not-found.
- Data layer `src/lib/profile/` (id resolution, header + feed queries, `getProfileKudosPage` action), page loaders in `src/app/(site)/profile/`, vi/en `profile-dictionary`.
- Migration `20261027000001`: `own_sent_kudos` SECURITY DEFINER view, caller-scoped via `auth.uid()`, mirrors the 19 `kudos_feed` columns, granted to `authenticated` only.
- Tests: new e2e project `profile-persona` (serial) plus profile specs; unit coverage for loaders, id resolution, queries, dictionary.
- Small branch extras: FAB/widget menu and language dropdown enhancements.

**Security:** own Sent shows the viewer's anonymous kudos with the real name plus an "Ẩn danh" chip, visible only to the sender via `own_sent_kudos`; the OTHER face never exposes sent data or counts, so no public path reveals who sent an anonymous kudo. Spec: [F008](features/F008_Profile/technical-spec.md).

**Docs:** `docs/generated/` inventories `api-map`, `entities`, `route-list` and others are still pre-F006 stale (known gap); run `/tkm:rebuild-spec` to regenerate. `feature-list` and `screen-list` were updated in place.

---

## 2026-10-27 — Fix: stale-session /login <-> /todo redirect loop (fix, commit 8b677e2)

**Cause:** split brain between two auth checks. The proxy verifies with `getClaims()`, which validates the JWT signature locally and never calls GoTrue; a validly signed token can outlive its user row (after `supabase db reset`, or a deleted/banned user within token lifetime). `/login` then saw "authenticated" and redirected to `/todo`, whose server-side `getUser()` found no user and redirected back to `/login`, forever.

**Fix:** in `updateSessionInProxy`, only on `/login`, after `getClaims()` succeeds call `getUser()`; on error clear local session cookies (`signOut({ scope: "local" })`) and treat the request as a guest. Other routes keep the cheap claims-only check. Affects production for deleted/banned users, not only local resets. Tests: `src/lib/supabase/update-session-in-proxy.test.ts`, `e2e/login-stale-session-loop.spec.ts`.

---

## 2026-10-23 — F007: Kudos Send Dialog / Viết Kudo (feature, shipped)

**Summary:** Signed-in users send Kudos from a compose modal on `/kudos`: recipient search with `@` mentions, TipTap rich-text editor (bold/italic/strike/list/link/blockquote), 1–5 hashtags (reuse or create), up to 5 images (jpg/png ≤ 5 MB) via a public `kudos-images` Storage bucket, optional title and anonymous send with alias. Server-side sanitize + atomic `send_kudos` SECURITY DEFINER RPC; board read side gains the title line, anonymous display, and owner-only viewer stats.

**Shipped:**

- Compose modal integration: `KudosComposeLauncher` + controller/reducer over the Track A UI (gap closures: overlay no-op, layered Esc, hashtag input + errors, image input/status, submitting footer), feed refresh-key fix so the new kudo appears on `router.refresh()`.
- `KudosEditor` (TipTap 3.32.0): trimmed extension set matching the sanitizer allow-list, mention suggestions fed by `searchSunners`, link dialog (http/https/mailto only).
- Data layer `src/lib/kudos-compose/`: limits, hashtag normalize/merge, client form validation, server-only `sanitizeKudosHtml` (sanitize-html 2.18.1, strips classes), `parseSendKudosInput`, identity-free image upload helper, server actions `searchSunners`/`sendKudos`.
- Four migrations: compose columns + backfill + hashtag unique index; masked definer views (`kudos_feed`/`kudos_highlights`/`profile_kudos_stats`) + column grants + `viewer_kudos_stats`; `send_kudos` RPC + `app_settings.storage_public_base` origin anchor; `kudos-images` bucket + policies. Rework migrations: `kudos_image_uploads` registry + `reserve_kudos_image_path` RPC + definer-predicate storage policy; `viewer_profile` definer view.
- Tests: new unit coverage across editor/compose lib/reducer/cards (634 total) + 68 new E2E across 3 Playwright projects with write isolation (per-test cleanup) + seed-sanity guard. Tests found and led to 3 fixes: `send_kudos` image-URL origin anchor, `next/image` storage hosts + `dangerouslyAllowLocalIP` dev-only, copy fixes.

**BREAKING / DB:** `kudos` gains `title`, `content_text`, `is_anonymous`, `anonymous_name`; the three board views are recreated as masked SECURITY DEFINER views (same leading columns, new columns appended); `kudos.sender_id` and `profiles.auth_user_id` are no longer readable by client roles (anon/authenticated) — sender identity only via the masked views, viewer's own row via `viewer_profile`/`viewer_kudos_stats`. New deployments must set `app_settings.storage_public_base` per environment (anchors image-URL validation in `send_kudos`).

**Security:** anonymous sender identity protected end to end — masked views null all sender fields, public stats exclude anonymous kudos, and image paths are identity-free (random registry paths reserved via RPC instead of uid folders) after inspection round 1 flagged the uid-in-path leak (REWORK → re-inspection SEALED, score 8, 0 critical). `send_kudos` re-derives the sender from `auth.uid()` and enforces caps; stored HTML is treated as untrusted (board renders `content_text`).

**Deps:** TipTap 3.32.0 (`@tiptap/*`), sanitize-html 2.18.1.

**Verification:** 634/634 unit, 181/181 E2E ×2 consecutive runs (after `supabase db reset` ×2) + seed-sanity 7/7; `tsc`/`eslint`/`lint`/`build` exit 0; inspection SEALED (score 8, 0 critical) after one rework cycle.

**Deferred (logged):** full F006 45-e2e regression until PR #6 merges + main re-merge; PM copy review list; `app_settings.storage_public_base` deploy note per environment; hardening — image-path reserve race, send rate limit, orphan image sweep.

---

## 2026-10-20 — F005: Countdown Prelaunch (feature, shipped)

**Summary:** Live `/countdown` prelaunch screen with per-second ticker (days capped at 99), a proxy launch gate that routes visitors to `/countdown` before the event start (admins bypass), a public `GET /api/event-config` endpoint, and unification of the event start time on a single server-only `EVENT_START_AT` env var.

**Shipped:**

- `/countdown` page: server page + `LivePrelaunchCountdown` 1 s ticker, zero → `00 00 00` → redirect to `/` (`useLaunchRedirect`, 1.5 s then 5 s retries), localized `generateMetadata`, aria-labels on countdown units.
- Proxy launch gate: pure `decideLaunchGateRedirect` runs before the route guard; `isAdmin` from verified claims in `updateSessionInProxy`; fail-open on missing/past/invalid env (doubles as kill-switch); pre-launch allow-list narrowed to exact `/api/event-config` + `/auth/callback`.
- `GET /api/event-config`: dynamic JSON `{ startAt }` with `Cache-Control: no-store`.
- Foundation libs: `computeCountdown` opt-in `maxDays`, `formatCountdownUnit` display guard, `readEventStart` single env reader, vi/en prelaunch dictionary.
- Tests: new unit coverage (gate matrix, proxy wiring, route, ticker/hook, `src/proxy-matcher.test.ts`) + 7 new E2E tests (`e2e/countdown-prelaunch.spec.ts`) + scripted pre-launch smoke.
- Flake fixes (debugger, root cause): awards `#mvp` deep-link Suspense reveal via ResizeObserver re-scroll in `use-active-category.ts` (with settle guard vs user input/stale hash), visible-wait in awards spec, clock margin in homepage-countdown spec.

**BREAKING:** `EVENT_START_AT` (server-only) replaces `NEXT_PUBLIC_EVENT_START_AT`. Existing `.env.local` files must drop the old var manually and set the new one, then restart the dev server. Playwright pins a past date (post-launch) so existing specs stay un-gated.

**Verification:** 312/312 unit (35 files), 105/105 E2E; `tsc`/`eslint`/`lint`/`build` exit 0; inspection SEALED (score 8, 0 critical). Scripted pre-launch smoke at `plans/261020-1656-countdown-prelaunch-implementation/reports/tester-261020-prelaunch-smoke.md`. Spec promoted as `docs/features/F005_CountdownPrelaunch/` + `docs/screens/SCR006_CountdownPrelaunch/`.

**Deferred (logged):** invalid-env warning log, redirect retry cap, env-rename deploy note. EN copy + metadata titles remain dev drafts pending PM review.

---

## 2026-10-20 — F004: Awards Information (feature, shipped)

**Summary:** Full `/awards` page replacing the F003-era placeholder: hero, category navigation with click + scroll-spy + focus accessibility, six award detail cards with exact prize copy, Kudos promo section, and vi/en localization including a localized tab title.

**Shipped:**

- `/awards` page (public): hero, `CategoryNav` (client — click/hash activation, upper-third scroll-spy via IntersectionObserver, heading focus with `preventScroll`), 6 award cards with exact prizes, Kudos promo.
- i18n: vi/en awards dictionary + localized tab title via `generateMetadata`.
- Tests: 22 new unit tests + 19 Playwright E2E tests.
- Post-inspection fix: `CategoryNav` `ariaLabel` prop made required, tests updated.

**Verification:** 186/186 unit (×2 runs), 98/98 E2E (×2 runs); `tsc`/`eslint`/`lint`/`build` exit 0; inspection SEALED (score 9/10), evidence gate SEALED. TC coverage 15/15 (14 automated + 1 manual) — map at `plans/261020-1440-awards-information-implementation/reports/awards-tc-coverage-map.md`.

**Deviations (open, pending PM):** page is public + served at `/awards` (TC expects auth gate + `/he-thong-giai`) — per clarification decisions; EN copy is a dev draft pending PM review.

---

## 2026-10-20 — F003: Homepage SAA (feature, shipped)

**Summary:** Public homepage at `/` replacing the boilerplate, with live countdown, auth-aware header, admin-gated navigation, placeholder routes, and vi/en localization.

**Shipped:**

- Homepage at `/` (route group `src/app/(site)/`): hero with env-driven countdown (`NEXT_PUBLIC_EVENT_START_AT`), awards grid with hash deep-links, footer, widget menu.
- Auth-aware header: visitor vs signed-in states, account menu with admin entry (`app_metadata.role`), plus server-side `/admin` guard (non-admin → `/`).
- Placeholder routes: `/awards`, `/kudos`, `/profile`, `/admin` (since replaced: `/awards` by F004, `/kudos` by F006, `/profile` by F008; only `/admin` remains a placeholder).
- i18n: vi/en home dictionary extension on the F001 locale foundation.
- Tests: 56 new Playwright E2E + 27 unit tests (countdown, role/viewer logic, dictionary).

**Verification:** 164/164 unit (×2 runs), 79/79 E2E (×3 runs); `tsc`/`eslint`/`lint`/`build` exit 0; inspection SEALED (score 8/10), evidence gate SEALED (temper 9 pass / 1 skipped-tool).

**Designer flags (open):** logo size 52x48 vs spec 64x60; "Tiêu chuẩn chung" footer link has no target; EN copy pending review; widget menu items TBD — details in `plans/261020-1256-homepage-saa-implementation/reports/homepage-tc-coverage-map.md`.

---

## 2026-10-20 — F001: automated test suite + UX/dev fixes (test, fix)

**Summary:** Full automated verification for F001 per `docs/features/F001_LoginWithGoogle/test-cases.md` (TC001–TC041), plus two small fixes found along the way.

- Test suite added: 35 component unit tests (vitest + jsdom — login page client, Google login button, language selector, layout parts) bringing the unit total to 75, and 23 Playwright E2E tests (incl. TC034 cursor test).
- Coverage: 30 of 41 test cases fully automated, 8 partial+manual, 3 weak/manual — map at `plans/261020-1131-f001-full-unit-e2e-tests/reports/test-coverage-map.md`.
- UX fix: `cursor-pointer` on the Google login button and language selector (minor).
- Dev fix: `await connection()` in `/todo` to resolve a dev-mode `cacheComponents` prerender error with `Date.now` (minor, dev-only).

**Verification:** 75/75 unit (×2 runs), 23/23 E2E (×2 runs); `tsc`/`eslint`/`lint`/`build` exit 0; inspection SEALED (score 8), evidence gate SEALED.

---

## 2026-10-19 — F001: Login with Google (feature, shipped)

**Summary:** Full login flow via Supabase Google OAuth on a fresh Next.js 16 app, with VN/EN localization and a server-enforced route guard.

**Shipped:**

- Pixel-faithful `/login` page from MoMorph/Figma design (header, language selector, hero, Google login button, fixed footer).
- Google OAuth: `signInWithOAuth` → `/auth/callback` code exchange → `/todo`; failures redirect to `/login?error=oauth` with inline localized error.
- `src/proxy.ts` route guard (Next.js 16 proxy convention): `/todo` requires session, authenticated users skip `/login`; verified lookup (`getClaims`/`getUser`), never `getSession`.
- i18n lite: typed vi/en dictionaries, `NEXT_LOCALE` cookie (httpOnly, 1y, whitelist-validated), instant client switch, default `vi`.
- Protected `/todo` placeholder: name, email, avatar (Google metadata with fallbacks), logout server action.
- Supabase local setup: CLI config with Google provider via env, `.env.example` files, setup guide `docs/supabase-google-oauth-setup.md`, README "Run locally".
- Spec promoted to `docs/features/F001_LoginWithGoogle/`; docs layer bootstrapped (13 artifacts in `docs/system/` + `docs/generated/`).

**Verification:** 40 unit tests pass (Vitest); `tsc`, `eslint`, `lint`, `build` all exit 0; route smoke 10/10; 17-TC manual e2e checklist (10 pass-class, 3 pending-browser, 3 blocked on Docker stack, 1 blocked on Google creds); review verdict SEALED, score 9.

**Security:** no secrets committed (anon key only client-side); open-redirect surface removed (callback target fixed); locale cookie whitelist-validated; logout is a CSRF-protected POST server action.

**Impact:** establishes auth, i18n, and route-guard foundations for the upcoming Todo feature.

---

## 2026-10-19 — Project scaffold (chore)

- Commit `3191dcb`: Next.js 16 app scaffold with Google login (F001 baseline).
