# Phase 03 — Profile page integration (both faces)

## Context Links
- Contract: plan.md "Shared contracts"; technical-spec FR-002..020, FR-025/026, SM-001; screens/SCR-profile-self + SCR-profile-other specs
- Inputs: phase 00 components `src/components/profile/**`; phase 02 `src/lib/profile/**`, `profile-dictionary`, `senderRevealedAnonymous`; phase 01 view (applied via `db reset`)
- Board: `src/components/kudos/{kudos-feed-list,kudos-card-env,kudos-user-info,kudos-post-card,kudos-compose-launcher}.tsx`, `src/components/kudos-compose/kudos-compose-controller.tsx`

## Overview
Priority P1 · Status completed · Integration · Depends: 01, 02 · File ownership: `src/app/(site)/profile/**`, `src/components/{profile,kudos,kudos-compose}/**`.
Replace mocks with real data for self + other face, add not-found, profile infinite scroll, "Ẩn danh" chip, write-bar compose preselect, `/profile?id=` card links, stats error retry.

## Key Insights
- Direction switch = `<Link>` to `?dir=` → server render of page 1; reset list via `key={`${profileId}:${direction}:${firstPostId}`}` (discards old pages; label changes only after the new render — FR-015). Re-picking active option renders no link change (no request).
- `KudosFeedList` gains optional `loadPage?: (cursor) => Promise<KudosFeedPage>`; default stays `loadMoreKudos(filters, cursor)` → board unchanged.
- Self stats: ONE `getViewerStats(viewer)` call feeds counters AND dropdown N/M. Null → stats block shows inline error + retry (`router.refresh()`); dropdown still renders both options with count fallback 0 (hero, badges, feed unaffected — FR-009).
- Other face: header + received page only; `dir=sent` ignored; no counts anywhere (not even in data attributes or props passed to client components).

## Requirements
1. `page.tsx`: keep Suspense + sr-only h1 + `getCurrentViewer` re-check (redirect to `buildLoginHref("/profile")`). Read `searchParams` (`id`, `dir`) → `resolveProfileTarget` → not-found → `notFound()`. Self: header(viewer.profileId) + stats + feed(self, dir). Other: header(id) (null → `notFound()`) + feed(id, "received"). Viewer header null on self → `notFound()` (deferred guard noted).
2. `src/app/(site)/profile/not-found.tsx`: "Không tìm thấy hồ sơ" + `<Link href="/">Về trang chủ</Link>` from the profile dictionary.
3. Components: `ProfileDirection` → re-export `ProfileKudosDirection` from lib; props gain `face`, `profileMessages`, `cursor`, `profileId`, `statsError`, `recipient` (other); `profile-copy.ts` removed (dictionary replaces it) and `MOCK_PROFILE_*` stay only as test fixtures (no import from `page.tsx`).
4. Self section: dropdown options `[received → href(self, received), sent → href(self, sent)]` with counts; empty copy per direction. Other section: static "Đã nhận" heading, no dropdown, no count.
5. Other face write bar (`profile-write-kudos-bar.tsx`): copy with `{name}`; opens existing compose via `KudosComposeLauncher` with `initialRecipient={ {id, name, avatarSrc, department} }`. `KudosComposeController` + reducer accept optional `initialRecipient` (default null) seeding the recipient field; removable like a normal pick.
6. Chip: `KudosCardEnv.anonymousChipLabel?: string`; `KudosUserInfo` gains `revealedAnonymousLabel?: string` rendered as chip when `post.senderRevealedAnonymous` (sender block only). Board never sets it.
7. Card links: `profileHref(signedIn, profileId?)` → signed in + id → `/profile?id=${id}`; no id → `/profile`; guest → login href. Sender AND receiver blocks pass ids; anonymous (masked) → no link (unchanged). Action bar + sidebar call without id. Update `kudos-card-anonymous-and-title.test.tsx` href assertion to the `?id=` form.
8. Heart / hashtag / copy-link: reuse `KudosPostCard` unchanged (own anonymous in Sent → `viewerIsSender` true → heart refused).

## Architecture
Server page → `ProfilePageContent` (server) → `ProfileHero`, `ProfileBadgeCollection`, slot (`ProfileStats` | `ProfileWriteKudosBar`), `ProfileKudosSection` → `KudosFeedList` (client, `loadPage` bound to `getProfileKudosPage(profileId, direction, c)`).

## Related Code Files
- Modify: `src/app/(site)/profile/page.tsx`; `src/components/profile/{profile-types,profile-page-content,profile-kudos-section,profile-stats,profile-hero,profile-badge-collection,index}.ts(x)`, `profile-page-content.test.tsx`; `src/components/kudos/{kudos-feed-list,kudos-card-env,kudos-user-info,kudos-compose-launcher}.tsx`, `kudos-card-anonymous-and-title.test.tsx`; `src/components/kudos-compose/{kudos-compose-controller,kudos-compose-reducer}.ts(x)`
- Create: `src/app/(site)/profile/not-found.tsx`, `src/components/profile/profile-write-kudos-bar.tsx`, `profile-stats-error.tsx` (client retry), tests for section/write bar/chip/links/feed loadPage
- Delete: `src/components/profile/profile-copy.ts`

## Implementation Steps (TDD where unit-testable)
1. Feed list `loadPage` test (custom loader called with cursor; default path unchanged) → implement.
2. `profileHref` + user-info chip/link tests → implement; update anonymous-and-title href assertion.
3. Compose `initialRecipient` tests (new file); existing compose suites run UNCHANGED → green.
4. Profile components: face split, dictionary copy, write bar, stats error retry; update Track A test.
5. page.tsx + not-found.tsx wiring; remove mock imports.
6. tsc/eslint/vitest/`next build`.
7. Live sanity (dev server, after `db reset`): `curl -sI /profile` → 307 `location: /login?next=%2Fprofile`; persona other-face page (`/profile?id=00000000-0000-4000-8000-000000010100` as another user) HTML has no dropdown sent option / count — grep the dropdown `aria-label` region, NOT bare "Đã gửi" (compose toast contains it); `?id=banana` shows not-found text.

## Todo List
- [x] KudosFeedList loadPage (+test)
- [x] profileHref(id) + chip + link test update
- [x] Compose initialRecipient (+test), compose suites unchanged
- [x] Profile components real props, write bar, stats error, profile-copy removed
- [x] page.tsx + not-found.tsx
- [x] tsc/eslint/vitest/build 0; live sanity

**Completed:** 761 unit tests green. Live checks passed: guest → 307 `location: /login?next=%2Fprofile`; both faces render real data; 0 occurrences of `Đã gửi (` on other face; not-found text renders. Reviewer deferred `profileHref` empty-id fallback tightening (L1).

## Success Criteria
Both faces render seeded data; not-found matrix renders same text; board + homepage compose open empty; all prior unit suites green (only the one href assertion edited); no `MOCK_PROFILE_` import outside tests.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Count leak on other face via client props/RSC | M | H | other face never fetches stats; 04 payload scan |
| Compose prop changes default flow | L | H | default null; compose suites unchanged gate |
| Stale pages after direction switch | M | M | list `key` incl. direction + first post id |
| Card-link change breaks board tests | M | L | single assertion update, documented |
| File > 200 lines (page.tsx) | M | L | split loaders into `profile-page-loaders.ts` under app dir |

## Security Considerations
Recipient preselect is convenience only; `sendKudos` re-validates. No email/auth ids in hero data.

## Next Steps
04 e2e on the integrated page.
