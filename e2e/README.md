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
`data-target-date` attribute, so they follow `NEXT_PUBLIC_EVENT_START_AT` instead of hardcoding it.

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
