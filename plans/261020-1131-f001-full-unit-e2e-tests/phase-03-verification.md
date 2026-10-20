---
phase: 03
title: Verification — full gate run + coverage map
feature: F001
status: completed
blockedBy: [01, 02]
---

# Phase 03 — Verification

Run all gates on final code and produce the coverage map vs test-cases.md.

1. `npm test` (vitest, all units incl. new jsdom tests)
2. `npx tsc --noEmit`, `npm run lint`, `npm run build`
3. `npm run test:e2e` (Playwright; Supabase local + dev server up)
4. Coverage map: every TC001–TC041 → automated test name (UT or E2E) | covered-by-unit | MANUAL (reason). Output: plans/261020-1131-f001-full-unit-e2e-tests/reports/test-coverage-map.md
5. Evidence files per command into plans/261020-1131-f001-full-unit-e2e-tests/evidence/

## Todo
- [x] all gates green (vitest 75/75, tsc 0, eslint 0, lint 0, build 0, e2e 23/23; vitest and e2e each run twice, no flakes)
- [x] coverage map written (reports/test-coverage-map.md: 30 automated, 8 partial + MANUAL, 3 weak/manual)
- [x] evidence emitted (evidence/temper-run-01..08 + raw-temper-runs.json)
