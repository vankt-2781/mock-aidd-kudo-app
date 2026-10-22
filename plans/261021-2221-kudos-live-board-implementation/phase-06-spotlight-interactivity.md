# Phase 06 — Spotlight interactivity (SVG word cloud, pan/zoom, tooltip, search, states)

## Context Links
- Spec: FR-019/020/021/022/023, ALG-001, SM-003, SC-009 (deviation TC-9e689933: empty search = no-op)
- Depends: 02 (`getSpotlightData`, `SpotlightData` type), 03 (`KUDOS_LOGIN_HREF`, read-only import), 04 (`messages.spotlight`)
- Existing: `src/components/kudos/kudos-spotlight-section.tsx`, `kudos-spotlight-panel.tsx` (static 1157×548 canvas, search input, activity list, pan/zoom button), `spotlight-words.ts` (static layout; font 6.7px+ → derive size range from it)

## Overview
Priority P2 · Status pending · Effort 3h · Parallel with 05. Hand-rolled, no new dependency.

## Key Insights
- Keep the 1157×548 design canvas as the SVG base `viewBox`; pan/zoom only rewrite `viewBox` (FR-021) → crisp text, no CSS transform math.
- Layout in a pure module, deterministic (same input → same output): sort by `kudosCount desc, name asc, profileId asc`; Archimedean spiral from center; box width estimate `name.length × fontSize × 0.6` (no DOM measure → SSR-safe, testable). Computed on the server and passed as plain props.
- Node cap 100 (largest counts) — default for the spec TBD; font range 8–28 canvas px linear on count (derived from design min 6.7 rounded for legibility; PM note).
- Search normalization: lowercase + NFD strip marks + `đ→d` so "hiep" matches "Hiệp"; `maxLength={100}` on input enforces the 101st-char rejection; whitespace-only = no-op.
- Node click = gated navigation: signed-in → `/kudos/<latestKudosId>`; visitor → `KUDOS_LOGIN_HREF` (`<a>` inside SVG).
- Mode toggle: pan (drag moves viewBox) ↔ zoom (wheel/drag zooms around pointer); zoom clamp 1×–4×, pan clamped to canvas bounds.

## Requirements
- `src/lib/kudos-spotlight/spotlight-word-cloud-layout.ts`: `layoutWordCloud(nodes, canvas, opts?) → PlacedWord[] {profileId, name, x, y, width, height, fontSize, href-agnostic}`; no overlaps; nodes that cannot be placed within N spiral steps are dropped (logged count).
- `src/lib/kudos-spotlight/spotlight-viewbox.ts`: `zoomViewBox(vb, factor, focus, canvas)`, `panViewBox(vb, dx, dy, canvas)` with clamps; `formatViewBox(vb)`.
- `src/lib/kudos-spotlight/spotlight-search-match.ts`: `normalizeSearchText`, `matchesSpotlightSearch(name, query)` (empty → null meaning "no filter").
- `kudos-spotlight-section.tsx` (async server): `getSpotlightData()` → layout → `<KudosSpotlightPanel>`; exports `KudosSpotlightLoading` (skeleton with `aria-busy`, `messages.loading`). Empty (`nodes.length === 0`) → empty state with total 0.
- `kudos-spotlight-panel.tsx` (client): total `"{total} KUDOS"`, search input, SVG `<text>` nodes (matched → highlighted color `#F17676`, others dimmed `opacity .25` only when query active), hover/focus tooltip (name + `formatKudosTime(latestReceivedAt)`), mode toggle button with tooltip (`title` + `aria-pressed`), activity list from data (`messages.spotlight.activityText`).
- Split if > 200 lines: `kudos-spotlight-canvas.tsx` (SVG + pointer handlers), `kudos-spotlight-tooltip.tsx`.
- Delete `spotlight-words.ts` (static layout replaced). Stop importing `KUDOS_COPY`.

## Architecture
```
KudosSpotlightSection (server) → getSpotlightData() → layoutWordCloud() → Panel(client)
Panel state: query, mode('pan'|'zoom'), viewBox, hovered
  pointer/wheel → panViewBox|zoomViewBox → <svg viewBox=…>
  query → matchesSpotlightSearch per word → class
```

## Related Code Files (ownership)
- Modify: `src/components/kudos/kudos-spotlight-section.tsx`, `src/components/kudos/kudos-spotlight-panel.tsx`
- Create: `src/lib/kudos-spotlight/spotlight-word-cloud-layout.ts`, `spotlight-viewbox.ts`, `spotlight-search-match.ts` (+ `.test.ts` each), `src/components/kudos/kudos-spotlight-canvas.tsx`, `kudos-spotlight-tooltip.tsx`, `kudos-spotlight-panel.test.tsx`
- Delete: `src/components/kudos/spotlight-words.ts`
- Read-only: `kudos-types.ts` (02), `src/lib/kudos/**` (02), dictionary (04)

## Implementation Steps
1. FIRST commit: final `KudosSpotlightSection` signature + `KudosSpotlightLoading` export rendering the existing panel with real data (unblocks 05's final call).
2. Tests: layout (deterministic across calls, no pairwise overlap, all inside canvas, larger count ⇒ font ≥, cap 100, 0 nodes → []); viewBox (zoom clamps 1–4×, focus point stays fixed, pan clamps); search (diacritics, case, whitespace → null, no match → all dimmed).
3. Implement pure modules.
4. jsdom panel tests: empty state copy; hover shows name + time; typing highlights; 101st char not accepted (`maxLength`); mode toggle flips `aria-pressed`; node link href visitor vs signed-in.
5. Implement panel/canvas/tooltip; delete `spotlight-words.ts`.
6. tsc + eslint + `npx vitest run src/lib/kudos-spotlight src/components/kudos/kudos-spotlight-panel.test.tsx`.

## Todo List
- [ ] section signature + loading export (first)
- [ ] layout / viewbox / search (TDD)
- [ ] panel + canvas + tooltip (TDD)
- [ ] static words deleted
- [ ] gates green

## Success Criteria
SC-009 behaviours unit/jsdom-proven; e2e (07) sees a seeded name, tooltip, search highlight, gated click.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Spiral O(n²) slow for 100 nodes on each request | L | L | n ≤ 100 → ≤ 10⁴ box checks; server-side, cheap |
| Width estimate overlaps for wide glyphs | M | L | 0.6 factor + 2px padding; visual check |
| Touch devices: no hover | M | L | tooltip also on focus; tap = gated link (spec: touch TBD) |
| Wheel zoom hijacks page scroll | M | M | wheel handled only in zoom mode, `preventDefault` inside canvas only |

## Security Considerations
Names rendered as SVG text (React-escaped); no user HTML. Links gated via `KUDOS_LOGIN_HREF`.

## Next Steps
07 e2e spotlight; 08 records cap/size-range/bounds defaults for PM.
