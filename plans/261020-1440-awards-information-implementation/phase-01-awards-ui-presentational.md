---
phase: 01
title: Awards UI (presentational, Track A)
feature: F004
status: completed
depends: []
---

# Phase 01 — Awards UI (Track A, DONE)

MoMorph: Hệ thống giải https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
(fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `zFYDgyj_pD`) · Clarifications: [clarifications.md](clarifications.md)

**Goal:** static `/awards` matching Figma, frame copy as mock data. Built via `momorph-implement-design`.

**Delivered:** `src/app/(site)/awards/page.tsx`; `src/components/awards/{awards-data.ts, award-icon.tsx,
awards-hero.tsx, category-nav.tsx, award-detail-card.tsx, award-detail-list.tsx}`; `public/images/awards/*` (3 icon SVGs).
Nav active = click/hash (`useSyncExternalStore`), ids = 6 canonical slugs, Kudos = home `KudosPromo` + home dictionary.
tsc / eslint / 164 unit / build green.

**Integration contract (consumed by 02/03):** `AwardsHero`, `AwardDetailCard`, `CategoryNav` accept copy props with VN defaults;
`CategoryNavProps { items, ariaLabel }`.

**Out of scope:** dictionary/locale, scroll-spy, focus management, localized title, e2e (phases 02–04).
