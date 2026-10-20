# Development Roadmap

> Living document. Updated after each feature lands or a phase changes status.
> Last updated: 2026-10-20

## Current Status

| Phase | Scope | Status |
|-------|-------|--------|
| Foundation | Next.js 16 scaffold (App Router, React 19, TS, Tailwind 4), Supabase local stack, Vitest | Complete |
| F001 — Login with Google | Supabase Google OAuth, VN/EN locale, route guard, protected `/todo` placeholder | Complete (2026-10-19) |
| Docs layer | rebuild-spec Core+Flow bootstrap — 13 artifacts in `docs/system/` + `docs/generated/`, feature spec `docs/features/F001_LoginWithGoogle/` | Complete (2026-10-19) |
| F001 automated test coverage (unit+E2E) | Component unit tests (vitest+jsdom) + Playwright E2E for TC001–TC041 | Complete (2026-10-20) |
| Todo app (main feature) | Real `/todo` functionality replacing the placeholder | Not started |

## F001 — Login with Google (shipped)

All 7 plan phases completed — plan: `plans/261019-2101-login-page-supabase-google-oauth/plan.md`

| # | Phase | Status |
|---|-------|--------|
| 01 | Login UI (presentational, pixel-faithful from MoMorph/Figma) | Completed |
| 02 | Deps, env, Supabase local setup | Completed |
| 03 | Supabase clients, `/auth/callback`, `src/proxy.ts` guard | Completed |
| 04 | i18n lite (vi/en dictionaries + `NEXT_LOCALE` cookie) | Completed |
| 05 | `/todo` protected placeholder + logout | Completed |
| 06 | Login page integration (UI + auth + i18n) | Completed |
| 07 | Verification + manual e2e checklist | Completed |

**Quality gates:** 40/40 unit tests, `tsc`/`eslint`/`lint`/`build` exit 0, route smoke 10/10, review verdict SEALED (score 9), temper 18/18.

**Open external items** (not code work — user actions, re-test steps in
`plans/261019-2101-login-page-supabase-google-oauth/reports/manual-e2e-checklist.md`):

- 3 checklist rows blocked on local Docker/Supabase stack
- 1 checklist row blocked on real `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`
- 3 rows pending in-browser verification

## F001 — Automated test coverage (complete 2026-10-20)

Plan: `plans/261020-1131-f001-full-unit-e2e-tests/plan.md` — all 3 phases completed.

**Quality gates:** 75/75 vitest unit tests (×2 runs), 23/23 Playwright E2E (×2 runs),
`tsc`/`eslint`/`lint`/`build` all exit 0. Inspection SEALED (score 8), evidence gate SEALED.
Coverage vs TC001–TC041: 30 fully automated, 8 partial+manual, 3 weak/manual —
map at `plans/261020-1131-f001-full-unit-e2e-tests/reports/test-coverage-map.md`.

## Next Milestones

1. User fills Google OAuth credentials → re-run blocked e2e rows.
2. Define and plan the real Todo feature (replaces `/todo` placeholder).

## Success Metrics

- All quality gates stay green on `main`.
- No committed secrets (enforced: `.gitignore` negations + pre-commit grep).
