# Project Changelog

> Living document. Every significant change, feature, and fix is recorded here.

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
- Placeholder routes: `/awards`, `/kudos`, `/profile`, `/admin`.
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
