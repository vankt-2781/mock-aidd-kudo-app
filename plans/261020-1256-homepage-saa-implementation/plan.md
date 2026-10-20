---
title: "Homepage SAA (/) — logic, i18n, auth-aware header, routes"
description: "Wire the built Homepage SAA UI: live countdown, VN/EN home dictionary, auth/admin-aware header, placeholder routes, widget menu, e2e."
status: completed
priority: P1
effort: 13.5h
branch: feature/homepage
tags: [homepage, countdown, i18n, supabase, rbac, nextjs, momorph]
created: 2026-10-20
work_type: feature
spec: docs/features/F003_HomepageSaa/
system_doc_drafts:
  - plans/261020-1256-homepage-saa-implementation/spec/system/permissions.md
---

# Homepage SAA — Plan

MoMorph: Homepage SAA https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/i87tDx10uM
Clarifications (authoritative, 16 decisions): [clarifications.md](clarifications.md) ·
Digest (46 specs / 62 TCs): [research/momorph-homepage-specs-notes.md](research/momorph-homepage-specs-notes.md) ·
Spec draft: [spec/homepage-saa/technical-spec.md](spec/homepage-saa/technical-spec.md)

| Phase | File | Track | Depends | Effort | Status |
|-------|------|-------|---------|--------|--------|
| 01 | [phase-01-homepage-ui-presentational.md](phase-01-homepage-ui-presentational.md) | A (UI) | — | done | completed |
| 02 | [phase-02-countdown-logic.md](phase-02-countdown-logic.md) | B | — | 1.5h | completed |
| 03 | [phase-03-home-dictionary-and-site-content.md](phase-03-home-dictionary-and-site-content.md) | B | — | 1.5h | completed |
| 04 | [phase-04-viewer-and-admin-role.md](phase-04-viewer-and-admin-role.md) | B | — | 1h | completed |
| 05 | [phase-05-homepage-shell-integration.md](phase-05-homepage-shell-integration.md) | Integration | 01,02,03,04 | 4h | completed |
| 06 | [phase-06-placeholder-routes-and-admin-guard.md](phase-06-placeholder-routes-and-admin-guard.md) | Integration | 01,03,04 | 1.5h | completed |
| 07 | [phase-07-playwright-e2e.md](phase-07-playwright-e2e.md) | Tests | 05,06 | 3h | completed |
| 08 | [phase-08-verification-and-docs.md](phase-08-verification-and-docs.md) | Gate | 07 | 1h | completed |

Parallel: 02 ‖ 03 ‖ 04 (Track B, disjoint files, pure logic, unit-TDD). Then 05 ‖ 06 (disjoint files).

## Data flow
Request `/` → proxy (session refresh, `/` public) → `(site)/layout` [Suspense] reads
`getRequestLocale()` + `getCurrentViewer()` (Supabase getUser → `{signedIn,isAdmin}`, error → visitor)
→ `getHomeMessages(locale)` → header container (client: usePathname → selected nav, setLocaleAction +
router.refresh, `<html lang>` sync) + footer + widget menu. Page [Suspense] → `connection()` →
`initialNow` + `NEXT_PUBLIC_EVENT_START_AT` → `LiveHeroCountdown` (pure `computeCountdown`, ticks on
minute boundary, stops at start).

## Key decisions (beyond clarifications)
- Route group `src/app/(site)/` shares header/footer/widget across `/`, `/awards`, `/kudos`, `/profile`, `/admin`.
- `/admin` guarded server-side (non-admin incl. visitor → `/`); `/profile` visitor → `/login` (assumption).
- Sign out = existing `signOutAction` (redirects `/login`); post-login still `/todo` (unchanged).
- "Coming soon" uses spec/TC spelling (Figma shows "Comming soon") — flagged to designer with footer "về".
- One shared `useDismissableMenu` hook for bell/account/widget menus (FR-004); login `LanguageSelector` reused as-is.

## Deps to preinstall (orchestrator)
None — vitest, jsdom, Testing Library, Playwright already present. Phases must not edit package.json.

## Rollback
Each phase is additive except 05 (moves `src/app/page.tsx` → `src/app/(site)/page.tsx`); revert = git
revert of that phase's commit. No DB, no migrations; env var additive.

## Out of scope
Notification backend/badge data, real Awards/Kudos/Profile/Admin content, widget menu final items,
EN copy review, post-login redirect change, CI.

## Unresolved
1. Footer 4th link "Tiêu chuẩn chung" (Figma only, no target in spec) — plan renders it as plain text (no `#` link) until a route exists.
2. Env value 2025-12-26 is already past (today 2026-10-20) → production shows 00 00 00, no "Coming soon". Confirm intended.
