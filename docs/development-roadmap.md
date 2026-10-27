# Development Roadmap

> Living document. Updated after each feature lands or a phase changes status.
> Last updated: 2026-10-27

## Current Status

| Phase | Scope | Status |
|-------|-------|--------|
| Foundation | Next.js 16 scaffold (App Router, React 19, TS, Tailwind 4), Supabase local stack, Vitest | Complete |
| F001 — Login with Google | Supabase Google OAuth, VN/EN locale, route guard, protected `/todo` placeholder | Complete (2026-10-19) |
| Docs layer | rebuild-spec Core+Flow bootstrap — 13 artifacts in `docs/system/` + `docs/generated/`, feature spec `docs/features/F001_LoginWithGoogle/` | Complete (2026-10-19) |
| F001 automated test coverage (unit+E2E) | Component unit tests (vitest+jsdom) + Playwright E2E for TC001–TC041 | Complete (2026-10-20) |
| F003 — Homepage SAA | Public homepage at `/`, countdown, auth-aware header, admin guard, placeholder routes, vi/en i18n | Complete (2026-10-20) |
| F004 — Awards Information | Full `/awards` page: hero, category nav (scroll-spy + focus a11y), 6 award cards, Kudos promo, vi/en i18n | Complete (2026-10-20) |
| F005 — Countdown Prelaunch | `/countdown` live ticker, proxy launch gate with admin bypass, `GET /api/event-config`, `EVENT_START_AT` unification, vi/en i18n | Complete (2026-10-20) |
| F006 — Kudos Live Board | Live board at `/kudos` on real Supabase data (feed, highlights, filters, stats), spec promoted as `docs/features/F006_*` + SCR007 | Complete (2026-10-22, PR #5) |
| F007 — Kudos Send Dialog (Viết Kudo) | Compose modal: TipTap editor, mentions, hashtags, images, anonymous send; masked definer views + `send_kudos` RPC + `kudos-images` Storage; 68 new e2e | Complete (2026-10-23) |
| F008 — Profile | Private `/profile`: SELF face (hero, badges, counters, Received/Sent feed) + OTHER face (`?id=`, Received-only); `own_sent_kudos` definer view; `/profile` guard + return-to; vi/en dictionary | Complete (2026-10-27, branch `feature/profile-self`) |
| Auth fix 8b677e2 | `/login` verifies `getUser()` after `getClaims()` and clears stale cookies (breaks `/login`<->`/todo` loop) | Complete (2026-10-27) |
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

## F003 — Homepage SAA (complete 2026-10-20)

Plan: `plans/261020-1256-homepage-saa-implementation/plan.md` — all 8 phases completed.
Supersedes the F002 boilerplate homepage.

**Quality gates:** 164/164 vitest unit (×2 runs), 79/79 Playwright E2E (×3 runs),
`tsc`/`eslint`/`lint`/`build` all exit 0. Inspection SEALED (score 8/10), evidence gate SEALED
(temper runs 01–10: 9 pass, 1 skipped-tool). TC coverage 62/62 mapped —
map at `plans/261020-1256-homepage-saa-implementation/reports/homepage-tc-coverage-map.md`.

## F004 — Awards Information (complete 2026-10-20)

Plan: `plans/261020-1440-awards-information-implementation/plan.md` — all 5 phases completed.
Supersedes the F003-era `/awards` placeholder route.

**Quality gates:** 186/186 vitest unit (×2 runs), 98/98 Playwright E2E (×2 runs),
`tsc`/`eslint`/`lint`/`build` all exit 0. Inspection SEALED (score 9/10), evidence gate SEALED.
TC coverage 15/15 mapped (14 automated + 1 manual), 2 recorded deviations (public access +
`/awards` route vs TC — pending PM) —
map at `plans/261020-1440-awards-information-implementation/reports/awards-tc-coverage-map.md`.
Post-inspection fix: `CategoryNav` `ariaLabel` made required + tests updated.

## F005 — Countdown Prelaunch (complete 2026-10-20)

Plan: `plans/261020-1656-countdown-prelaunch-implementation/plan.md` — all 5 phases completed
(plus Track A UI done up front).

**Quality gates:** 312/312 vitest unit (35 files), 105/105 Playwright E2E,
`tsc`/`eslint`/`lint`/`build` all exit 0. Inspection SEALED (score 8, 0 critical);
3 Accept findings fixed post-inspection, 3 Defer findings logged.
Pre-launch gate proven by unit matrix + scripted smoke —
report at `plans/261020-1656-countdown-prelaunch-implementation/reports/tester-261020-prelaunch-smoke.md`.
Spec promoted as `docs/features/F005_CountdownPrelaunch/` + `docs/screens/SCR006_CountdownPrelaunch/`.

**Breaking:** `EVENT_START_AT` (server-only) replaces `NEXT_PUBLIC_EVENT_START_AT` —
existing `.env.local` files need manual cleanup + dev server restart.

## F007 — Kudos Send Dialog / Viết Kudo (complete 2026-10-23)

Plan: `plans/261022-2157-viet-kudo-send-dialog/plan.md` — phases 01–06 completed, phase 07
verification run inline (Track A UI done up front).

**Quality gates:** 634/634 vitest unit, 181/181 Playwright E2E (×2 consecutive runs after
`supabase db reset` ×2) + seed-sanity 7/7, `tsc`/`eslint`/`build` all exit 0.
Inspection round 1 returned REWORK (critical: anonymous-image identity leak via uid storage paths) —
reworked to identity-free image registry paths; re-inspection SEALED (score 8, 0 critical).

**Deferred:** full F006 45-e2e regression until PR #6 (`fix/kudos-spotlight-and-e2e`) merges and
main is re-merged; PM copy review list; `app_settings.storage_public_base` per-environment deploy
note; hardening (reserve race, send rate limit, orphan sweep).

## F008 — Profile (complete 2026-10-27)

Plan: `plans/261027-1257-profile-self-implementation/plan.md`. Spec promoted as `docs/features/F008_Profile/` (SCR009/SCR010 in `docs/generated/screen-list.md`).

**Anonymity boundary:** OTHER face has no counts and no Sent feed; own Sent uses caller-scoped `own_sent_kudos`. See [changelog](project-changelog.md).

**Deferred / open:** Secret Box opening stays disabled; badge slots are locked placeholders; `docs/generated/` inventories need `/tkm:rebuild-spec` (pre-F006 stale); `/admin` is still a placeholder.

## Next Milestones

1. User fills Google OAuth credentials → re-run blocked e2e rows.
2. Define and plan the real Todo feature (replaces `/todo` placeholder).

## Success Metrics

- All quality gates stay green on `main`.
- No committed secrets (enforced: `.gitignore` negations + pre-commit grep).
