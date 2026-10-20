---
phase: 05
title: Verification gates + coverage map + docs
feature: F004
status: completed
depends: [04]
---

# Phase 05 — Verification and Docs

## Context Links
- All prior phases; SC-001..008; F003 shape: `plans/261020-1256-homepage-saa-implementation/phase-08-verification-and-docs.md` + its `evidence/`

## Overview
P2 · Gate. Run every gate with real exit codes, prove SC/TC coverage, record deviations, update docs.

## Requirements
- Gates: `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`, `npx playwright test` (×2 for flake check).
  Save raw outputs/exit codes to `evidence/` (same JSON shape as F003).
- `reports/verification-awards-information.md`: SC-001..008 and TC ID-0..14 → test name (unit/e2e) or manual justification.
  Deviations section: ID-0/1 (public + `/awards` instead of auth + `/he-thong-giai`), ID-14 manual, Top Talent unit frame-vs-CSV, EN draft pending PM.
- Docs: `docs/project-changelog.md` entry (Awards Information: dictionary, scroll-spy, e2e); `docs/development-roadmap.md` progress.
  Broader docs/spec promotion → hand to `doc-writer`.
- Update plan.md + phase statuses (`tkm plan status`).

## Related Code Files
- Create: `reports/verification-awards-information.md`, `evidence/*`
- Modify: `docs/project-changelog.md`, `docs/development-roadmap.md`, `plan.md`, phase frontmatter

## Todo List
- [x] 5 gates green, evidence saved (npm test 186/186, tsc, eslint, lint, build, e2e 98/98; repeats green; evidence/temper-run-01..10)
- [x] coverage + deviations report (reports/awards-tc-coverage-map.md; line/branch/function % NOT measured, see gap G1)
- [x] changelog + roadmap (done at delivery step 2026-10-20: F004 entry in `docs/project-changelog.md`, F004 milestone in `docs/development-roadmap.md`)
- [x] statuses updated

## Success Criteria
All gates exit 0; every SC/TC row has a target; no red test waived.

## Risk Assessment
Gate failure → back to owning phase (02/03/04), never patched here.

## Next Steps
Reviewer pass, then PR to `main`.
