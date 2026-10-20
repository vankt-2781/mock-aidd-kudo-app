---
phase: 04
title: Awards Playwright e2e (15 TC mapping)
feature: F004
status: completed
depends: [02, 03]
---

# Phase 04 — Awards E2E

## Context Links
- TCs: [research/momorph-awards-screen-digest.md](research/momorph-awards-screen-digest.md) · SC-001..008 in technical-spec
- Patterns: `e2e/homepage-navigation.spec.ts`, `e2e/homepage-i18n.spec.ts`, `e2e/fixtures.ts`, `e2e/helpers/`

## Overview
P2 · Tests. One new spec, titles cite `ID-xx`; existing 79 tests stay green (deep-link regression).

## Requirements (test → TC)
- ID-0/1 (CLARIFIED deviation): guest opens `/awards` → 200, no redirect to `/login`, full page; title notes "public per clarification, TC expects auth".
- ID-2: header "Awards Information" → `/awards`, nav item selected (already in homepage-navigation ID-21 — reference, no duplicate).
- ID-3/4: hero caption "Sun* Annual Awards 2025" + gold heading; nav left of cards at 1440, strip above at 375.
- ID-5: 6 nav items in order. ID-6: each card quantity + prize text exact (frame values, incl. Signature "Hoặc"). ID-7: images 336x336 at 1440.
- ID-8: Kudos label/title + "Chi tiết". ID-12: "Chi tiết" → `/kudos`.
- ID-9/11: click each item → section in viewport, exactly one `aria-current`, URL `#slug`, focus on that section's `h2`.
- ID-10: hover changes computed background.
- Scroll-spy (SC-006): `scrollIntoView` each section programmatically → matching item active, URL hash unchanged.
- ID-13: `/awards#unknown` → no console/page errors, first item active.
- VN/EN switch on `/awards`: copy + `document.title` change, persists on reload.
- Reduced motion: `emulateMedia({ reducedMotion: "reduce" })` click still lands section.
- ID-14: MANUAL (network failure to /kudos) — README note only.

## Related Code Files
- Create: `e2e/awards-information.spec.ts`
- Modify: `e2e/README.md` (coverage table rows + deviations ID-0/1, ID-14 manual)
- Read-only: all `src/`

## Implementation Steps
1. Write spec using shared fixtures/console-error helper; assert with `expect.poll` for scroll/active (no fixed sleeps).
2. Run `npx playwright test e2e/awards-information.spec.ts`, then full suite (homepage-navigation `/awards#slug` must stay green).
3. Update README table.

## Todo List
- [x] spec covers ID-0..13 + scroll-spy + i18n + reduced motion
- [x] full e2e suite green (79 + new)
- [x] README coverage rows

## Success Criteria
Every TC ID-0..14 maps to a test or a documented manual/deviation row; zero flaky reruns over 2 consecutive full runs.

## Risk Assessment
- Smooth-scroll timing flake (Med/Med) → poll on `aria-current`/viewport; reduced-motion context for click tests where timing isn't the subject.
- Locale cookie leak between tests (Low/Med) → fresh context per test (existing fixture).

## Security
None.

## Next Steps
05 collects evidence.
