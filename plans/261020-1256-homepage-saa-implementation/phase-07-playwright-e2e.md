---
phase: 07
title: Playwright e2e mapped to MoMorph TC IDs
feature: F003
status: completed
depends: [05, 06]
---

# Phase 07 — Playwright E2E

## Context Links
- TCs: all 62 rows in [digest](research/momorph-homepage-specs-notes.md) § Test cases
- Existing: `e2e/fixtures.ts` (`testUser`, `signedInContext`), `e2e/helpers/test-user.ts` (`createTestUser`, `buildSessionCookies`), `playwright.config.ts` (dev server reads `.env.local`, chromium)

## Overview
Priority P1 · Tests. Browser coverage of public render, i18n, navigation, countdown, auth/admin header, guards, menus. Local Supabase (Docker) required, as for F001 e2e.

## Key Insights
- Env is fixed by `.env.local` (2025-12-26, already past) → control time with `page.clock.install({ time })` BEFORE `goto`; client recompute on mount uses browser clock.
- Admin user: `auth.admin.createUser({ app_metadata: { role: "admin" } })`; `getUser()` returns it server-side.
- Sign out from homepage redirects to `/login` (existing action).

## Requirements — TC map
| Spec file | TC IDs |
|-----------|--------|
| `e2e/homepage-public-render.spec.ts` | 0, 7..17 (structure/text/attributes; grid cols via `getComputedStyle` at 1440/768/375), 59 (crawl every `a[href]` on `/` → status <400) |
| `e2e/homepage-navigation.spec.ts` | 2..4, 18..22, 44, 45, 47..50, 52, 53, 55, 62 (card hash → URL + target in viewport), 23/46/51 (hover: class/computed-style change) |
| `e2e/homepage-i18n.spec.ts` | 24..26, 58 (VN/EN only; EN switch; reload persists; `<html lang>`) |
| `e2e/homepage-countdown.spec.ts` | 39..43, 56, 57 (clock before start → values + "Coming soon"; `runFor(60_000)` decrements; at/after start → 00 00 00 hidden). 60 = unit-only (env fixed) — cite phase 02 test |
| `e2e/homepage-auth-header.spec.ts` | 1, 5, 6, 27..29, 36..38 (guest Login link; signed-in bell no badge + empty panel; regular 2 items; admin 3 items; sign out → `/login`, header guest on `/`) |
| `e2e/homepage-menus-and-guards.spec.ts` | 30..35, 54 (4 menus: click toggle, outside, Enter/Space, Esc + focus), `/admin` guard (visitor/regular → `/`, admin 200), `/profile` visitor → `/login` |
TC IDs not listed above (if any appear in the CSV) must be added to a row or justified in phase 08 coverage table.

## Related Code Files
Create: the 6 spec files above.
Modify: `e2e/helpers/test-user.ts` (`createTestUser({ appMetadata? })`), `e2e/fixtures.ts` (add `adminUser`, `adminContext`).
Do NOT touch: `src/**`, `playwright.config.ts` (unless webServer URL must change — it targets `/login`, still valid), package.json.

## Implementation Steps
1. Extend helper + fixtures; keep existing F001 specs green.
2. Write specs one file at a time; each test title prefixed with TC IDs (e.g. `ID-47/48 card image → /awards#top-talent`).
3. `npx playwright test` until green; then full `npm run test:all`.

## Todo
- [x] admin fixture
- [x] 6 spec files
- [x] all F001 + new e2e green

## Success Criteria
Every TC ID appears in a test title or the justified list; e2e green twice in a row (no flake).

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Clock vs server `initialNow` mismatch | M | M | Assert after hydration (`toHaveText` auto-wait) |
| Admin JWT lacks role | L | M | Server uses `getUser()` (DB truth), not JWT claims |
| Flaky hash scroll | M | L | Assert `toBeInViewport()` with auto-wait |

## Security Considerations
Test users created/deleted per test with service-role key from local Supabase only.

## Next Steps
Phase 08 coverage table + gates.
