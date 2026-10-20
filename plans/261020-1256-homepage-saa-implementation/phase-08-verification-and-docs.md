---
phase: 08
title: Verification gates + docs/designer notes
feature: F003
status: completed
depends: [07]
---

# Phase 08 — Verification and Docs

## Context Links
- All prior phases; SC-001..SC-013 in [technical-spec.md](spec/homepage-saa/technical-spec.md)
- Docs: `docs/project-changelog.md`, `docs/development-roadmap.md`

## Overview
Priority P1 · Gate. Run every gate, prove SC coverage, record copy deviations for the designer.

## Requirements
- Gates (real exit codes): `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`, `npx playwright test`.
- Coverage table in `reports/verification-homepage-saa.md`: SC-001..013 and TC ID-0..61 → test name (unit or e2e) or manual justification.
- Designer flags (same report, section "Designer copy flags"): footer "vè" → "về"; "Comming soon" → "Coming soon"; "Tiêu chuẩn chung" has no target; widget menu items TBD; EN copy pending PM.
- Docs: changelog entry (Homepage SAA, placeholder routes, admin role via `app_metadata.role`, env `NEXT_PUBLIC_EVENT_START_AT`); roadmap progress. Hand broader docs sync to `doc-writer`.
- Update plan.md + phase statuses.

## Related Code Files
Modify: `docs/project-changelog.md`, `docs/development-roadmap.md`, `plan.md`, phase files (status only).
Create: `reports/verification-homepage-saa.md`.
Do NOT touch: `src/**`, `e2e/**` (failures go back to owning phase).

## Implementation Steps
1. Run gates; on failure route to owning phase, re-run.
2. Fill coverage table; manual check at 375/768/1440 for layout TCs not asserted.
3. Write designer flags; docs updates; statuses.

## Todo
- [x] all 5 gates exit 0 (tsc, lint, eslint, build, vitest 164/164, playwright 79/79; repeated once; evidence in `evidence/temper-run-*.json`)
- [x] SC + TC coverage table complete (`reports/homepage-tc-coverage-map.md`; 62/62 TC rows mapped, 13/13 SC rows mapped; caveats listed)
- [x] designer flags recorded (same report, "Designer copy flags" section)
- [x] changelog + roadmap updated — delivery step (done 2026-10-20: `docs/project-changelog.md` F003 entry, `docs/development-roadmap.md` F003 milestone)

## Verification Status (2026-10-20)
- Gates: green. Coverage tooling: `@vitest/coverage-v8` is not installed, so line/branch/function numbers were not produced (BLOCKED, see evidence run 09).
- Open caveats: ID-28 vs digest mismatch, ID-62 click path untested end-to-end, logo size 52x48 vs spec 64x60, ID-60 unit-only. Details in the coverage report.
- Report name differs from the plan: the coverage and flags report is `reports/homepage-tc-coverage-map.md`, not `reports/verification-homepage-saa.md`.

## Success Criteria
Five gates green; zero unmapped TC IDs; flags listed.

## Risk Assessment
Local Supabase not running → e2e unrunnable: report BLOCKED with command output, never mark green.

## Security Considerations
Confirm no secrets in `.env.example` (only `NEXT_PUBLIC_EVENT_START_AT` added).

## Next Steps
Review (`reviewer`), then promote spec draft (`F003` → real F###).
