# Phase 04 — Kudos i18n dictionary (vi exact design copy, en draft) + metadata

## Context Links
- Spec: FR-002/011/012/018/023/026/028/031, SC-014
- Existing pattern: `src/lib/i18n/awards-dictionary.ts` + `-vi.ts` + `-en.ts` + `.test.ts`; `prelaunch-dictionary.ts` (meta title); `src/app/countdown/page.tsx` (`generateMetadata` with locale)
- Copy source: `src/components/kudos/kudos-copy.ts` (Track A, verbatim from frame) + MoMorph spec rows B.3.2/B.3.6 (star tooltips) via `download_specs(MaZUn5xHXZ)`

## Overview
Priority P2 · Status pending · Effort 1h · Parallel with 01, 03. Pure data + types; no component edits (05/06 consume).

## Key Insights
- Frame copy wins over spec prose where they differ (precedent F004): banner `"Hệ thống ghi nhận và cảm ơn"` (kudos-copy) vs spec `"…lời cảm ơn"`; stats button `"Mở Secret Box"` vs spec `"Mở quà"` → keep frame text, list both in PM notes.
- User content (names, hashtags, kudos text) never translated.
- `"Link copied — ready to share!"` is EN in the design → same string in both locales.
- Star tooltip copy must be fetched verbatim (not guessed — MoMorph rule 1).

## Requirements
`KudosMessages`:
- `meta.title` (vi "Sun* Kudos | Sun* Annual Awards 2025", draft)
- `banner {title, logoAlt}`, `actionBar {composePlaceholder, searchSunnerLabel}`, `section {caption, highlightTitle, spotlightTitle, allKudosTitle}`
- `filters {hashtag, department, all: "Tất cả"}`, `carousel {prev, next}`
- `card {copyLink, viewDetail, heartLabel, likeError, copied: "Link copied — ready to share!", copyFailed, emptyKudos: "Hiện tại chưa có Kudos nào.", openImage}`
- `stars {tooltip: Record<1|2|3, string>}`, `heroLabels: Record<KudosHeroTier, string>`
- `spotlight {searchPlaceholder: "Tìm kiếm", panZoomLabel, panMode, zoomMode, totalSuffix: "KUDOS", empty, loading, activityLabel: "Kudos mới nhất", activityText: "{name} đã nhận được một Kudos mới"}` (template with `{name}`; helper `formatMessage` only if not already in i18n lib — else inline replace)
- `stats {received, sent, hearts, boxOpened, boxUnopened, openBox}`, `giftList {title, empty: "Chưa có dữ liệu"}`
- `placeholder {sendDialogTitle, secretBoxTitle, detailTitle, underConstruction, close, backToBoard}`
- `getKudosMessages(locale)`.

## Architecture
`src/lib/i18n/kudos-dictionary.ts` (types + lookup) · `kudos-dictionary-vi.ts` · `kudos-dictionary-en.ts` · `kudos-dictionary.test.ts`. Each < 200 lines.

## Related Code Files (ownership)
- Create: the four files above. Read-only: `kudos-copy.ts` (deleted in 08).

## Implementation Steps
1. Fetch star tooltip copy (MoMorph `download_specs` rows B.3.2/B.3.6); record source row in a comment.
2. Test first: key parity vi/en (deep keys equal), vi values equal `KUDOS_COPY` counterparts, required exact strings (empty copy, "Tất cả", "Tìm kiếm", "Chưa có dữ liệu", toast), unknown locale → vi via `resolveLocale` path.
3. Write vi (verbatim), en (drafts marked `// PM-review`).
4. `npx vitest run src/lib/i18n` + tsc.

## Todo List
- [ ] fetch tooltip copy
- [ ] parity + exact-copy tests
- [ ] vi / en dictionaries
- [ ] green

## Success Criteria
SC-014 unit-proven; every string 05/06 render comes from this dictionary.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Copy drift vs frame | M | L | test pins vi to kudos-copy values |
| Missing key discovered in 05/06 | M | L | 05 and 06 run in parallel → neither edits the dictionary; report the gap, lead patches 04's files serially |

## Security Considerations
None (static strings).

## Next Steps
05, 06 consume; 08 records PM-review list.
