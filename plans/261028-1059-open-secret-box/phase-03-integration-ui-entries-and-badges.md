# Phase 03 — Integration UI: both entries, modal wiring, badge unlock, assets

## Context Links
- Spec: FR-001..FR-010, FR-017, FR-018, SM-001, DEC-001; `screens.md`
- Decisions: both entries one modal; router.refresh on close; error keeps last phase + inline message; empty ⇒ out-of-box state; fallback art (gold circle + name) for 4 badges; self face only
- Track A (done): `src/components/secret-box/secret-box-modal.tsx`, `secret-box-copy.ts`, `secret-box-modal.test.tsx`
- Entries: `src/components/kudos/kudos-stats-box.tsx` (signed-in: `KudosGatedDialogButton` placeholder), `src/components/profile/profile-stats.tsx` (hard-disabled button)
- Loader: `src/app/(site)/profile/profile-page-loaders.ts` (`common.badges = []`)

## Overview
Priority P1 · Status complete · Outcome: `SecretBoxOpener` wired into `kudos-stats-box` + `profile-stats`, self-face badge unlock, dictionaries, modal error slot/img fallback, badge-collection `unoptimized` SVG patch — all landed.

## Key Insights
- Modal has no error slot and no image `onError` → two small additive props/handlers needed (FR-009, FR-010).
- `KudosMessages` already reaches both entries → add `secretBox: SecretBoxCopy` there (vi value = `SECRET_BOX_COPY_VI`, imported; en draft = new `SECRET_BOX_COPY_EN` in the copy module). No new prop plumbing.
- Clarification overrides draft edge case: on `empty`, set count 0 (backend truth, FR-008), disable box, show "out of boxes" message.
- `ProfileBadgeCollection` uses `next/image`; SVG fallback art needs `unoptimized` (optimizer refuses SVG without `dangerouslyAllowSVG`).

## Requirements
- New client `SecretBoxOpener` (shared by both entries, DRY): props `{ unopenedCount, copy, className, children }`. Button disabled when `unopenedCount <= 0`. State: `open, phase, badgeKey, count, busy, error, changed`. Open → reset to idle with `count = unopenedCount`. Box click (guard `busy || count<=0`) → `useTransition(openSecretBoxAction)`; `ok` ⇒ phase opened, `badgeFor(key)`, `count = remaining`, `changed = true`; `empty` ⇒ `count = 0`, `error = copy.errorEmpty`; `unauthenticated` ⇒ `copy.errorSession`; `error` ⇒ `copy.errorGeneric` (phase/count kept). Close ⇒ unmount modal; `router.refresh()` if `changed`.
- Modal (additive): `error?: string` rendered `<p role="alert">` above the footer; badge `<img onError>` swaps to catalog fallback once.
- Copy: extend `SecretBoxCopy` with `errorGeneric`, `errorEmpty`, `errorSession` (vi + en drafts, `// PM-review`).
- `KudosStatsBox`: guest ⇒ existing login `Link`; signed-in ⇒ `SecretBoxOpener` with `stats?.secretBoxUnopened ?? 0`.
- `ProfileStats`: replace disabled button with `SecretBoxOpener`.
- Loader self branch: add `getOwnBadgeKeys(viewer)` to the existing `Promise.all`; `badges = toBadgeSlots(keys)`. Other branch keeps `badges: []` and never calls it.
- `BadgeCircle`: pass `unoptimized` when `imageSrc` ends with `.svg`.
- Assets in `public/images/secret-box/badges/`: `touch_of_light.png` (crop from MoMorph frame IXpGakYRm5), `root_further.png` (crop from scvV-OQCAJ), `stay_gold.svg`, `flow_to_horizon.svg`, `beyond_the_boundary.svg`, `revival.svg` (gold circle `#FFEA9E` + name), `badge-fallback.svg`.

## Architecture
```
KudosStatsBox / ProfileStats (server) -> SecretBoxOpener (client) -> SecretBoxModal (presentational)
                                              |-> openSecretBoxAction (phase 02) -> badgeFor
profile-page-loaders (self) -> getOwnBadgeKeys -> toBadgeSlots -> ProfileBadgeCollection
```

## Related Code Files
- Create: `src/components/secret-box/secret-box-opener.tsx`, `secret-box-opener.test.tsx`, badge assets (7 files)
- Modify: `secret-box-modal.tsx`, `secret-box-modal.test.tsx`, `secret-box-copy.ts`, `src/lib/i18n/kudos-dictionary.ts`, `kudos-dictionary-vi.ts`, `kudos-dictionary-en.ts`, `kudos-stats-box.tsx`, `kudos-sidebar.test.tsx` (placeholder assertion → opener), `profile-stats.tsx`, `profile-page-content.test.tsx` (disabled → enabled when >0, disabled at 0), `profile-badge-collection.tsx`, `profile-page-loaders.ts`, `profile-page-loaders.test.ts` (self calls badge query, other never does)
- Delete: none (`placeholder.secretBoxTitle` stays if still referenced; remove only if unused after grep)

## Implementation Steps
1. Fetch badge art via MoMorph MCP (`get_frame` IXpGakYRm5 / scvV-OQCAJ, fileKey 9ypp4enmFmdK3YAFJLIu6C), crop to square PNG; author 5 SVGs.
2. Copy + dictionary keys (vi exact from frame, en draft); dictionary parity test stays green.
3. Modal additive props + tests (error alert, img fallback).
4. Opener + tests (mock action: ok→count from result, double click one call, empty, error keeps phase, close refreshes only when changed).
5. Swap both entries; update affected unit tests.
6. Loader + badge collection; tests.
7. `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`; manual smoke in `npm run dev`.

## Todo List
- [x] badge assets (2 crops + 4 fallback + generic fallback)
- [x] copy/dictionary (`secretBox` key, vi + en, PM-review)
- [x] modal error + img fallback
- [x] SecretBoxOpener + tests
- [x] KudosStatsBox / ProfileStats wired
- [x] loader self badges; other face untouched
- [x] build + unit green

## Success Criteria
- Both buttons open the same modal; count never decremented client-side; other-face props/payload unchanged (`badges: []`); all unit tests + build green.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Track A file edits break its 7 tests | M | L | additive props only; rerun modal tests |
| `router.refresh` race with in-flight call on close | L | L | edge case accepted: page reflects backend on next render |
| `cacheComponents` Suspense rules on loader change | L | M | badge query joins existing `Promise.all` inside the same Suspense boundary |
| MoMorph crops unavailable | M | L | fall back to SVG art for those 2 keys too; swap files later |

## Security Considerations
Client holds no odds; only displays the server result. Other face never queries badges (F008 boundary).

## Next Steps
Phase 04 e2e + isolation.
