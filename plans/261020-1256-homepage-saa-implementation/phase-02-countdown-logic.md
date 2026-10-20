---
phase: 02
title: Countdown logic (pure calc + live client wrapper)
feature: F003
status: completed
depends: []
---

# Phase 02 — Countdown Logic

## Context Links
- Spec: [technical-spec.md](spec/homepage-saa/technical-spec.md) US002, ALG-001, BR-002, SM-001, FR-012..014
- TCs: ID-39..43, 56, 57, 60 ([digest](research/momorph-homepage-specs-notes.md))
- Clarifications: env `NEXT_PUBLIC_EVENT_START_AT`, value `2025-12-26T18:30:00+07:00`, invalid → 00s no crash
- Presentational target: `src/components/home/hero-countdown.tsx` (Phase 01, read-only here)

## Overview
Priority P1 · Track B · parallel with 03, 04. Pure date-diff function (TDD first) + client component that ticks per minute and feeds `HeroCountdown`.

## Key Insights
- `cacheComponents: true`: reading current time during prerender errors. Server passes `initialNow` (ms) obtained after `await connection()` (done by phase 05 inside Suspense); client first render uses it (no hydration mismatch), then recomputes from `Date.now()` in `useEffect`.
- Use absolute instants (ms) → client timezone irrelevant.
- `Date.parse` accepts non-ISO strings; validate with a strict ISO-8601-with-offset regex first.

## Requirements
- `computeCountdown(startAt: string | undefined, nowMs: number)` → `{ days, hours, minutes: string; showComingSoon: boolean; phase: "invalid" | "counting" | "started" }`.
  - Invalid/missing/empty → `00/00/00`, `showComingSoon=false`, phase `invalid`.
  - `diff = max(0, start - now)`; floor to whole minutes; days = mins/1440, hours = mins%1440/60, minutes = mins%60; `pad2` (≥2 digits; days >99 render as-is).
  - `now >= start` → `00/00/00`, hidden, phase `started`.
- `parseEventStart(value)` → ms or `null`; regex `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$` + `!isNaN`.
- `LiveHeroCountdown` (`"use client"`): props `{ startAt?: string; initialNow: number; comingSoonLabel: string }`; renders `HeroCountdown` with computed values; schedules `setTimeout` to next minute boundary of remaining time, then every 60s; clears timer on unmount and when phase ≠ counting.
- Env: add `NEXT_PUBLIC_EVENT_START_AT=2025-12-26T18:30:00+07:00` to `.env.example` and `.env.local`.

## Architecture
`env string + nowMs → parseEventStart → computeCountdown → {values, showComingSoon} → HeroCountdown`. No I/O.

## Related Code Files
Create: `src/lib/countdown/compute-countdown.ts`, `src/lib/countdown/compute-countdown.test.ts`, `src/components/home/live-hero-countdown.tsx`, `src/components/home/live-hero-countdown.test.tsx` (`// @vitest-environment jsdom`).
Modify: `.env.example`, `.env.local`.
Do NOT touch: `hero-countdown.tsx`, `hero-section.tsx`, `src/app/**`, package.json.

## Implementation Steps
1. Write failing tests for `computeCountdown`: future (e.g. 5d 9h 3m → "05","09","03"), exactly now, past, 59s left (floors to "00/00/00" but `showComingSoon=true`, phase counting, since now < start), missing, "", "2025-12-26" (no time), "garbage", "2025-13-40T99:00+07:00", offset vs Z equivalence (TC ID-56/57/60).
2. Implement until green.
3. Component tests with `vi.useFakeTimers()`: renders initial values from `initialNow`; after mount uses `Date.now()`; advancing 60s drops MINUTES by 1 with rollover (ID-39); reaching start hides "Coming soon" and stops timer (ID-41/42); invalid env shows 00s, no throw (ID-60).
4. Implement `LiveHeroCountdown`. Add env lines.

## Todo
- [x] compute-countdown tests (red) → impl (green)
- [x] live-hero-countdown tests (red) → impl (green)
- [x] env var in .env.example + .env.local
- [x] `npx vitest run` + `npx tsc --noEmit` + `npx eslint` green

## Success Criteria
All countdown unit tests green; every listed TC ID cited in a test name; no `Date` call at module scope.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Hydration mismatch from time | M | M | First render uses `initialNow` prop only; real `Date.now()` in effect |
| Timer drift / leak | L | M | Re-align to minute boundary each tick; cleanup on unmount; test with fake timers |
| Lenient parsing accepts junk | M | L | Strict regex before `Date.parse` |

## Security Considerations
`NEXT_PUBLIC_*` is public by design; holds no secret.

## Next Steps
Phase 05 renders `LiveHeroCountdown` inside the hero via `HeroSection` props.
