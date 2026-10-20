---
title: "Login with Google (Supabase local + Next.js 16)"
description: "Wire /login to Supabase Google OAuth, VN/EN locale cookie, proxy route guard, protected /todo placeholder."
status: completed
priority: P1
effort: 9h
branch: main
tags: [auth, supabase, google-oauth, i18n, nextjs, momorph]
created: 2026-10-19
work_type: feature
spec: docs/features/F001_LoginWithGoogle/
system_doc_drafts:
  - plans/261019-2101-login-page-supabase-google-oauth/spec/system/architecture.md
  - plans/261019-2101-login-page-supabase-google-oauth/spec/system/permissions.md
---

# Login with Google — Plan

MoMorph: Login https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
Clarifications (authoritative): [clarifications.md](clarifications.md) · Test cases: [research/momorph-login-screen-test-cases.csv](research/momorph-login-screen-test-cases.csv)

## Flow
`click → signInWithOAuth(google, redirectTo=/auth/callback) → Google → /auth/callback (exchangeCodeForSession) → /todo | /login?error=oauth`
Every page request → `src/proxy.ts` (session refresh + DEC-001 guard). Locale: `NEXT_LOCALE` cookie (`vi`|`en`, fallback `vi`).

## Phases

| # | Phase | Track | Status | Effort | Blocked by |
|---|-------|-------|--------|--------|------------|
| 01 | [Login UI (presentational)](phase-01-login-ui-presentational.md) | A | completed | — | — |
| 02 | [Deps, env, Supabase local](phase-02-deps-env-and-supabase-local-setup.md) | B | completed | 1.5h | — |
| 03 | [Supabase clients, callback, proxy guard](phase-03-supabase-clients-auth-callback-and-proxy-guard.md) | B | completed | 2h | 02 |
| 04 | [i18n lite (vi/en + cookie)](phase-04-i18n-lite-dictionaries-and-locale-cookie.md) | B | completed | 1h | 02 |
| 05 | [/todo placeholder + logout](phase-05-todo-placeholder-and-logout.md) | B | completed | 1h | 03 |
| 06 | [Login integration](phase-06-login-page-integration.md) | A+B | completed | 2h | 01, 03, 04 |
| 07 | [Verification + manual e2e](phase-07-verification-and-manual-e2e-checklist.md) | — | completed | 1.5h | 05, 06 |

All phases completed 2026-10-19. Gates: 40/40 tests, tsc/lint/build exit 0, route smoke 10/10, review verdict SEALED (score 9). External items blocked (Docker stack rows, Google creds row) are documented in [reports/manual-e2e-checklist.md](reports/manual-e2e-checklist.md) with re-test steps.

Parallel windows: {03, 04} after 02; {05, 06} after 03+04. No two parallel phases share a file (ownership listed per phase).

## Key Decisions
- Next.js 16: `middleware.ts` is renamed `proxy.ts` (export `proxy`). Read `node_modules/next/dist/docs` before coding.
- Guard uses verified lookup (`getClaims()`/`getUser()`), never `getSession()`.
- Callback always redirects `/todo` (spec: no return-to URL) — no `next` param, removes open-redirect surface.
- Pure decision fns (`decideRouteRedirect`, `resolveCallbackRedirect`, `resolveLocale`) carry the logic; Vitest unit-tests them.
- Same-tab redirect supersedes TC 60bc5bbb ("new tab or popup").

## Test Matrix
| Level | What |
|-------|------|
| Unit (Vitest) | resolveLocale/BR-003, dictionary key parity, decideRouteRedirect/DEC-001, resolveCallbackRedirect/DEC-002 |
| Integration | `npm run build` + `lint` + `tsc`; curl `/todo` unauth → 307 `/login`; `/auth/callback` no code → `/login?error=oauth` |
| E2E (manual) | 17 MoMorph TCs checklist in phase 07; OAuth rows need real Google creds |

## Rollback
Each phase is additive (new files) except 06 (edits UI files from 01) — revert via git per phase. Removing `src/proxy.ts` disables the guard without breaking pages.

## Done (observable)
SC-001..SC-006 pass; `npm test`, `npm run lint`, `npm run build` exit 0; no secrets in `git status`.
