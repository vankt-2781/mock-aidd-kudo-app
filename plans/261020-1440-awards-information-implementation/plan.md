---
title: "Awards Information (/awards) — i18n, scroll-spy, e2e"
description: "Localize the built Awards page (VN/EN dictionary + tab title), add upper-third scroll-spy with focus management, map 15 TCs to e2e, verify."
status: completed
priority: P2
effort: 7h
branch: feature/awards-information
tags: [awards, i18n, scroll-spy, a11y, e2e, nextjs, momorph]
created: 2026-10-20
work_type: feature
spec: docs/features/F004_AwardsInformation/
---

# Awards Information — Plan

MoMorph: Hệ thống giải https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/zFYDgyj_pD
Clarifications (authoritative, 10 decisions): [clarifications.md](clarifications.md) ·
Digest (23 specs / 15 TCs): [research/momorph-awards-screen-digest.md](research/momorph-awards-screen-digest.md) ·
Spec draft: [spec/awards-information/technical-spec.md](spec/awards-information/technical-spec.md)

| Phase | File | Track | Depends | Effort | Status |
|-------|------|-------|---------|--------|--------|
| 01 | [phase-01-awards-ui-presentational.md](phase-01-awards-ui-presentational.md) | A (UI) | — | done | completed |
| 02 | [phase-02-awards-dictionary-and-wiring.md](phase-02-awards-dictionary-and-wiring.md) | B | — | 2h | completed |
| 03 | [phase-03-scroll-spy-and-focus.md](phase-03-scroll-spy-and-focus.md) | B | — | 2h | completed |
| 04 | [phase-04-awards-e2e.md](phase-04-awards-e2e.md) | Tests | 02,03 | 2h | completed |
| 05 | [phase-05-verification-and-docs.md](phase-05-verification-and-docs.md) | Gate | 04 | 1h | completed |

Parallel: 02 ‖ 03 (disjoint files; contract below). Then 04 → 05.

## Data flow
Request `/awards` (public, proxy untouched) → `(site)/layout` (header pathname-selected, footer) →
page [Suspense] `getRequestLocale()` → `getAwardsMessages(locale)` + `getHomeMessages(locale)` (Kudos) →
props to `AwardsHero` / `AwardDetailList` → `CategoryNav` (client: items + ariaLabel) + `AwardDetailCard`.
`generateMetadata` → localized tab title. Client: `CategoryNav` active = click/hash, then scroll-spy
(IntersectionObserver, upper-third band) → pure `selectActiveSection`; hash only written on click.

## 02 ↔ 03 contract (fixed before parallel start)
- `CategoryNavProps { items: {slug,label}[]; ariaLabel?: string }` unchanged — 02 passes localized values, 03 never edits it.
- Card heading = `<h2 tabIndex={-1}>` inside `<section id={slug}>` (02 adds `tabIndex`); 03 focuses `section.querySelector("h2")` with `preventScroll`.
- Section ids stay the 6 canonical slugs (BR-002); `scroll-mt-28` stays.

## File ownership
- 02: `src/lib/i18n/awards-dictionary*.ts`, `src/app/(site)/awards/page.tsx`, `src/components/awards/{awards-data.ts,awards-hero.tsx,award-detail-list.tsx,award-detail-card.tsx}`
- 03: `src/components/awards/{category-nav.tsx,category-nav.test.tsx,select-active-section.ts,select-active-section.test.ts,use-active-category.ts}`
- 04: `e2e/awards-information.spec.ts`, `e2e/README.md` · 05: `reports/`, `evidence/`, `docs/project-changelog.md`, `docs/development-roadmap.md`, this plan

## Deps / rollback
No installs; no phase edits package.json. No DB/env changes. Each phase = one commit, revert independently
(02 revert restores hard-coded VN copy; 03 revert restores click/hash-only nav).

## Out of scope
Auth gate on /awards (TC ID-1 deviation, public per clarification), /he-thong-giai alias, Kudos page content,
EN copy review (PM), spec promotion to `docs/features/` (docs flow after merge).

## Unresolved
1. EN copy is a dev draft — PM review pending (same as F003).
2. `home` dictionary `placeholder.awardsTitle` may become unused after 02 — 02 checks usages; remove only if dead.
