---
phase: 02
title: Awards dictionary (VN/EN) + server wiring + localized title
feature: F004
status: completed
depends: []
---

# Phase 02 — Awards Dictionary and Wiring

## Context Links
- FR-011, FR-012, SC-007 (US004); FR-003/005/006, BR-003/004 in [technical-spec.md](spec/awards-information/technical-spec.md)
- Pattern: `src/lib/i18n/home-dictionary{,-vi,-en,.test}.ts`, `get-request-locale.ts`
- Clarifications: VN/EN switch; caption follows frame "Sun* Annual Awards 2025"; tab title localized

## Overview
P2 · Track B · parallel with 03. Move every hard-coded string out of awards components into an awards
dictionary; page reads locale server-side and passes copy as props.

## Requirements
- `getAwardsMessages(locale): AwardsMessages`; vi = EXACT copy now in `awards-data.ts`, `award-detail-list.tsx`
  (`NAV_LABELS`, incl. `\n` breaks), `award-detail-card.tsx` (labels, "Hoặc"), `awards-hero.tsx` (caption, heading, alts),
  `category-nav.tsx` default ariaLabel. en = dev draft. Per-award content keyed by `AwardSlug` (`Record<AwardSlug, ...>`).
- Keys include `meta.title` (vi = "Hệ thống giải thưởng SAA 2025", en draft) for `generateMetadata`.
- `awards-data.ts` keeps only non-copy data (images, quantities-as-numbers if any) or is deleted if empty — no copy left (SC-007).
- Card `<h2>` gets `tabIndex={-1}` (contract for 03); section ids/`scroll-mt-28` unchanged.
- Kudos section unchanged (home dictionary, FR-013).

## Architecture
`page.tsx`: replace static `metadata` with `generateMetadata` (`getRequestLocale` → `getAwardsMessages`).
Body: one async server child inside existing `<Suspense>` reads locale once, renders hero + list + Kudos with props.
Components become prop-driven (drop VN defaults → no duplicate copy, DRY). Read
`node_modules/next/dist/docs/` on `generateMetadata` + `cacheComponents` (runtime data in metadata) first.

## Related Code Files
- Create: `src/lib/i18n/awards-dictionary.ts`, `awards-dictionary-vi.ts`, `awards-dictionary-en.ts`, `awards-dictionary.test.ts`
- Modify: `src/app/(site)/awards/page.tsx`, `src/components/awards/{awards-data.ts,awards-hero.tsx,award-detail-list.tsx,award-detail-card.tsx}`
- Do NOT touch: `category-nav.tsx` (03), `src/lib/i18n/home-dictionary*` (except removing provably dead `placeholder.awardsTitle`, if unused)

## Implementation Steps
1. TDD: write `awards-dictionary.test.ts` (copy `collectPaths`/`collectStrings` helpers): vi/en key parity incl. array lengths;
   no empty strings; all 6 `AwardSlug` present; vi snapshot of quantity/prize lines = digest table (SC-002); caption = "Sun* Annual Awards 2025".
2. Implement dictionary files until green.
3. Wire page + components; pass `ariaLabel` + localized nav labels into `CategoryNav`.
4. `grep` awards components for Vietnamese diacritics → zero hits.
5. Gates: `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build`.

## Todo List
- [x] parity test red → green
- [x] page + 4 components prop-driven, `generateMetadata`
- [x] heading `tabIndex={-1}`
- [x] no hard-coded VN in `src/components/awards/` (excl. 03 files)
- [x] gates green

## Success Criteria
Switching VN/EN on `/awards` changes all page copy + tab title; vi render pixel-identical to Track A; unit parity green.

## Risk Assessment
- `generateMetadata` reading cookies under `cacheComponents` may fail build (Med/Med) → follow Next 16 docs; fallback: keep page dynamic via existing Suspense, document.
- Copy drift while moving strings (Med/High) → move verbatim, vi assertions in test, visual diff vs frame by eye.

## Security
Locale from validated cookie (existing fallback → vi). No user input rendered.

## Next Steps
04 asserts VN/EN switch + title.
