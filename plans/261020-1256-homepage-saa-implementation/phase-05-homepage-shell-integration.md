---
phase: 05
title: Homepage shell integration (layout, header, menus, wiring)
feature: F003
status: completed
depends: [01, 02, 03, 04]
---

# Phase 05 — Homepage Shell Integration

## Context Links
- Spec: FR-001..005, FR-007..019, FR-021..023, FR-025, SM-002, DEC-001; TCs ID-0..4, 18..38, 44..55, 58, 59
- Inputs: Phase 01 components, Phase 02 `LiveHeroCountdown`, Phase 03 `getHomeMessages`/`site-routes`/`AWARD_CATEGORIES`/`awardHref`, Phase 04 `getCurrentViewer`/`buildAccountMenu`
- Reuse: `setLocaleAction`, `getRequestLocale`, `signOutAction` (`src/app/todo/sign-out-action.ts`), `LanguageSelector`; `<html lang>` sync pattern in `src/app/login/login-page-client.tsx`

## Overview
Priority P1 · Integration · parallel with 06 (disjoint files). Replace mocks with dictionary/viewer data, real hrefs, and menu behavior.

## Key Insights
- `cacheComponents`: every `cookies()`/`getUser()`/`connection()` read sits inside `<Suspense>` (as in login/todo). Header and page content are separate Suspense boundaries; header fallback = empty `h-20` bar (no layout shift).
- Locale switch: client calls `setLocaleAction(l)` then `router.refresh()` (server re-renders all strings); effect sets `document.documentElement.lang`.
- Selected nav from `usePathname()` in the header container: `/`→0, `/awards`→1, `/kudos`→2, else none.
- Same-path link click (logo, selected nav) → `preventDefault` + `window.scrollTo({ top: 0 })` (TC ID-2..4, 18..20).
- Sticky header (h-20) would cover hash targets → phase 06 adds `scroll-mt-24` on anchors.

## Requirements
- Move `src/app/page.tsx` → `src/app/(site)/page.tsx`; create `src/app/(site)/layout.tsx` (fonts/bg wrapper from old page, metadata title "Sun* Annual Awards 2025", Suspense header, children, Suspense footer, widget menu).
- Header: signed-out → Login link to `/login` instead of bell + account (no badge); signed-in → bell (no badge) opening panel "Chưa có thông báo" + account menu from `buildAccountMenu` (Profile `/profile`, Sign out = `<form action={signOutAction}>` button `role=menuitem`, Admin Dashboard `/admin`).
- `useDismissableMenu()` hook shared by bell panel, account menu, widget menu: toggle on trigger, outside `mousedown` closes, Esc closes + focus returns to trigger, item select closes (FR-004).
- Widget menu: wraps `WidgetButton`; items "Gửi Kudos" → `/kudos` (everyone), "Về đầu trang" → scroll top.
- Wire hrefs: nav/footer About→`/`, Awards→`/awards`, Kudos→`/kudos`; CTAs; cards `awardHref(slug)`; Kudos "Chi tiết" → `/kudos`; logos → `/`. Footer "Tiêu chuẩn chung" → plain text (no `#`, see plan Unresolved 1). Zero `href="#"` remains (ID-59).
- Hero: `LiveHeroCountdown` with `startAt={process.env.NEXT_PUBLIC_EVENT_START_AT}`, `initialNow` from page (after `connection()`).
- All Phase 01 components take strings via props from `HomeMessages` (add props where hardcoded, e.g. root-further paragraphs, awards sub-text, card detail label). Keep defaults removed or vi only for tests.

## Architecture
```
(site)/layout ─Suspense─ HomeHeaderSection(async: locale, viewer, messages) → HomeHeaderContainer(client)
                                                 → HomeHeader{ HomeNotificationBell | HomeAccountMenu | Login link }
              ─ children: (site)/page ─Suspense─ HomePageContent(async: locale, connection, now) → sections
              ─Suspense─ HomeFooterSection(async: locale) → HomeFooter
              ─ WidgetMenu(client; labels via Suspense section)
```

## Related Code Files
Create: `src/app/(site)/layout.tsx`, `src/app/(site)/page.tsx`, `src/components/home/home-header-container.tsx`, `home-account-menu.tsx`, `home-notification-bell.tsx`, `widget-menu.tsx`, `home-scroll-link.tsx`, `use-dismissable-menu.ts`, tests `*.test.tsx` for header container, account menu, bell, widget menu, dismissable hook, scroll link.
Modify: `src/components/home/{home-header, home-nav-link, home-footer, hero-section, awards-grid, award-card, kudos-promo, root-further-content, hero-event-info}.tsx`.
Delete: `src/app/page.tsx`.
Do NOT touch: `src/app/(site)/{awards,kudos,profile,admin}/**` (phase 06), `src/lib/**` except adding dictionary keys to both home-dictionary-vi/en (parity test must stay green), `e2e/**`, login files, package.json.

## Implementation Steps
1. TDD `useDismissableMenu` + `HomeScrollLink` (jsdom).
2. TDD `HomeAccountMenu` (2 vs 3 items, sign-out form, Esc focus return), `HomeNotificationBell` (empty panel, no badge), `WidgetMenu` (open/close/Esc/outside, 2 items, scroll top) — mock `signOutAction`, `next/navigation`.
3. Refactor `HomeHeader` to compose bell/account/login slots (keep <200 lines); `HomeHeaderContainer` handles locale + pathname.
4. Prop-ify remaining hardcoded copy; switch awards-grid to `AWARD_CATEGORIES` + dictionary descriptions.
5. Create `(site)` layout/page, delete old page; `npx tsc --noEmit`, `npx eslint`, `npx vitest run`, `npm run build`.
6. Manual smoke `npm run dev`: `/` vi/en, signed-out Login link.

## Todo
- [x] hook + scroll link (TDD)
- [x] account menu, bell, widget menu (TDD)
- [x] header refactor + container
- [x] prop-ify copy, real hrefs, no `#`
- [x] (site) layout/page; old page removed
- [x] tsc, eslint, vitest, build green

## Success Criteria
`/` renders all sections from dictionary in vi/en; header reflects viewer; 4 menus follow SM-002; `grep -rn 'href="#"\|href = "#"' src/components/home src/app` empty; build green.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Uncached data outside Suspense → build error | H | M | Mirror login/todo Suspense pattern; run `npm run build` |
| Header >200 lines | M | L | Split into bell/account/container files |
| Route-group move breaks `/` | L | H | e2e smoke in 07; revert = restore file |
| Sign-out redirect lands on `/login` not `/` | — | L | Accepted (reuse action per clarification) |

## Security Considerations
Admin item visibility only from server-computed `isAdmin`; no role logic on client. Sign-out via server action (POST, CSRF-protected by Next).

## Next Steps
Phase 07 e2e over this shell.
