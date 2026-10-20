---
phase: 03
title: Category nav scroll-spy + focus management
feature: F004
status: completed
depends: []
---

# Phase 03 — Scroll-Spy and Focus

## Context Links
- FR-007..010, FR-014, DEC-001, SM-001, ALG-001, BR-005/006, SC-004..006 in [technical-spec.md](spec/awards-information/technical-spec.md)
- Clarifications: active = section in upper third; hash NOT updated on scroll, only on click
- Current: `src/components/awards/category-nav.tsx` (hash via `useSyncExternalStore`)

## Overview
P2 · Track B · parallel with 02. Active item follows scroll; click keeps scroll + `replaceState` hash and moves focus to the section heading.

## Requirements
- Initial active: valid hash → that slug, else first (BR-005, TC ID-13; no error on unknown/empty hash or missing element).
- Scroll: IntersectionObserver on the 6 `section#slug`, `rootMargin: "0px 0px -66% 0px"`, threshold 0 (band = upper third).
  Active = `selectActiveSection(order, intersecting, previous)` → LAST slug in document order among intersecting, else previous (ALG-001).
- Scroll never writes the hash. Click: scrollIntoView (instant if reduced motion, BR-006), `replaceState` `#slug`, active = slug,
  focus `section h2` with `{ preventScroll: true }`.
- Suppress spy updates during click-initiated smooth scroll (release on `scrollend`, timeout fallback ~1s) — no flicker through intermediate items.
- Observer disconnected on unmount; `aria-current` on exactly one item; hashchange (back/forward, deep-link) still sets active.

## Architecture
- `select-active-section.ts`: pure fn, no DOM.
- `use-active-category.ts`: client hook — external-store pattern (keeps lint `set-state-in-effect` clean), owns observer + hash subscription + click lock; returns `{ activeSlug, activate(slug) }`.
- `category-nav.tsx`: consumes hook; props interface UNCHANGED (contract with 02).

## Related Code Files
- Create: `src/components/awards/select-active-section.ts`, `select-active-section.test.ts`, `use-active-category.ts`, `category-nav.test.tsx`
- Modify: `src/components/awards/category-nav.tsx`
- Do NOT touch: any 02-owned file

## Implementation Steps
1. TDD `select-active-section.test.ts`: none intersecting → previous; one → it; two adjacent → later one; order independent of Set insertion; unknown slugs ignored.
2. Implement pure fn.
3. TDD `category-nav.test.tsx` (jsdom; stub `IntersectionObserver`, `scrollIntoView`, `matchMedia`): unknown hash → first active;
   click → `aria-current` moves, hash set, focus on target `h2` (fixture section with `h2 tabIndex=-1`); simulated IO entry → active changes, hash unchanged; unmount → `disconnect` called.
4. Implement hook + wire nav. Gates: tsc, lint, vitest, build.

## Todo List
- [x] pure fn tests red → green
- [x] nav tests red → green
- [x] hook + nav wired, props unchanged
- [x] gates green

## Success Criteria
SC-004/005/006 hold in browser; unit tests cover ALG-001 + click/focus/no-hash-on-scroll.

## Risk Assessment
- Smooth-scroll fights spy (High/Med) → click lock until `scrollend`/timeout.
- Last section (MVP) never reaches band on short viewports (Low/Low) → Kudos + footer below give scroll room; e2e verifies at 1440x900.
- Hydration mismatch (Med/Med) → server snapshot = first slug; hash read client-side only (as today).

## Security
None (client-only UI state).

## Next Steps
04 covers ID-9..11, ID-13 and scroll-spy in browser.
