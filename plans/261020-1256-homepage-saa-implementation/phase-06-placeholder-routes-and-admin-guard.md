---
phase: 06
title: Placeholder routes (/awards, /kudos, /profile, /admin) + admin guard
feature: F003
status: completed
depends: [01, 03, 04]
---

# Phase 06 — Placeholder Routes and Admin Guard

## Context Links
- Spec: FR-020, FR-024, BR-001, BR-004; TCs ID-21, 22, 44, 45, 47..50, 52, 53, 55, 62
- Clarifications: placeholders share homepage header/footer (via phase 05 `(site)/layout`); `/admin` server guard (non-admin → `/`)
- Reuse: Phase 03 `getHomeMessages`, `AWARD_CATEGORIES`, `site-routes`; Phase 04 `getCurrentViewer`/`isAdminUser`; pattern `src/app/todo/page.tsx` (Suspense + connection + redirect)

## Overview
Priority P1 · Integration · parallel with 05 (pages do not import the layout; layout from 05 wraps them automatically).

## Key Insights
- Next `<Link href="/awards#slug">` scrolls to `id` on arrival; sticky header needs `scroll-mt-24` on each anchor.
- `redirect()` inside Suspense works (todo precedent); guard runs per request after `connection()`.
- `/profile` for a visitor → `/login` (assumption: deny by default; link is only shown to signed-in users).

## Requirements
- `PlaceholderPage` component: localized title + "under construction" text, dark theme matching homepage.
- `/awards`: placeholder + one `<h2 id={slug} className="scroll-mt-24">` per `AWARD_CATEGORIES` entry, enough height per section that hash scroll is observable.
- `/kudos`: placeholder.
- `/profile`: signed-in only (visitor → `LOGIN_PATH`).
- `/admin`: `isAdmin` only; visitor or regular user → `redirect("/")`.
- Each page: own `<Suspense>` around locale/viewer reads; `metadata` titles.

## Architecture
`request → (site)/layout chrome → page Suspense → getRequestLocale + (profile/admin) getCurrentViewer → render | redirect`.

## Related Code Files
Create: `src/app/(site)/awards/page.tsx`, `src/app/(site)/kudos/page.tsx`, `src/app/(site)/profile/page.tsx`, `src/app/(site)/admin/page.tsx`, `src/components/home/placeholder-page.tsx`, `src/components/home/placeholder-page.test.tsx`, `src/lib/auth/decide-admin-access.ts` (+ `.test.ts`: `(viewer) → "allow" | "/"`, and profile `(viewer) → "allow" | "/login"`).
Do NOT touch: `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx`, phase 05 component files, `src/proxy.ts`, package.json. Dictionary keys for placeholders already exist (phase 03).

## Implementation Steps
1. TDD `decide-admin-access` (visitor, regular, admin) for admin + profile.
2. TDD `PlaceholderPage` render (title, message, optional children).
3. Create four pages; awards anchors from `AWARD_CATEGORIES`.
4. tsc, eslint, vitest, `npm run build`.

## Todo
- [x] decide-admin-access (TDD)
- [x] placeholder-page (TDD)
- [x] /awards with 6 anchors, /kudos
- [x] /profile, /admin with server guards
- [x] gates green

## Success Criteria
All 4 routes return 200 for allowed viewers; `/admin` as regular/visitor ends at `/`; `/profile` as visitor ends at `/login`; 6 anchor ids present on `/awards`.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Guard bypass via client nav | L | H | Guard is server-side in page; proxy unchanged but page re-checks each request |
| Anchor hidden under sticky header | M | L | `scroll-mt-24` |

## Security Considerations
`/admin` decision only from server `getUser()` + `app_metadata`; failures → deny (redirect `/`).

## Next Steps
Phase 07 covers navigation, hash scroll, guards.
