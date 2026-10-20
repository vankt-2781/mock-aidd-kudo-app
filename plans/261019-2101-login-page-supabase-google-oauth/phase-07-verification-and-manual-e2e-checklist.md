---
phase: 07
title: "Verification + manual e2e checklist"
status: completed
priority: P1
effort: 1.5h
feature: F001
track: B
blockedBy: [phase-05, phase-06]
---

# Phase 07 — Verification + manual e2e checklist

## Context Links
- [research/momorph-login-screen-test-cases.csv](research/momorph-login-screen-test-cases.csv) (17 TCs) · SC-001..SC-006

## Overview
P1 · completed. All gates green, 17-TC checklist written, docs + README updated, reviewer verdict SEALED. Remaining external items (Docker stack, Google creds) documented as blocked in the checklist — re-runnable by the user, not outstanding work.

## Requirements
- Gates: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build` exit 0.
- Integration smoke (local supabase running): curl checks from phase 03.
- Checklist file with one row per TC: TC_ID, objective, steps summary, expected, status (pass/fail/blocked-creds), note.

## Related Code Files (ownership)
Create:
- `plans/261019-2101-login-page-supabase-google-oauth/reports/manual-e2e-checklist.md`
Modify:
- `README.md` — short "Run locally" section linking `docs/supabase-google-oauth-setup.md`
- `docs/` — create/refresh `system-architecture.md`, `project-changelog.md` (via doc-writer)

## TC Mapping Notes
- ACCESSING 45278c06, FUNCTION f62b0c97 → SC-004/SC-006 (need session → creds)
- GUI ×9 (logo, language position, footer fixed, hero art, title/desc, button, dropdown, default VN, flag+chevron) → verifiable now without creds
- FUNCTION 60bc5bbb → expected "same-tab redirect" (superseded wording; note in checklist)
- c18649fa hover shadow, 4426635b / cb42461d language dropdown/hover → no creds
- 37eae882 loader, e76aa170 user info → loader verifiable without creds (redirect to Google starts); e76aa170 blocked-creds until user fills `GOOGLE_CLIENT_ID/SECRET`

## Implementation Steps
1. Run gates; fix-forward via owning phase if red (do not skip tests).
2. `npx supabase start`, `npm run dev`; run curl smoke.
3. Execute non-cred TCs in browser; mark creds-dependent rows `blocked-creds`.
4. Write checklist; hand docs to doc-writer; reviewer pass.

## Todo List
- [x] gates green — npm test 40/40 (final count after avatar fix, evidence temper-run-v3-01..02), tsc clean, eslint src clean, npm run lint clean (after .claude/** ignore), build clean (evidence temper-run-v2-01..05)
- [x] curl smoke — 10/10 checks incl. footer fixed and stale sb cookie → 307 (evidence temper-run-v2-06)
- [x] checklist (17 rows) — reports/manual-e2e-checklist.md: 7 PASS, 1 PASS-PER-DESIGN, 1 PASS-PER-CLARIFICATION, 1 PASS-STATIC, 3 PENDING-BROWSER, 3 BLOCKED-STACK (Docker), 1 BLOCKED-CREDS (Google) — blocked rows carry exact re-test steps
- Note: earlier 39-test count predates the avatar fix; plan's "~44 across 7" was an estimate.
- [x] docs + README — README "Run locally" section added; docs layer bootstrapped via rebuild-spec (13 artifacts in docs/system + docs/generated); docs/development-roadmap.md + docs/project-changelog.md created
- [x] reviewer — inspection-verdict.json SEALED, score 9; temper-results.json 18/18 pass

## Success Criteria
All gates exit 0; 17/17 TCs listed; ≥ 13 pass now, remaining marked blocked-creds with exact re-test steps.

## Risk Assessment
| Risk | L/I | Mitigation |
|------|-----|------------|
| No Docker → can't smoke | M/M | Record as blocked; unit + build still gate |
| Creds never provided | M/M | Checklist re-runnable by user |

## Security Considerations
`git diff --cached` grep for `GOOGLE_CLIENT_SECRET=` values / keys before any commit.

## Next Steps
User fills Google creds → re-run blocked rows → promote spec.
