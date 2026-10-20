---
phase: 01
title: Homepage UI (presentational, Track A)
feature: F003
status: completed
depends: []
---

# Phase 01 — Homepage UI (Track A, DONE)

MoMorph: Homepage SAA https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
(fileKey `9ypp4enmFmdK3YAFJLIu6C`, screenId `i87tDx10uM`) · Clarifications: [clarifications.md](clarifications.md)

**Goal:** static homepage at `/` matching Figma, design copy as mock props. Built via `momorph-implement-design`.

**Delivered:** `src/app/page.tsx`; `src/components/home/{home-fonts.ts, home-icons.tsx, home-nav-link.tsx,
home-action-button.tsx, home-header.tsx, hero-countdown.tsx, hero-event-info.tsx, hero-section.tsx,
root-further-content.tsx, award-card.tsx, awards-grid.tsx, kudos-promo.tsx, widget-button.tsx, home-footer.tsx}`;
`public/images/home/*` (21 assets). tsc + eslint clean.

**Integration contract (consumed by phase 05):** HomeHeaderProps, HeroCountdownProps, AwardsGridProps
(+ `DEFAULT_AWARDS`), AwardCardProps.href, HomeFooterProps, WidgetButtonProps (no `"use client"`; wrap in a
client component for `onClick`). All hrefs default `"#"`; all copy defaults are Vietnamese design mocks.

**Out of scope:** countdown ticking, i18n, auth state, menus behavior, real routes (phases 02–06).
