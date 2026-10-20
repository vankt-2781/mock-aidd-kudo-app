# Project Changelog

> Living document. Every significant change, feature, and fix is recorded here.

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
