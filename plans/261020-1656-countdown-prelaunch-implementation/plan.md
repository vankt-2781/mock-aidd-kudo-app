---
title: "Countdown Prelaunch (/countdown) — ticker, launch gate, event-config API, env unification"
description: "Wire the built prelaunch UI to a live per-second ticker, add the proxy launch gate with admin bypass, GET /api/event-config, and unify on EVENT_START_AT."
status: completed
priority: P1
effort: 9h
branch: feature/countdown-prelaunch
tags: [countdown, prelaunch, proxy, launch-gate, i18n, api, env, nextjs, momorph]
created: 2026-10-20
work_type: feature
spec: docs/features/F005_CountdownPrelaunch/
system_docs: [docs/system/permissions.md, docs/system/architecture.md]
---

# Countdown Prelaunch — Plan

MoMorph: Countdown - Prelaunch https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU
Contract: [spec/countdown-prelaunch/technical-spec.md](spec/countdown-prelaunch/technical-spec.md) (FR-001..009, BR-001..003, DEC-001, SM-001, ALG-001, SC-001..005) ·
Decisions: [clarifications.md](clarifications.md) · Digest: [research/momorph-prelaunch-screen-digest.md](research/momorph-prelaunch-screen-digest.md)

| Phase | File | Track | Depends | Effort | Status |
|-------|------|-------|---------|--------|--------|
| 00 | Track A UI (prelaunch-screen/unit/digit, bg, page shell) | A | — | done | completed |
| 01 | [phase-01-foundation-libs.md](phase-01-foundation-libs.md) | B | — | 1.5h | completed |
| 02 | [phase-02-proxy-launch-gate.md](phase-02-proxy-launch-gate.md) | B | 01 | 2h | completed |
| 03 | [phase-03-event-config-api-and-env-unification.md](phase-03-event-config-api-and-env-unification.md) | B | 01 | 1.5h | completed |
| 04 | [phase-04-countdown-page-integration.md](phase-04-countdown-page-integration.md) | Integration | 01 | 2h | completed |
| 05 | [phase-05-e2e-verification-and-docs.md](phase-05-e2e-verification-and-docs.md) | Gate | 02,03,04 | 2h | completed |

Parallel: 01 → (02 ‖ 03 ‖ 04, disjoint files) → 05.

## Data flow
Request → `proxy.ts` → `updateSessionInProxy` → `{response, isAuthenticated, isAdmin}` →
`decideLaunchGateRedirect({pathname, now, start: readEventStart()?.start, isAdmin})` (FIRST) →
else `decideRouteRedirect` (unchanged) → `redirectWithCookies` or pass.
`/countdown` page [Suspense, `connection()`] → `readEventStart()` (null → `redirect("/")`, fail-open) +
`getRequestLocale()` → `getPrelaunchMessages` → `<LivePrelaunchCountdown startAt initialNow title labels>` →
1 s tick `computeCountdown(start, now, {maxDays: 99})` → `PrelaunchScreen`; `reachedZero` →
`useLaunchRedirect`: `router.replace("/")` at 1.5 s, then every 5 s while still mounted.
`GET /api/event-config` → `connection()` → `{startAt: iso|null}` + `Cache-Control: no-store`.
Homepage `/` → `readEventStart()?.iso` → `LiveHeroCountdown targetDate` (no cap — unchanged).

## Shared contracts (fixed by 01, consumed read-only by 02/03/04)
- `readEventStart(raw = process.env.EVENT_START_AT): { iso: string; start: Date } | null` — `src/lib/event-config/read-event-start.ts`; valid strict ISO-with-offset only.
- `computeCountdown(start, now, opts?: { maxDays?: number })` — default uncapped (homepage); prelaunch passes 99.
- `getPrelaunchMessages(locale): { meta: {title}; title; labels: {days,hours,minutes} }`.
- `COUNTDOWN_PATH = "/countdown"` exported from 02's `decide-launch-gate-redirect.ts`; 04 hardcodes nothing else.

## Key decisions
- **E2E env = POST-launch.** Real date `2025-12-26T18:30:00+07:00` is already past (today 2026-10-20), pinned in `playwright.config.ts` `webServer.env` → all 98 existing specs stay un-gated. Pre-launch gate matrix proven by unit tests (pure decision + `proxy()` wiring); countdown display TCs by jsdom ticker tests; e2e covers post-launch inversion + API. Pre-launch = documented manual smoke (05). Second dev server rejected (one `.next` dir, doubled compile, flaky).
- Fail-open (BR-003) doubles as ops kill-switch: unset/past `EVENT_START_AT` → gate off.
- Days cap is opt-in so F003 homepage keeps "120" days behaviour + tests.

## Rollback
Each phase reverts by its own files (git revert per phase commit). Gate (02) emergency-off without deploy: set `EVENT_START_AT` to a past date.

## Done (observable)
tsc + eslint clean; `vitest run` ≥ 186 prior + new green; `next build` ok; Playwright 98 prior + new green; `grep -r NEXT_PUBLIC_EVENT_START_AT src e2e README.md .env.example` empty; SC-001..005 each mapped to a passing test or recorded smoke.

**Delivered 2026-10-20:** tsc 0 · eslint 0 · vitest 312/312 (35 files) · build 0 · Playwright 105/105. Inspection SEALED (score 8, 0 critical); 3 Accept findings fixed post-inspection, 3 Defer findings logged. Spec promoted as `docs/features/F005_CountdownPrelaunch/` + `docs/screens/SCR006_CountdownPrelaunch/`.

## Open
- EN copy + both metadata titles are dev drafts pending PM review.
