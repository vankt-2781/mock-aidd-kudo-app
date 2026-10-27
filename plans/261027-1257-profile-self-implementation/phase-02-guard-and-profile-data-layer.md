# Phase 02 — Guard + profile data layer

## Context Links
- Contract: plan.md "Shared contracts" (view, action, types, `?dir`, copy); technical-spec FR-001..004, FR-012/013, FR-016, FR-021/022, FR-024/025, DEC-001/002, ALG-001/002
- Existing: `src/lib/auth/decide-route-redirect.ts`, `src/lib/auth/return-to.ts`, `src/lib/supabase/update-session-in-proxy.ts` (8b677e2 stale-session fix — do not touch), `src/lib/kudos/{kudos-actions,kudos-board-queries,kudos-row-mappers,kudos-board-types,kudos-feed-cursor,kudos-viewer}.ts`, `src/lib/i18n/kudos-dictionary*.ts`, `src/components/profile/profile-copy.ts` (vi source, read-only)

## Overview
Priority P1 · Status completed · Track B · Depends: none (codes against the 01 view contract; Supabase mocked) · File ownership: `src/lib/**` only.
Route guard for `/profile`, profile id/direction resolution, header + feed queries, `getProfileKudosPage` action, Sent mapper, paging helper extraction, profile dictionary.

## Key Insights
- Proxy calls `decideRouteRedirect(pathname, isAuthenticated, next)`; guest `/todo` → `LOGIN_PATH`. Profile area must return `buildLoginHref("/profile")` = `/login?next=%2Fprofile` (verify the helper's encoding in return-to.ts; `?id` is never forwarded).
- `getFeedPage` already does 10+1 keyset + `likedIdsFor`; extract `likedIdsFor` + a `toFeedPage(rows, liked, map)` into `kudos-feed-paging.ts` so board and profile share it — pure move, board tests unchanged.
- `getViewerStats` already returns the 5 counters (secret_boxes owner-only) — reuse, no new stats query.
- UUID regex already exists in kudos-actions.ts → move to a shared `src/lib/kudos/kudos-uuid.ts` (or export) — DRY.

## Requirements
1. **Guard:** profile area = `/profile` or `startsWith("/profile/")`; guest → `/login?next=%2Fprofile`; `/profile` exact into `RETURN_TO_ALLOW_LIST`. `/todo` + `/login` behavior byte-identical.
2. **`profile-id-resolution.ts`:** `resolveProfileTarget(raw: string | string[] | undefined, viewerProfileId: string): ProfileTarget` — array → not-found; `undefined`/`""` → self; contains whitespace → not-found; non-uuid → not-found; lowercased === viewer id lowercased → self; else `other{profileId: lowercased}`. `parseProfileDirection(raw, face)` per contract (array → received).
3. **`profile-queries.ts`:** `getProfileHeader(profileId): Promise<ProfileHeader | null>` selects `id,display_name,avatar_url,departments(code)` + `profile_kudos_stats(stars)` only (assert in test the select string never contains `kudos_sent|kudos_received|hearts_received|email|auth_user_id`); maps to hero shape (tier via existing F006 derivation, avatar fallback, null dept → ""); error/no row → null. `getProfileFeedPage(profileId, direction, cursor, viewer)` → received: `kudos_feed.eq("receiver_id", id)`; sent: `own_sent_kudos` (no id filter needed — view scopes); keyset/order/limit 11 via shared paging; errors → EMPTY.
4. **`profile-kudos-actions.ts` ("use server"):** `getProfileKudosPage` per contract; order: validate → `getKudosViewer()` → authorize → query.
5. **Mappers:** private `mapPost(row, liked, sender, flags)` shared by `mapFeedRow` (unchanged output + `senderRevealedAnonymous: false`) and new `mapOwnSentRow` (real sender via `mapUser`, `senderAnonymous: false`, `senderRevealedAnonymous: row.is_anonymous`, `viewerIsSender: true`).
6. **`kudos-feed-paging.ts`:** `likedIdsFor`, `toFeedPage` extracted from board queries; `getFeedPage` re-uses them.
7. **Dictionary:** `profile-dictionary.ts` + `-vi.ts` + `-en.ts` (pattern = kudos-dictionary). Keys: `badgeCollectionHeadingSelf` ("Bộ sưu tập icon của tôi"), `badgeCollectionHeadingOther` ("Bộ sưu tập icon"), `sectionCaption`, `sectionTitle`, `directionReceived` ("Đã nhận ({count})"), `directionSent` ("Đã gửi ({count})"), `staticReceivedLabel` ("Đã nhận"), `directionListLabel`, `badgeLockedSuffix`, `emptyReceived` ("Hiện tại chưa có Kudos nào."), `emptySent` ("Bạn chưa gửi Kudos nào."), `writeBar` ("Gửi lời cám ơn và ghi nhận đến {name}"), `anonymousChip` ("Ẩn danh"), `openSecretBox` (Figma label), `statsError`/`statsRetry` (dev draft), `notFoundTitle` ("Không tìm thấy hồ sơ"), `notFoundHome` ("Về trang chủ"); `stats` + `heroLabels` = `kudosDictionary[locale].stats/heroLabels` (same reference). `formatProfileCopy(template, {name,count})`. vi verbatim from profile-copy.ts; en developer draft.

## Architecture
`src/lib/profile/{profile-types,profile-id-resolution,profile-queries,profile-kudos-actions}.ts` (+ tests). Each file < 200 lines.

## Related Code Files
- Modify: `src/lib/auth/decide-route-redirect.ts` (+test), `src/lib/auth/return-to.ts` (+test), `src/lib/kudos/kudos-board-types.ts`, `kudos-row-mappers.ts` (+test), `kudos-board-queries.ts`, `kudos-actions.ts` (UUID import only)
- Create: `src/lib/profile/*` (4 + tests), `src/lib/kudos/kudos-feed-paging.ts` (+test), `src/lib/i18n/profile-dictionary{,-vi,-en}.ts` (+test)
- Do NOT touch: `update-session-in-proxy.ts`, `src/proxy.ts`, any component

## Implementation Steps (TDD, RED first)
1. Read current decide-route-redirect + its tests (8b677e2 context); add failing cases (guest `/profile`, `/profile/x`, `/profiles` NOT guarded, authed pass) → implement.
2. return-to: `/profile` accepted, `/profile?id=x` and `/profile/x` rejected.
3. Resolution table tests (every edge-cases row incl. `%20`, upper-case own id, SQLi, `42`, truncated) → implement; assert no query is invoked for not-found (pure function).
4. Extract paging (board queries tests must pass unchanged) → mapper split (`mapFeedRow` snapshot unchanged except new false flag).
5. Queries + action tests with mocked `createSupabaseServerClient` / `getKudosViewer`: forged sent-for-other → EMPTY and `from` never called; malformed id/cursor/direction → EMPTY; unauthenticated → EMPTY; errors → EMPTY; 11 rows → 10 + cursor.
6. Dictionary tests: key parity vi/en, `stats`/`heroLabels` identity (`toBe`), substitution.
7. `npx tsc --noEmit`, `npx eslint src/lib`, `npx vitest run`.

## Todo List
- [x] Guard + allow-list (+tests)
- [x] profile-types, profile-id-resolution (+tests)
- [x] kudos-feed-paging extraction; mapOwnSentRow + senderRevealedAnonymous (+tests)
- [x] profile-queries, profile-kudos-actions (+tests)
- [x] profile-dictionary vi/en (+tests)
- [x] tsc/eslint 0, vitest 642 + new green

**Completed:** 732 unit tests green at phase completion — guard + allow-list, profile lib, mappers, paging extraction, dictionary all landed. Reviewer finding M2 (forged-sent never reaches query layer) is covered by this phase's unit tests (`from` never called on forged sent-for-other).

## Success Criteria
All new units green; every pre-existing suite unchanged and green (board query + mapper tests only gain the new field assertion); no file > 200 lines.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Guard edit regresses 8b677e2 login fix | M | H | read file first; existing login/stale tests must pass; no proxy edits |
| Sent leak via action for other id | L | H | early EMPTY before any `from`; test asserts `from` not called |
| Other-face header selects counts | L | H | select-string assertion test |
| Paging extraction changes board behavior | L | M | board tests unchanged as the gate |
| `/profiles` prefix false-positive | L | L | explicit test |

## Security Considerations
Identity only from the verified session (`getKudosViewer`). Shape check before every `.eq`. Not-found carries no cause.

## Next Steps
03 consumes action, queries, resolution, dictionary, `senderRevealedAnonymous`.
