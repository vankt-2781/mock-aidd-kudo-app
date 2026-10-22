# Phase 02 — Kudos data access layer (typed queries, mappers, server actions)

## Context Links
- Spec: FR-004/006/010/012/013/014/015/017/020/024/026/029/031, BR-004/005/006/007, DEC-001/003, ALG-003, INT-001
- Depends: phase-01 (views + `set_kudos_like` contract in plan.md § Shared contracts)
- Existing: `src/lib/supabase/supabase-server-client.ts`, `src/lib/auth/get-current-viewer.ts` (pattern: degrade to visitor), `src/components/kudos/kudos-types.ts`, `kudos-mock-data.ts`

## Overview
Priority P1 · Status pending · Effort 3h · Blocks 05, 06. All DB access for the board in one module tree; components never touch Supabase.

## Key Insights
- Page needs only the viewer's auth id → `supabase.auth.getClaims()` (verified JWT, no Auth network hop; same as proxy). The RPC re-derives identity from `auth.uid()`, so the action never trusts client ids.
- Supabase errors must not crash the page (INT-001): each query returns a safe default + `console.error`.
- `liked_by_viewer` is NOT in the view (view is viewer-agnostic): fetch `kudos_likes.select(kudos_id).eq(user_id, me).in(kudos_id, pageIds)` per page.
- Filters use readable values (`hashtag` = name, `department` = code); unknown values are dropped (unfiltered) after matching against DB option lists.
- **Department filter = receiver's department** (default; see plan Open).

## Requirements
- `kudos-types.ts` (additive only; keep `title` until 05 removes it): `KudosUser` + `profileId: string`, `stars: 0|1|2|3`; `KudosPost` + `likedByViewer: boolean`, `viewerIsSender: boolean`, `createdAt: string` (ISO, cursor); new `KudosFilters {hashtag: string|null; department: string|null}`, `KudosFilterOptions {hashtags: string[]; departments: {code,name}[]}`, `KudosFeedPage {posts; nextCursor: string|null}`, `SpotlightNode {profileId, name, kudosCount, latestKudosId, latestReceivedAt}`, `SpotlightData {total, nodes, activity: SpotlightActivity[]}`. Update `kudos-mock-data.ts` so it compiles (05 deletes it).
- Pure helpers (unit-tested): `deriveStars(received)`, `deriveHeroTier(stars)` (0 new, 1 rising, 2 super, 3 legend), `formatKudosTime(iso)` → `HH:mm - MM/DD/YYYY` in Asia/Ho_Chi_Minh, `formatActivityTime(iso)` → `hh:mmAM/PM` (design "08:30PM"), `encodeCursor/decodeCursor` (`<iso>|<uuid>`, invalid → null), `parseKudosFilters`, `buildKudosFilterHref(filters, patch)` (`/kudos` + only non-null params), `mapFeedRow(row, likedIds, viewerProfileId) → KudosPost` (`detailHref = /kudos/<id>`, hashtags prefixed `#`, avatar fallback `/images/kudos/avatar-sunner.png`).
- Server reads (plain modules — `server-only` pkg is not installed and not added; imported only from server components/actions): `getKudosViewer() → {signedIn, profileId|null}`, `getFilterOptions()`, `getHighlightKudos(filters, viewer)` (order like_count desc, created_at desc, limit 5), `getFeedPage(filters, cursor, viewer)` (keyset, size 10, `or(created_at.lt.X,and(created_at.eq.X,id.lt.Y))`, end when < 10), `getSpotlightData()` (total via `count: "exact", head: true`; receivers; latest 6 for activity), `getGiftRecipients()` (10 newest → `SunnerRef`), `getViewerStats(viewer)` (null for visitor; stats view + secret_boxes counts under owner RLS).
- Server actions file (`"use server"`): `toggleKudosLike(kudosId, liked): Promise<LikeResult>` with `LikeResult = {status:"ok", liked, likeCount} | {status:"unauthenticated"} | {status:"forbidden"} | {status:"error"}`; validate uuid + boolean; `getUser()` first (no session → unauthenticated, no RPC); map RPC errors (`unauthenticated`, `no_profile`/`forbidden` → forbidden, else error). `loadMoreKudos(filters, cursor): Promise<KudosFeedPage>` re-validates filters + cursor server-side. No `revalidatePath` (plan Key decisions).

## Architecture
```
src/lib/kudos/
  kudos-derivations.ts        deriveStars, deriveHeroTier, formatKudosTime, formatActivityTime
  kudos-feed-cursor.ts        encode/decode
  kudos-filter-params.ts      parseKudosFilters, buildKudosFilterHref (client-safe, pure)
  kudos-row-mappers.ts        row types (hand-written, narrow) + mapFeedRow, mapGiftRow, mapSpotlightRows
  kudos-viewer.ts             getKudosViewer
  kudos-board-queries.ts      filter options, highlight, feed page, gift list, viewer stats
  kudos-spotlight-query.ts    getSpotlightData
  kudos-actions.ts            "use server": toggleKudosLike, loadMoreKudos
  *.test.ts                   colocated
```
Each file < 200 lines; queries file splits if it grows.

## Related Code Files (ownership)
- Create: everything under `src/lib/kudos/**`
- Modify: `src/components/kudos/kudos-types.ts` (additive), `src/components/kudos/kudos-mock-data.ts` (compile-compat only)

## Implementation Steps
1. Tests first: derivations (stars at 0/9/10/19/20/49/50/51; tier map; time format incl. UTC→+07 day rollover), cursor round-trip + garbage, filter parse (unknown dropped, arrays → first, "" → null) + href build (clear one keeps other, encodes `IDOL GIỚI TRẺ`), mapper (sender detection, liked flag, `#` prefix, avatar fallback).
2. Implement pure helpers.
3. Action tests (`vi.mock` server client): no user → unauthenticated w/o RPC; bad uuid → error; RPC `forbidden` → forbidden; ok → mapped. Implement actions.
4. Implement queries; manual check against seeded DB via a scratch script in the scratchpad (not committed) or 05's page.
5. `npx tsc --noEmit`, `npx vitest run src/lib/kudos`.

## Todo List
- [ ] types additive + mock compat
- [ ] derivations + cursor + filter params (TDD)
- [ ] mappers (TDD)
- [ ] viewer + queries + spotlight query
- [ ] actions (TDD)
- [ ] tsc + vitest green

## Success Criteria
- All helpers/actions unit-tested; queries return Track A shapes from seed (top-5 like counts 1000…920, persona stats 25s).
- No Supabase call outside `src/lib/kudos/**` for board data.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| PostgREST keyset `or()` with timestamps mis-encoded | M | M | ISO from DB verbatim; test page 2 + `Pioneer` end in 07 |
| getClaims unavailable/throws | L | M | catch → visitor (deny by default) |
| Action accepts forged kudosId | L | L | uuid validation; RPC `not_found` |

## Security Considerations
Identity from verified session only (BR-004); stats only for the viewer's own profile, no profile id parameter anywhere (BR-005); actions return no PII beyond counts. **User sign-off** on `toggleKudosLike`.

## Next Steps
05 (page + like/feed clients), 06 (spotlight data).
