# Phase 05 — E2E (post-launch), full verification, manual pre-launch smoke, docs reconciliation

## Context Links
- Plan decision: [plan.md](plan.md) "E2E env = POST-launch"
- Spec: [technical-spec.md](spec/countdown-prelaunch/technical-spec.md) — SC-001..005
- Drafts to promote: [spec/system/permissions.md](spec/system/permissions.md), [spec/system/architecture.md](spec/system/architecture.md)
- Existing: `e2e/fixtures.ts` (`signedInContext`, `adminContext`), `e2e/homepage-countdown.spec.ts` (start read from `data-target-date`)
- Depends: 02, 03, 04

## Overview
Priority P1 · Status done · Effort 2h.
Add one e2e spec, run every gate, record pre-launch smoke, reconcile docs.

## Key Insights
- One dev server = one env; e2e env is post-launch (past real date). Server clock cannot be faked by `page.clock` (browser only) → pre-launch gate is NOT e2e-testable cheaply; it is proven by 02 unit tests + manual smoke here.
- Never hardcode the date in e2e: compare API body with homepage `data-target-date`.

## Requirements
`e2e/countdown-prelaunch.spec.ts`:
- SC-004: guest, `signedInContext`, `adminContext` → `/countdown` ends at `/` (URL `/` exact).
- FR-007: guest `/` and `/awards` load without redirect.
- SC-001: `request.get("/api/event-config")` → 200, `startAt` equals homepage `data-target-date`, `cache-control` contains `no-store`.
Manual pre-launch smoke (record results in `reports/manual-prelaunch-smoke.md`): stop dev server, `EVENT_START_AT=<now+3min ISO +07:00> npm run dev`:
1. guest `/`, `/awards`, `/todo` → `/countdown`; `/login`, `/api/event-config`, `/images/...` not redirected (SC-002).
2. normal user → `/countdown`; admin (re-sign-in after role set) → `/` renders (SC-003).
3. `/countdown` ticks, vi/en title via language cookie, metadata title localized; at zero → 00 00 00 → `/` after ~1.5 s (SC-005).
4. Restore server without override.

## Architecture
Test pyramid: unit (01 libs, 02 gate matrix + proxy wiring, 03 route, 04 ticker/hook) · e2e (post-launch inversion, API, regression of 98 specs) · manual (pre-launch).

## Related Code Files (ownership)
- Create: `e2e/countdown-prelaunch.spec.ts`, `reports/manual-prelaunch-smoke.md` (in plan dir)
- Modify (doc-writer): `docs/system/architecture.md`, `docs/system/permissions.md` (promote drafts), `docs/project-changelog.md`, `docs/development-roadmap.md`, `docs/codebase-summary.md` (new modules: launch-gate, event-config, prelaunch), `docs/features/` + `docs/screens/` new F/SCR entries from spec draft (next free F/SCR ids), `docs/generated/api-map.md` + `route-list.md` rows (surgical)

## Implementation Steps
1. Write e2e spec; run `npx playwright test e2e/countdown-prelaunch.spec.ts`.
2. Full gates: `npx tsc --noEmit`, `npm run lint`, `npm test` (≥ 186 prior + new), `npm run build` (check `/api/event-config` and `/countdown` marked dynamic), `npm run test:e2e` (98 prior + new).
3. Grep gate: `grep -rn NEXT_PUBLIC_EVENT_START_AT src e2e README.md .env.example docs --exclude=project-changelog.md` empty.
4. Manual pre-launch smoke; write report.
5. Hand docs to `doc-writer`: promote system drafts, feature/screen docs, changelog ("EVENT_START_AT replaces NEXT_PUBLIC_EVENT_START_AT — breaking for env configs"), roadmap. Docs impact: major.
6. Reviewer agent pass; then update plan.md statuses.

## Todo List
- [x] e2e spec green
- [x] tsc / lint / vitest / build / full e2e green
- [x] grep gate empty
- [x] pre-launch smoke recorded (scripted — see Deviations)
- [x] docs reconciled (via delivery doc-writer — see Deviations)
- [x] review done, plan statuses updated

## Deviations
- Pre-launch smoke was run **scripted, not manual**; results recorded at `reports/tester-261020-prelaunch-smoke.md` (instead of the planned `reports/manual-prelaunch-smoke.md`).
- Docs reconciliation (step 5) was deferred to the delivery doc-writer pass: spec promoted as `docs/features/F005_CountdownPrelaunch/` + `docs/screens/SCR006_CountdownPrelaunch/`, system/generated docs updated.
- Debugger fixed 3 e2e flakes at root cause along the way: awards `#mvp` deep-link Suspense reveal (ResizeObserver re-scroll in `use-active-category.ts`), visible-wait in awards spec, clock margin in homepage-countdown spec.
- Final gates: tsc 0 · eslint 0 · vitest 312/312 (35 files) · build 0 · Playwright 105/105. Inspection SEALED (score 8, 0 critical); 3 Accept findings fixed post-inspection (ResizeObserver settle guard, pre-launch allow-list narrowed to exact `/api/event-config` + `/auth/callback`, new `src/proxy-matcher.test.ts`); 3 Defer findings logged (invalid-env warning log, redirect retry cap, env-rename deploy note).

## Success Criteria
All gates green with real exit codes; SC-001..005 each mapped (unit/e2e/smoke) in the smoke report table.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Reused dev server has stale env → homepage/API e2e fail | M | M | restart after 03 step 6; webServer.env pin |
| Admin JWT lacks role in smoke | M | L | sign out/in after setting role |
| Flaky redirect timing | L | L | `toHaveURL` with default 15 s expect timeout |

## Security Considerations
Smoke uses local Supabase only; no credentials in report. `.env.local` never read or committed.

## Next Steps
PR to `main` after review; PM review of EN copy + metadata titles.
