---
phase: 03
title: Home dictionary (vi/en) + site routes + award categories
feature: F003
status: completed
depends: []
---

# Phase 03 — Home Dictionary and Site Content

## Context Links
- Spec: FR-003, FR-018..021, BR-004; TCs ID-24..26, 47..50, 52, 58, 62
- Pattern to mirror: `src/lib/i18n/login-dictionary.ts` (+ `.test.ts`), `src/lib/i18n/locale.ts`
- Vietnamese source copy = current defaults in `src/components/home/*.tsx` (Phase 01, read-only here)
- Clarifications: vi exact design copy, en dev draft; footer "Bản quyền thuộc về Sun* © 2025"; slugs top-talent / top-project / top-project-leader / best-manager / signature-2025-creator / mvp

## Overview
Priority P1 · Track B · parallel with 02, 04. Pure data + tiny helpers, no wiring.

## Key Insights
- Root Further paragraphs are long → split dictionary per locale to stay <200 lines/file.
- Countdown labels DAYS/HOURS/MINUTES and award titles are English in the design for both locales → keep identical in vi/en (no keys needed for award titles if kept in category list; descriptions ARE localized).
- "Coming soon": design shows "Comming soon", spec/TCs say "Coming soon" → use "Coming soon" (flag to designer, phase 08).

## Requirements
- `HomeMessages` type with groups: `nav` (about, awards, kudos), `header` (languageLabel, notificationsLabel, accountLabel, loginLabel, notificationsEmpty "Chưa có thông báo"), `accountMenu` (profile, signOut, adminDashboard), `hero` (comingSoon, timeLabel, time, placeLabel, place, note, ctaAwards, ctaKudos), `rootFurther` (paragraphs[], quote, quoteTranslation), `awards` (caption, heading, sub, detailLabel "Chi tiết", descriptions keyed by slug), `kudos` (label, title, kicker, description, detailLabel), `footer` (standardsLabel "Tiêu chuẩn chung", copyright), `widget` (label, sendKudos "Gửi Kudos", backToTop "Về đầu trang"), `placeholder` (awardsTitle, kudosTitle, profileTitle, adminTitle, underConstruction).
- `getHomeMessages(locale: Locale): HomeMessages`.
- `site-routes.ts`: `HOME_PATH "/"`, `AWARDS_PATH "/awards"`, `KUDOS_PATH "/kudos"`, `PROFILE_PATH "/profile"`, `ADMIN_PATH "/admin"`; re-export `LOGIN_PATH` from `decide-route-redirect`.
- `award-categories.ts`: ordered `AWARD_CATEGORIES: { slug; title; nameImageSrc; nameImageWidth; nameImageHeight }[]` (move image metadata from `DEFAULT_AWARDS` values; Phase 05 switches awards-grid to it); `awardHref(slug?: string)` → `/awards#slug` or `/awards` (BR-004).

## Related Code Files
Create: `src/lib/i18n/home-dictionary.ts` (type + getter), `src/lib/i18n/home-dictionary-vi.ts`, `src/lib/i18n/home-dictionary-en.ts`, `src/lib/i18n/home-dictionary.test.ts`, `src/lib/home/site-routes.ts`, `src/lib/home/award-categories.ts`, `src/lib/home/award-categories.test.ts`.
Do NOT touch: `src/components/**`, `login-dictionary.ts`, package.json.

## Implementation Steps
1. Tests first: vi/en deep key parity (recursive, arrays same length); no empty strings; exact vi design strings (event info Figma values, footer "về", "Chưa có thông báo", widget items, CTA labels); `awardHref` with/without slug; 6 slugs unique, kebab-case, in clarified order.
2. Copy vi strings verbatim from Phase 01 component defaults; write en draft (comment "dev draft pending PM review").
3. Implement routes + categories.

## Todo
- [x] dictionary tests (red) → vi/en files (green)
- [x] award-categories tests → impl
- [x] site-routes constants
- [x] vitest + tsc green

## Success Criteria
Parity + exact-copy tests green; every file <200 lines; no component imports.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| vi copy drift from design | M | M | Copy from Phase 01 defaults (Figma-extracted); exact-string tests on key lines |
| Dictionary shape misses a string Phase 05 needs | M | L | Phase 05 may add keys to both files + parity test catches gaps |

## Security Considerations
Static strings only; rendered as React text (no `dangerouslySetInnerHTML`).

## Next Steps
Phase 05/06 consume `getHomeMessages`, `site-routes`, `AWARD_CATEGORIES`, `awardHref`.
