# F001 Login with Google: E2E coverage

Run: `npm run test:e2e` (needs local Supabase running; reuses a dev server on :3000).
Supabase URL and keys are read at runtime from `npx supabase status -o env`
(or `E2E_SUPABASE_URL` / `E2E_SUPABASE_ANON_KEY` / `E2E_SUPABASE_SERVICE_ROLE_KEY`); nothing is hardcoded.

Authenticated specs create an email-confirmed user through the admin API, sign in from Node and
inject the `sb-127-auth-token` cookie (`base64-` + base64url session, chunked like `@supabase/ssr`).
Users are deleted in fixture teardown. Google itself is never contacted: Supabase's real
`/auth/v1/authorize` hop runs, its Google redirect is captured and the browser gets a stub page.

## Mapping TC### to coverage

| TC | Coverage |
|----|----------|
| TC001-TC004 | unit (decide-route-redirect) + e2e `authenticated.spec.ts`, `login-unauthenticated.spec.ts` |
| TC005-TC008 | unit (resolve-callback-redirect); TC005/6/7 also e2e (callback error redirects) |
| TC009, TC041 | e2e `authenticated.spec.ts` (arbitrary-domain user admitted; real Google account variant MANUAL) |
| TC010-TC013 | unit (locale, dictionary); TC012 also e2e |
| TC014 | unit (component) + e2e `login-oauth-start.spec.ts` |
| TC015, TC018, TC024, TC036 | e2e `login-oauth-start.spec.ts` |
| TC016, TC031, TC038 (UI half) | unit + e2e `login-unauthenticated.spec.ts` |
| TC017 | unit (login-page-client) |
| TC019 | unit; e2e not feasible: the SDK only assigns `location`, so no SDK error surfaces in a real browser. MANUAL: blank Google credentials |
| TC020 | MANUAL (needs a real authorization code); invalid-code path covered under TC028 e2e |
| TC021, TC023 | e2e `login-unauthenticated.spec.ts` |
| TC022, TC039 | e2e `authenticated.spec.ts` |
| TC025, TC026, TC027, TC040 | e2e `authenticated.spec.ts` |
| TC028 | e2e (invalid code); replay of a genuinely used code MANUAL |
| TC029 | MANUAL (requires restarting Supabase with blank Google credentials) |
| TC030 | MANUAL (browser with cookies blocked) |
| TC032, TC034, TC035 | e2e `login-unauthenticated.spec.ts` |
| TC033, TC037 (post-login half) | e2e `authenticated.spec.ts` |

## MANUAL (real Google consent / environment)

TC020 (valid code exchange), TC028 (true replay), TC029, TC030, TC037 and TC041 via a real Google
account, TC038 via a real consent cancel.

## Known findings

- Hover cursor: RESOLVED 2026-10-20 — `cursor-pointer` added to the login button and language
  selector; the TC034 test in `login-unauthenticated.spec.ts` is active and passing.
- Revoked session with a still-valid JWT: `/todo` returns 200 with the "Loading..." fallback and a
  `meta refresh` to `/login` (redirect inside Suspense) rather than a 307. The TC025 revoked test
  asserts that actual behavior; headless Chromium did not follow the meta refresh within 4 s.
- Playwright output goes to `node_modules/.playwright-results`: Tailwind scans the repo, and an
  in-repo `test-results/` holding HTML-escaped class names broke the dev CSS build.

# F003 Homepage SAA: E2E coverage

Specs: `homepage-public-render`, `homepage-navigation`, `homepage-i18n`, `homepage-countdown`,
`homepage-auth-header`, `homepage-menus-and-guards` (test titles cite the MoMorph `ID-xx` rows).
Admin tests use the `adminUser` / `adminContext` fixtures (`app_metadata.role = "admin"` via the admin API).
The countdown specs drive time with `page.clock` and read the event start from the rendered
`data-target-date` attribute, so they follow `EVENT_START_AT` instead of hardcoding it.

| TC IDs | Coverage |
|--------|----------|
| ID-0, 1, 7-17, 59 | e2e `homepage-public-render` (grid columns checked at 1440 / 768 / 375) |
| ID-2-4, 18-23, 44-53, 55, 62 | e2e `homepage-navigation` (card hash: URL + section in viewport; hover via computed style) |
| ID-24-26, 58 | e2e `homepage-i18n` (VN/EN only, reload persistence, `<html lang>`, tampered cookie) |
| ID-39-43, 56, 57 | e2e `homepage-countdown`; ID-60 (invalid env date) unit only (compute-countdown / live-hero-countdown tests) |
| ID-5, 6, 27-29, 36-38 | e2e `homepage-auth-header` (guest login link, bell empty panel, regular vs admin menu, sign out) |
| ID-30-35, 54, `/admin` + `/profile` guards | e2e `homepage-menus-and-guards` |

## MANUAL / not automatable

- Unread notification badge (ID-11, ID-27, ID-29 badge-present variant): no notification backend exists; e2e asserts the
  badge is never shown and the empty panel opens. Re-test when notifications ship.
- Exact pixel sizes of logo (spec 64x60; built 52x48 per Figma frame) and visual polish (glow, blur): visual review.
- ID-60 invalid-env fallback at the browser level (env fixed for the dev server): unit-covered only.
- Any TC row in the CSV beyond the 62 digested IDs is not represented in the digest; verify in Phase 08.

# F004 Awards Information: E2E coverage

Spec: `awards-information` (19 tests; titles cite the MoMorph `ID-xx` rows). Public page, no auth needed
(one test repeats ID-0/1 with the `signedInContext` fixture). Click tests use the default smooth scroll and poll on
`aria-current` / viewport / focus; no fixed sleeps.

| TC IDs | Coverage |
|--------|----------|
| ID-0, 1 | e2e guest + authenticated open `/awards`: 200, no redirect. DEVIATION: the TC expects auth-only `/he-thong-giai`; clarifications make it public at `/awards` |
| ID-2 | e2e `homepage-navigation` ID-21 (header Awards Information to `/awards`, selected item) plus deep-link tests; not duplicated |
| ID-3-8 | e2e `awards-information` (layout order at 1440 and 375, caption + gold h1, 6 nav items in order, exact quantity/prize per card incl. Signature "Hoặc", 336x336 loaded images, Kudos block) |
| ID-9-11 | e2e click each item: card in viewport, one `aria-current`, `#slug`, focus on card h2; gold/underline swap; hover background |
| ID-12 | e2e Kudos "Chi tiết" opens `/kudos` |
| ID-13 | e2e `/awards#khong-ton-tai`: no page/console error, page at top, first item active |
| extra | scroll-spy (active follows scroll, hash unchanged), `/awards#mvp` on load, reduced-motion click, VN/EN copy + tab title + reload persistence, header nav selected state |

## MANUAL / not automatable

- ID-14 (Kudos navigation network failure to friendly error): `/kudos` is a placeholder page that renders, so a normal
  navigation succeeds. Verify by hand: DevTools offline, click "Chi tiết", expect the browser/Next error handling, not a blank page.
- EN copy and the EN tab title are dev drafts pending PM review; e2e asserts the current draft strings.
- Visual polish (glow, text-shadow, pixel match of the keyvisual crop): visual review.

# F005 Countdown Prelaunch: E2E coverage

Two Playwright configs, two environments. Both are self-contained; neither reuses the other's server.

| Run | Command | Config | Env pin | Spec |
|-----|---------|--------|---------|------|
| Post-launch (default) | `npm run test:e2e` | `playwright.config.ts` (:3000, reuses a dev server) | `EVENT_START_AT=2025-12-26T18:30:00+07:00` (gate inert) | `countdown-prelaunch.spec.ts` (+ the other suites) |
| Pre-launch | `npm run test:e2e:prelaunch` | `playwright.prelaunch.config.ts` (:3100, always fresh) | `EVENT_START_AT=2099-01-01T00:00:00+07:00` (gate active) | `prelaunch-gate.spec.ts` |

The pre-launch config runs `npm run dev` with `NEXT_DIST_DIR=.next-prelaunch` (own build dir, gitignored, and
ignored by ESLint), so it never collides with a running dev server. The default config's `testIgnore` keeps the
pre-launch spec out of the post-launch run. Session cookies are bound to the active `baseURL` (`buildSessionCookies`),
so the signed-in and admin fixtures work on either port.

`GET /api/event-config` is asserted against the post-launch pin; the homepage hero's `data-target-date` must equal the
API `startAt`. Pre-launch browser behaviour (gate redirects, bypass, page render, live minute roll-over) is asserted in
`prelaunch-gate.spec.ts` against the :3100 server. The live tick uses Playwright's `page.clock`, so the minute
roll-over is deterministic rather than a sleep.

| Spec ID | Coverage |
|---------|----------|
| SC-004 | e2e `countdown-prelaunch`: guest, signed-in user and admin opening `/countdown` all end at `/` (post-launch) |
| FR-007 | e2e `countdown-prelaunch`: guest `/` and `/awards` return 200 without redirect (post-launch) |
| SC-001 / FR-004 | e2e `countdown-prelaunch`: `/api/event-config` returns the pinned `startAt`, `Cache-Control: no-store`, equals homepage `data-target-date` |
| SC-002 / FR-005 | e2e `prelaunch-gate`: guest `/` and `/awards` redirect to `/countdown`; signed-in non-admin likewise; `/login` stays 200 |
| SC-003 / FR-006 | e2e `prelaunch-gate`: admin stays on `/` and loads `/awards`; unit `src/lib/launch-gate/decide-launch-gate-redirect.test.ts`, `src/proxy.test.ts` |
| SC-005 / FR-002 / FR-003 | e2e `prelaunch-gate`: rendered units, uppercase white labels, live minute roll-over; unit `src/lib/countdown/compute-countdown.test.ts`, live countdown tests |
| FR-009 | unit: `src/lib/i18n/prelaunch-dictionary.test.ts` |

## MANUAL / not automatable

- 1.5 s client redirect to `/` at zero (FR-003): unit-covered by `use-launch-redirect.test.tsx` and the live countdown tests. Not driven end to end: the server gate reads the server clock, which the browser clock cannot move. Verify by hand with a near-future `EVENT_START_AT` if needed.
- Expired (not garbage) session JWT: the test suite cannot mint a JWT without the project secret; the invalid-cookie path is covered instead.
