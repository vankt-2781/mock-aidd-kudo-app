---
status: implemented
fcode: F008
authored_by: takumi
created: 2026-10-27
lang: en
---

# Profile (self + other face)

**Feature code**: F008
**Priority**: P1
**Type**: ui + api + data
**Generated**: 2026-10-27

## Overview

`/profile` (MoMorph 3FoIx6ALVb self, w4WUvsJ9KI other) is the private Sunner profile page. One route, two faces chosen by `?id`. SELF face (`id` absent, empty, or own profile id, compared case-insensitively; no redirect): keyvisual hero (avatar, gold name, department, tier badge plus stars by the F006 rule), "Bộ sưu tập icon của tôi" with 6 locked badge slots, 5 personal counters (board-sidebar wording, viewer stats incl. anonymous; Secret Box counts real from owner-only `secret_boxes`; "Mở Secret Box" shown, disabled), and a KUDOS section with a direction dropdown ("Đã nhận (N)" / "Đã gửi (M)") over a 10-per-page keyset infinite-scroll feed built from board components. OTHER face (`id` = another Sunner): same hero and badges (heading "Bộ sưu tập icon"), stats slot replaced by the write-Kudo bar "Gửi lời cám ơn và ghi nhận đến {name}" which opens the existing compose modal with the viewed Sunner preselected, and a Received-only list under the static label "Đã nhận" with NO count of any kind (anonymous differential-leak defense). Own Sent includes anonymous kudos (real self name plus an "Ẩn danh" chip) through a NEW caller-scoped SECURITY DEFINER view `own_sent_kudos`. `?id` is shape-checked before any query; unknown, malformed, repeated or whitespace ids all render the same not-found UI. Guests go to `/login?next=%2Fprofile` via the route guard (page re-check kept). Copy lives in a NEW `profile-dictionary` (vi exact, en draft). Spam chip deferred; end-of-feed message dropped (board parity). Build status: Track A builds presentational `src/components/profile/**`; migration, actions, queries, guard change and dictionary are planned.

## Polymorphic Behavior

Discriminator: face, derived on the server from `?id` and the session.

| Face | Condition | Stats slot | KUDOS label | Directions | Counts shown |
|------|-----------|------------|-------------|------------|--------------|
| self | `id` absent, empty, or equals session profile id (case-insensitive) | 5 counters + disabled "Mở Secret Box" | dropdown "Đã nhận (N)" / "Đã gửi (M)" | received, sent | yes (viewer stats) |
| other | `id` is a valid uuid of another existing profile | write-Kudo bar | static "Đã nhận" | received only | none |
| not-found | `id` malformed, repeated, whitespace, unknown, or profile load error | none (not-found UI) | none | none | none |

## Cross-Cutting Logic

### Requirements

| Code | Description | Endpoint/Handler | Verifiable |
|------|-------------|------------------|------------|
| FR-001 | `/profile` is private: guest to `/login?next=%2Fprofile` from the route guard (`/profile` and `/profile/*`); the page re-checks the session (defense in depth) | PAGE `/profile`, `decideRouteRedirect` | yes |
| FR-002 | `?id` resolution order: (1) `id` repeated (array) or whitespace-containing, not empty, then not-found; (2) empty string or absent then self; (3) not matching uuid shape (`8-4-4-4-12` hex, case-insensitive, any version) then not-found WITHOUT any query; (4) equals session profile id lowercased then self face in place; (5) else lookup, no row or error then not-found | PAGE `/profile` | yes |
| FR-003 | Not-found UI is identical for unknown, malformed, repeated, whitespace and load-error: "Không tìm thấy hồ sơ" plus link "Về trang chủ"; no detail of the cause; HTTP status is 200 under cacheComponents streaming, the TEXT is the contract | PAGE `/profile` | yes |
| FR-004 | Profile lookup reads public `profiles` columns (id, display_name, avatar_url, department_id) plus department label plus `profile_kudos_stats.stars` ONLY; the other face NEVER selects `kudos_sent`, `kudos_received` or `hearts_received`; payload carries no email and no auth ids | PAGE `/profile` | yes |
| FR-005 | Hero: keyvisual artwork (no ghost nav/avatar), avatar, gold name, department, tier badge plus stars on one row. Tier and stars follow the F006 rule from stars (kudos_received thresholds 10/20/50); at 0 stars no badge and no stars. Sparse profile: null avatar gives placeholder avatar, null department gives no department line | PAGE `/profile` | yes |
| FR-006 | Badge collection: exactly 6 slots, fixed order, real artwork desaturated, all locked (no unlock source exists yet); heading "Bộ sưu tập icon của tôi" (self) / "Bộ sưu tập icon" (other); an optional unlocked list prop is the future hook | PAGE `/profile` | yes |
| FR-007 | SELF stats: 5 counters from the viewer stats source used by the board sidebar (kudos received, kudos sent incl. anonymous, hearts received, Secret Boxes opened, unopened), same second-person labels as the sidebar; Secret Box counts are real rows from owner-only `secret_boxes` | PAGE `/profile` | yes |
| FR-008 | "Mở Secret Box" renders with the Figma label, disabled; no dialog, no request | PAGE `/profile` | yes |
| FR-009 | Stats load failure on SELF: inline error plus retry inside the stats block only (vi copy developer draft, PM review); hero, badges and feed stay | PAGE `/profile` | yes |
| FR-010 | OTHER face shows the write-Kudo bar "Gửi lời cám ơn và ghi nhận đến {name}" in the stats slot; click opens the existing compose modal with the viewed Sunner preselected via optional `initialRecipient` prop (default null: board and homepage flows unchanged); SELF shows no bar | PAGE `/profile`, `KudosComposeController` | yes |
| FR-011 | Preselected recipient is a normal picked recipient (removable, same validation); a self-id preselect never occurs (self face has no bar) | PAGE `/profile` | yes |
| FR-012 | SELF direction dropdown offers "Đã nhận (N)" and "Đã gửi (M)" with N, M from FR-007 stats; trigger shows the ACTIVE direction; Received is default; state lives in the URL `?dir=received\|sent` via Link hrefs (like `KudosFilterDropdown`) so deep links work | PAGE `/profile` | yes |
| FR-013 | `dir` normalization: unknown value, or `sent` on the other face, is treated as received; `?id` is preserved in dropdown hrefs | PAGE `/profile` | yes |
| FR-014 | OTHER face KUDOS section: static label "Đã nhận", no dropdown, NO count anywhere (label, empty state, DOM attributes, payload) | PAGE `/profile` | yes |
| FR-015 | Switching direction loads page 1 of the new direction and discards old pages; label updates only after the load; re-picking the active direction is a no-op (no request) | PAGE `/profile` | yes |
| FR-016 | Feed is 10 per page (`FEED_PAGE_SIZE`), newest first, board keyset cursor, loaded by an intersection-observer sentinel; when a page is short or cursor is null loading stops silently (no end-of-feed message; deviation) | ACTION `getProfileKudosPage` | yes |
| FR-017 | Per-direction empty copy: received "Hiện tại chưa có Kudos nào." ; sent "Bạn chưa gửi Kudos nào." | PAGE `/profile` | yes |
| FR-018 | Cards reuse the board components and `mapFeedRow`; anonymous kudos stay masked on Received lists (alias plus default avatar, no sender link); no Spam chip is rendered (typed `status` field kept for later) | PAGE `/profile` | yes |
| FR-019 | Card links go to `/profile?id={profileId}` for non-anonymous sender/receiver; anonymous cards have no sender link; sidebar sunner link and action-bar profile link keep `/profile` | PAGE `/kudos`, PAGE `/profile` | yes |
| FR-020 | Hearts, hashtag click (`/kudos?hashtag=...`) and copy-link reuse the board behavior and toast; self-kudo heart refusal holds, including the viewer's own anonymous kudos in Sent (`viewer_is_sender` true) | existing board actions | yes |
| FR-021 | `getProfileKudosPage(profileId, direction, cursor)` validates ALL inputs first (uuid shape, direction enum, cursor via the board cursor decoder); requires a verified session; `sent` runs only when session profile id equals `profileId` (case-insensitive), otherwise returns an EMPTY page (no error, no leak); `received` reads `kudos_feed` filtered by `receiver_id` | ACTION `getProfileKudosPage` | yes |
| FR-022 | Sent reads the NEW `own_sent_kudos` view; real sender name/avatar/department on every row; anonymous rows get the "Ẩn danh" chip through a Sent-mode-only mapper flag (`mapFeedRow` never sets it) | ACTION `getProfileKudosPage` | yes |
| FR-023 | NEW migration (own file, timestamp after 20261022000004): view `own_sent_kudos`, SECURITY DEFINER, `WHERE sender = caller profile via auth.uid()`, mirrors the 19 `kudos_feed` columns exactly (names, order, types; `anonymous_name` not selected), `viewer_is_sender` constant true, SELECT granted to `authenticated` only (revoked from anon), ROLLBACK comment (precedent 20261022000002) | DB migration | yes |
| FR-024 | `/profile` added to `decideRouteRedirect` guarded area (`/profile` and `/profile/*`) keeping the page re-check; `"/profile"` added to `RETURN_TO_ALLOW_LIST` (exact match; `?id` is dropped on return, so guest `/profile?id=X` returns to own profile) | `decide-route-redirect`, `return-to` | yes |
| FR-025 | Copy comes from a NEW `profile-dictionary` (vi exact design copy, en developer draft) with `{name}`, `{count}` substitution; not added to the kudos dictionary | PAGE `/profile` | yes |
| FR-026 | Page is read-only: no write endpoint except the reused compose and like actions; no email, auth id or other-face counts in the RSC payload | PAGE `/profile` | yes |

### Business Rules

#### BR-001_OtherFaceReceivedOnly
**Rule:** another Sunner's profile exposes Received only and no count of any kind; Sent and its count would differ from the received-only view when anonymous kudos exist (differential leak).
**Linked FR:** FR-004, FR-014, FR-021

#### BR-002_SentIsCallerScoped
**Rule:** a Sent list is only ever the caller's own. Two independent layers: the action refuses non-self (empty page) and the definer view scopes to `auth.uid()` regardless of input.
**Linked FR:** FR-021, FR-023

#### BR-003_AnonymousOwnerVisibility
**Rule:** the owner sees own anonymous kudos in Sent with real self identity plus the "Ẩn danh" chip; everywhere else anonymity masking is unchanged (BR-006 of the send dialog).
**Linked FR:** FR-022, FR-018

#### BR-004_NotFoundIndistinguishable
**Rule:** malformed, unknown, duplicated, whitespace and error cases render one identical not-found output, so profile existence cannot be probed by error shape.
**Linked FR:** FR-002, FR-003

#### BR-005_TierFromStars
**Rule:** tier badge and stars derive from `stars` of the F006 rule (not distinct senders); zero stars shows neither.
**Linked FR:** FR-005

### Decision Logic

#### DEC-001_IdResolution
**Subtype:** flow
**Linked FR:** FR-002

| Condition (in order) | Outcome | user_visible_outcome |
|----------------------|---------|----------------------|
| `id` repeated, or contains whitespace | not-found | "Không tìm thấy hồ sơ" |
| `id` absent or `""` | self face | own profile |
| `id` not uuid shape | not-found (no query) | "Không tìm thấy hồ sơ" |
| `id.toLowerCase()` equals own profile id | self face (no redirect) | own profile, URL unchanged |
| lookup finds a row | other face | that Sunner |
| no row or error | not-found | "Không tìm thấy hồ sơ" |

#### DEC-002_DirectionResolution
**Subtype:** flow
**Linked FR:** FR-012, FR-013

| Condition | Outcome |
|-----------|---------|
| self face, `dir=sent` | Sent list |
| self face, `dir=received`, absent or unknown | Received list |
| other face, any `dir` | Received list |

### State Machines

#### SM-001_ProfileFeed
**kind:** ui
**Linked FR:** FR-015, FR-016
**States:** Loading, Ready, LoadingMore, Empty, Error

| From | To | Guard | Side effect |
|------|----|-------|-------------|
| Loading | Ready | page 1 non-empty | cards shown |
| Loading | Empty | page 1 empty | per-direction empty copy |
| Ready | LoadingMore | sentinel visible and cursor present | fetch next page |
| LoadingMore | Ready | page returned | append; stop silently when short/no cursor |
| any | Loading | direction changed | discard pages, label updates after load |
| Loading, LoadingMore | Error | action error | TBD (draft) inline retry |

### Algorithms

#### ALG-001_UuidShapeGuard
**Linked FR:** FR-002, FR-021
**Steps:** test `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$` (case-insensitive) on the raw string before it reaches any query or `.eq`; lowercase for comparison and for the lookup.

#### ALG-002_SentModeMapping
**Linked FR:** FR-022
**Steps:** rows from `own_sent_kudos` pass through the board feed mapper; a Sent-mode wrapper (not `mapFeedRow`) sets `anonymousChip = is_anonymous`. Real sender fields are already in the row, so the card shows the viewer's own name with the chip.

### External Integrations

None new. Reuses Supabase Postgres (views, `secret_boxes` owner policy) and the existing compose, like and copy-link flows.

### Data and API

**Route:** PAGE `/profile?id=<uuid>&dir=received|sent` (server component, session required).

**Server action:** `getProfileKudosPage(profileId: string, direction: "received" | "sent", cursor: string | null): Promise<KudosFeedPage>` (same page shape as `loadMoreKudos`; result union follows `kudos-actions.ts`). Order: validate inputs, verify user, resolve session profile, authorize direction, query, map. Invalid input or unauthenticated returns an error result; non-self Sent returns an empty page.

**Queries:**

| Need | Source | Notes |
|------|--------|-------|
| Session profile id | `viewer_profile` via `getKudosViewer` | existing |
| Profile (other face) | `profiles` public columns + `departments` + `profile_kudos_stats.stars` | never `kudos_sent` |
| Self stats | existing viewer stats helper (`viewer_kudos_stats` + `secret_boxes`) | same as board sidebar |
| Received list | `kudos_feed` where `receiver_id = profileId` | board cursor, page 10 |
| Sent list | `own_sent_kudos` | board cursor, page 10 |

**View `own_sent_kudos` (intent):** definer; select the 19 `kudos_feed` columns from `kudos k` joined to sender profile, receiver profile, departments and `profile_kudos_stats` with real sender fields; `where k.sender_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())`; `viewer_is_sender` = true; `revoke all` from anon and authenticated then `grant select ... to authenticated`. Rollback: `drop view public.own_sent_kudos;`.

**DB impact:**

| Event | Object | Operation | Source |
|-------|--------|-----------|--------|
| Migration | `own_sent_kudos` | CREATE VIEW + grants | TBD (draft) |
| `getProfileKudosPage` received | `kudos_feed` | SELECT | TBD (draft) |
| `getProfileKudosPage` sent | `own_sent_kudos` | SELECT | TBD (draft) |
| Page load | `profiles`, `departments`, `profile_kudos_stats` | SELECT | TBD (draft) |

### Verification

- **SC-001** Guest to `/profile` and `/profile?id=X` lands on `/login?next=%2Fprofile`; after login returns to own profile with `id` dropped; `return-to` allow-list is exact-match only (FR-001, FR-024; TC ACC_001)
- **SC-002** Self view shows hero, 6 badges, 5 counters, KUDOS section (FR-005 to FR-007; TC ACC_002, GUI_001 to GUI_005)
- **SC-003** `?id` matrix: other uuid, own id (upper and lower case) renders self in place, empty `id=` self, unknown uuid, `banana`, SQLi string, `42`, truncated uuid, whitespace, `id=a&id=b` all not-found with the same text and no query for malformed (FR-002, FR-003; TC FUN_001 to FUN_005)
- **SC-004** Other face: bar copy with name, click opens compose with recipient preselected, board and homepage compose still start empty, no bar on self (FR-010, FR-011; TC FUN_006 to FUN_008)
- **SC-005** Self dropdown shows both labels with counts, trigger shows active direction; other face shows only static "Đã nhận" and no Sent label or any count in the DOM (FR-012 to FR-014; TC FUN_009, SEC_001)
- **SC-006** Own Sent includes an anonymous kudos with real self name plus "Ẩn danh" chip; a second session never sees it; calling `getProfileKudosPage` with another id and `sent` returns empty; direct `own_sent_kudos` query as anon is denied and as another user returns only that user's rows (FR-021 to FR-023; TC SEC_002, SEC_003)
- **SC-007** Direction switch resets to page 1, label after load, re-pick no-op, per-direction empty copy, 10 per page infinite scroll with no end message (FR-015 to FR-017; TC FUN_010 to FUN_013)
- **SC-008** Cards match the board; Received anonymous masked; heart refusal on own kudos incl. own anonymous in Sent; hashtag and copy-link work; no Spam chip (FR-018 to FR-020; TC GUI_006, GUI_007, FUN_014, FUN_015)
- **SC-009** vi/en parity with count and name substitution (FR-025; TC GUI_008)
- **SC-010** Sparse profile: placeholder avatar, no department line, no badge/stars at zero, no crash (FR-005; TC GUI_009)
- **SC-011** RSC payload and network responses of both faces contain no email, no auth ids, and on the other face no kudos counts (FR-004, FR-026; TC SEC_004)

## User Stories

### US001_ViewOwnProfile — See my own profile (Priority: P1)

**What happens:** A signed-in Sunner opens `/profile` and sees hero, locked badge slots, personal counters and their Kudos feed with a Received/Sent switch.
**Why this priority:** Primary profile entry from the account menu and sidebar.
**Independent Test:** Sign in as the persona, open `/profile`, verify counters equal the board sidebar and both directions load.
**Endpoints**: PAGE `/profile`, ACTION `getProfileKudosPage`

**Acceptance Scenarios:**

1. **Given** a guest, **When** they open `/profile`, **Then** they land on `/login?next=%2Fprofile`.
2. **Given** a signed-in Sunner, **When** they open `/profile` or `/profile?id=` or their own id in any case, **Then** the same self view shows.
3. **Given** the self view, **When** they pick "Đã gửi (M)", **Then** page 1 of their sent kudos (anonymous included, chip shown) loads and the URL carries `dir=sent`.
4. **Given** stats fail to load, **When** the block renders, **Then** an inline error with retry shows and the rest stays.

**Requirements fulfilled:**
- **FR-001** Private route
- **FR-002** Id resolution
- **FR-005** Hero
- **FR-006** Badges
- **FR-007** Stats
- **FR-008** Disabled Secret Box button
- **FR-009** Stats error
- **FR-012** Direction dropdown
- **FR-013** Dir normalization
- **FR-015** Direction switch
- **FR-016** Feed paging
- **FR-017** Empty copy
- **FR-018** Cards
- **FR-020** Interactions
- **FR-021** Action authorization
- **FR-022** Sent mapping
- **FR-023** Migration
- **FR-024** Guard and allow-list
- **FR-025** Dictionary

**Rules enforced:** BR-002, BR-003, BR-005

**Verification:**
- **SC-001**, **SC-002**, **SC-006**, **SC-007**, **SC-008**, **SC-009**, **SC-010**

---

### US002_ViewColleagueProfile — See a colleague and thank them (Priority: P1)

**What happens:** A signed-in Sunner opens another Sunner's profile from a card link, sees their hero, badges and received kudos, and sends them a Kudo from the write bar.
**Why this priority:** Completes the card-to-profile loop; required by the other-face frame.
**Independent Test:** Click a non-anonymous card name on the board, verify no counts and no Sent anywhere, click the bar, verify compose opens with that recipient.
**Endpoints**: PAGE `/profile`, ACTION `getProfileKudosPage`, ACTION `sendKudos` (existing)

**Acceptance Scenarios:**

1. **Given** a card link, **When** clicked, **Then** `/profile?id={profileId}` shows the other face.
2. **Given** the other face, **When** it renders, **Then** the label is static "Đã nhận" and no count appears anywhere.
3. **Given** the write bar, **When** clicked, **Then** the compose modal opens with the Sunner preselected.
4. **Given** `?dir=sent` on the other face, **When** it renders, **Then** Received shows.
5. **Given** an unknown or malformed id, **When** the page renders, **Then** "Không tìm thấy hồ sơ" with "Về trang chủ".

**Requirements fulfilled:**
- **FR-002** Id resolution
- **FR-003** Not-found UI
- **FR-004** Lookup columns
- **FR-005** Hero
- **FR-006** Badges
- **FR-010** Write bar
- **FR-011** Preselect
- **FR-014** Received-only
- **FR-018** Cards
- **FR-019** Card links
- **FR-021** Action authorization
- **FR-026** Read-only payload

**Rules enforced:** BR-001, BR-002, BR-004

**Verification:**
- **SC-003**, **SC-004**, **SC-005**, **SC-006**, **SC-010**, **SC-011**

---

### Edge Cases

See edge-cases.md.

## Key Entities

| Entity | Table/View | Key Columns | Purpose |
|--------|------------|-------------|---------|
| Profile (read) | `profiles` | id, display_name, avatar_url, department_id | hero identity (public columns only) |
| Department | `departments` | code, name | hero department line |
| Stats (public) | `profile_kudos_stats` | profile_id, stars | tier badge and stars on both faces |
| Stats (owner) | `viewer_kudos_stats` | profile_id, kudos_received, kudos_sent, hearts_received | SELF counters and dropdown counts |
| Secret boxes | `secret_boxes` | profile_id, opened state | SELF box counters (owner-only) |
| Received feed | `kudos_feed` | 19 board columns, receiver_id | Received list |
| Own sent feed (NEW) | `own_sent_kudos` | same 19 columns as `kudos_feed` | caller-scoped Sent list incl. anonymous |
| Dictionary (NEW) | static `profile-dictionary` vi/en | copy keys | locale-driven copy |

RLS and grant intent: `own_sent_kudos` definer view bypasses the `kudos.sender_id` column revoke on purpose and is the only path to own-sent rows; select granted to `authenticated` only; scoping by `auth.uid()` inside the view.

## Artifact References

| Artifact | File | Codes Used | Reviewed |
|----------|------|------------|----------|
| System Overview | [overview.md](../../../../docs/system/overview.md) | — | [ ] |
| Architecture | [architecture.md](../../../../docs/system/architecture.md) | TBD (draft) | [ ] |
| Feature List | [feature-list.md](../../../../docs/generated/feature-list.md) | F008 | [ ] |
| API Map | [api-map.md](../../../../docs/generated/api-map.md) | TBD (draft) | [ ] |
| Entities | [entities.md](../../../../docs/generated/entities.md) | TBD (draft) | [ ] |
| Screens | [screens.md](screens.md) | SCR### TBD (draft) | [ ] |
| Behavior Logic | [behavior-logic.md](../../../../docs/generated/behavior-logic.md) | TBD (draft) | [ ] |
| Permissions | [permissions.md](../system/permissions.md) | TBD (draft) | [ ] |
| Permissions Matrix | [permissions-matrix.md](../../../../docs/generated/permissions-matrix.md) | TBD (draft) | [ ] |
| User Stories | [user-stories.md](../../../../docs/generated/user-stories.md) | TBD (draft) | [ ] |

System-doc forward-draft: `plans/261027-1257-profile-self-implementation/spec/system/permissions.md` (own-sent view scoping, other-face anonymity boundary, guard and allow-list).

## Assumptions

- Sources: MoMorph 3FoIx6ALVb (28 spec rows, 30 test cases), frame w4WUvsJ9KI, plus `clarifications.md` (16 decisions, authoritative).
- Test cases were written against another implementation; behavior adopted, mechanics adapted to this codebase (see edge-cases.md deviations).
- Tier uses the F006 stars rule, not the TC distinct-senders denominator (recorded deviation).
- Badge unlock source is the future Secret Box feature; all 6 locked now.
- Department line shows `departments.name` (draft; PM may prefer code).
- Compose modal gains optional `initialRecipient` (default null); existing callers untouched.
- Track A builds `src/components/profile/**` presentational only (props-driven); Track B wires queries, action, guard, migration, dictionary and the compose prop.
- Card-to-profile links change `/kudos` cards (FR-019); anonymous cards stay link-free.

## Source Code References

No source code is written yet for the view, action, queries, dictionary or profile components. Existing code the plan builds on, by name only: `src/lib/auth/decide-route-redirect.ts`, `src/lib/auth/return-to.ts`, board helpers under `src/lib/kudos/` (actions, cursor, row mappers, viewer, board queries, types), kudos dictionary pattern under `src/lib/i18n/`, board components and compose launcher under `src/components/kudos/`, migrations under `supabase/migrations/` (precedent 20261022000002).

## Unresolved Questions

Resolved in `clarifications.md`: scope both faces; tier rule; card links; own-sent source; self id in place; dictionary; anonymous chip; other-face label; guard and allow-list; Secret Box counters; Spam deferred; `?dir` URL state; stats error; end message dropped; migration file; 404 copy.

Known test-case deviations (for PM):
- TC tier by distinct senders vs F006 stars rule: stars rule kept.
- TC end-of-feed message dropped (board parity).
- TC says guest to `/login`; we add `next=%2Fprofile` and `?id` is dropped on return.
- notFound HTTP status is 200 (cacheComponents streaming); text asserted.

Still open (draft): see the Gaps block returned with this draft; PM review of developer-draft copy (stats error, not-found, en strings).
