# Phase 05 — Board page integration (real data, filters, like, copy link, infinite scroll, gating, stubs)

## Context Links
- Spec: FR-001..019, 024..026, 028..031; DEC-001/002/003; SM-001/002; SC-001/002/003/006/007/008/010/011/012
- Depends: 02 (queries/actions/types/filter helpers), 03 (`KUDOS_LOGIN_HREF`), 04 (`getKudosMessages`)
- Existing: `src/app/(site)/kudos/page.tsx`, `src/components/kudos/**` (Track A), `src/app/countdown/page.tsx` (`generateMetadata` + `connection()` pattern), `src/app/(site)/profile/page.tsx` (profile placeholder, signed-in only)

## Overview
Priority P1 · Status pending · Effort 4.5h · Parallel with 06 (disjoint files). Replace mock data + `KUDOS_COPY` in every non-spotlight component.

## Key Insights
- cacheComponents: page body inside `<Suspense>`; `await connection()` before Supabase/cookies; `searchParams` awaited inside the boundary.
- Same kudos can show in highlight AND feed → `KudosLikeProvider` (client context keyed by kudosId: `{liked, likeCount, pending}`) so both hearts update together; feed pages appended client-side stay consistent.
- Pending disables the heart (SM-001 Pending) → serialized per kudos; desired-state RPC makes the final state equal the last click.
- Gating is computed server-side into hrefs (signedIn ? target : `KUDOS_LOGIN_HREF`) → links need no client JS; only buttons opening placeholder dialogs are client.
- Carousel reset (FR-006): `key={filtersKey}` remount; arrows clamp (no wrap) + `disabled` at ends; `initialIndex` default 0.
- Copy: messages prop-drilled (awards pattern); client components get only the sub-objects they need.

## Requirements
- `page.tsx`: `generateMetadata` (locale title); `KudosBoard` async inside Suspense → `connection()`, locale, viewer, `parseKudosFilters(await searchParams, options)`; `Promise.all` of 02 board queries (NOT spotlight: 06's async section fetches its own data inside a nested `<Suspense>` = SM-003 Loading, so the board never waits on it).
- Filters: `kudos-filter-dropdown.tsx` (client) — trigger replaces `KudosFilterButton`; listbox of `<Link scroll={false}>` options from DB, "Tất cả" first (clears that param, keeps the other), active option `aria-selected` + active style; Escape/outside click closes.
- Cards: drop `title` row + field (types handoff from 02); hashtags as Links via `buildKudosFilterHref(filters, {hashtag})` (highlight max 5 + "..."); stars + tooltip in `KudosUserInfo`; avatar/name → `/profile` (signed-in) or login href; "Xem chi tiết" → `/kudos/<id>` or login href; feed thumbnails `<a href={src} target="_blank" rel="noopener">` (full size, visitors allowed); image fallback via `onError` not needed for local assets (YAGNI).
- `kudos-like-button.tsx` (client): visitor → `<Link href={KUDOS_LOGIN_HREF}>`; sender → disabled, `aria-disabled`; else optimistic flip via provider → `toggleKudosLike` → `ok` settle | `unauthenticated` revert + `router.push(KUDOS_LOGIN_HREF)` | `forbidden`/`error` revert + inline error (`role="status"`). Gray/red heart per state.
- `kudos-copy-link-button.tsx` (client): `navigator.clipboard.writeText(new URL(`/kudos/${id}`, location.origin).href)` → toast `role="status"` 2.5 s; failure → `copyFailed`.
- `kudos-feed-list.tsx` (client): initial posts + `nextCursor`; IntersectionObserver sentinel → `loadMoreKudos(filters, cursor)`; append; stop on `nextCursor === null`; error → stop, re-arm on next intersection; keyed by filters. Empty → `emptyKudos`.
- Highlight empty → `emptyKudos`, no arrows/pager.
- Sidebar: stats box only when `stats` non-null; "Mở Secret Box" button always (visitor → login link; signed-in → placeholder dialog); gift list rows → `/profile` or login; empty → `giftList.empty`.
- Action bar: compose pill → placeholder dialog / login; "Tìm kiếm profile Sunner" pill → `/profile` or login (profile navigation, DEC-002).
- `kudos-placeholder-dialog.tsx` (client, native `<dialog>`; shared by send + secret box; DRY).
- `src/app/(site)/kudos/[id]/page.tsx`: public placeholder (title, under-construction, back link) — Copy Link targets must not dead-end; on-board clicks are what's gated (FR-019).
- Delete `kudos-mock-data.ts`; no `KUDOS_COPY` import left in 05-owned files.

## Architecture
```
page.tsx ─ Suspense ─ KudosBoard (server)
  └ KudosLikeProvider (client, seeds from highlight+feed posts)
      ├ Banner / ActionBar(gated pills + dialog)
      ├ HighlightSection(filters dropdowns, Carousel key=filtersKey → cards → LikeButton, CopyLinkButton)
      ├ <Suspense fallback=SpotlightLoading> KudosSpotlightSection (06) </Suspense>
      └ AllSection(FeedList client → PostCard; Sidebar: StatsBox?|OpenBoxButton, SunnerList)
```

## Related Code Files (ownership)
- Modify: `src/app/(site)/kudos/page.tsx`; `src/components/kudos/` → `kudos-page-content.tsx`, `kudos-banner.tsx`, `kudos-action-bar.tsx`, `kudos-highlight-section.tsx`, `kudos-highlight-carousel.tsx`, `kudos-highlight-card.tsx`, `kudos-post-card.tsx`, `kudos-card-parts.tsx`, `kudos-user-info.tsx`, `kudos-hero-badge.tsx`, `kudos-section-header.tsx`, `kudos-all-section.tsx`, `kudos-stats-box.tsx`, `kudos-sunner-list.tsx`, `kudos-icons.tsx` (if a gray/red heart variant is needed), `kudos-types.ts` (remove `title` only)
- Create: `src/app/(site)/kudos/[id]/page.tsx`, `src/components/kudos/kudos-filter-dropdown.tsx`, `kudos-like-provider.tsx`, `kudos-like-button.tsx`, `kudos-copy-link-button.tsx`, `kudos-feed-list.tsx`, `kudos-placeholder-dialog.tsx`, `kudos-gated-dialog-button.tsx`, `kudos-star-rating.tsx`, colocated `*.test.tsx`
- Delete: `src/components/kudos/kudos-mock-data.ts`, `kudos-filter-button.tsx` (replaced)
- NOT owned (06): `kudos-spotlight-section.tsx`, `kudos-spotlight-panel.tsx`, `spotlight-words.ts`, `src/lib/kudos-spotlight/**`. Contract: 05 renders `<Suspense fallback={<KudosSpotlightLoading messages={m.spotlight} />}><KudosSpotlightSection messages={m.spotlight} sectionTitle={m.section.spotlightTitle} signedIn={viewer.signedIn} /></Suspense>` — both exported by 06's `kudos-spotlight-section.tsx` (async server component calling `getSpotlightData()`). Until 06 lands, 05 may keep the current Track A call compiling (06 owns the final signature).

## Implementation Steps
1. jsdom tests first: like button (visitor link, sender disabled, optimistic +1, revert on error, unauthenticated → push login, pending disables, provider syncs two buttons); copy link (success toast text, failure); carousel (1/m, prev disabled at 1, next disabled at m, m=1 both disabled, empty state); filter dropdown (options hrefs, "Tất cả" clears only its param, active state); feed list (mock IntersectionObserver: appends, stops at null cursor, error re-arm); sidebar (stats hidden for visitor, gift empty copy).
2. Implement client components; rewire server components to messages + real props; remove `title`.
3. Page + metadata + `[id]` stub; delete mock data + filter button.
4. Manual run on seeded DB (`npm run dev`): visitor + signed-in; Lighthouse-free sanity of layout vs Track A (no visual regressions besides title row).
5. `npx tsc --noEmit && npx eslint && npx vitest run src/components/kudos`.

## Todo List
- [ ] component tests (TDD)
- [ ] like provider/button, copy link, feed list, filter dropdown, dialogs
- [ ] server components on messages + real data; title removed
- [ ] page + metadata + `/kudos/[id]` stub
- [ ] mock data + filter button deleted
- [ ] gates green

## Success Criteria
Seeded board renders for visitor and signed-in user; every gated control routes to `KUDOS_LOGIN_HREF` for visitors; like round-trip updates both card instances; filters drive highlight + feed with carousel at 1.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Client/server boundary errors (functions passed to client) | M | M | only serializable props; hrefs precomputed or built with pure client-safe helper |
| Carousel client renders server cards with client children | L | M | cards are plain components (no server-only imports) |
| Track A visual regression | M | M | keep classes; 07 e2e layout checks; title-row removal flagged to PM |
| Files > 200 lines (page/feed) | M | L | split section loaders |

## Security Considerations
No viewer ids passed to the client beyond `viewerIsSender` booleans; action identity server-side; Copy Link built from `location.origin` (no user input). **User sign-off** covers the like flow (with 02).

## Next Steps
07 e2e; 08 deletes `kudos-copy.ts` once 06 also stops importing it.
