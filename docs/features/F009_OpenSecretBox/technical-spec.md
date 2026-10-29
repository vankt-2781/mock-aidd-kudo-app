---
status: implemented
fcode: F009
authored_by: takumi
created: 2026-10-28
lang: en
---

# Open Secret Box

**Priority**: P1
**Type**: ui + api + data
**Generated**: 2026-10-28

## Overview

One modal, two phases (MoMorph J3-4YFIpMM, frame 1466:7676 "Open secret box - chưa mở"; 19 test cases). A signed-in Sunner with at least one unopened Secret Box opens it from the "Mở Secret Box" button in the `/kudos` sidebar stats box OR in the own-Profile stats block (both open the same modal). IDLE phase: title "KHÁM PHÁ SECRET BOX CỦA BẠN", instruction "Click vào box để mở", a centered clickable gift-box image, footer label "Secretbox chưa mở" with the unopened count (large, bold, yellow, two digits e.g. 05), and a close (X) at top right. Clicking the box calls the server once. SUCCESS phase (same modal): title "MỞ SECRET BOX THÀNH CÔNG", the received badge image shown inside the box illustration, the count decremented, instruction "Click vào box để tiếp tục mở" (hidden when the count is 0), box click disabled when the count is 0.

Opening is decided entirely on the server: a NEW `SECURITY DEFINER` function `open_secret_box()` derives the profile from the verified session, atomically claims ONE unopened box, draws a badge by weighted random, stores it and returns the badge plus the remaining unopened count. Opened badges unlock the matching slot in the Profile badge collection (self face). The two existing "Mở Secret Box" buttons stop being a placeholder dialog (kudos sidebar) and stop being disabled (Profile).

## Polymorphic Behavior

Discriminator: modal phase, driven by the last server result (never by client-side randomness).

| Phase | Condition | Title | Box illustration | Instruction | Box click |
|-------|-----------|-------|------------------|-------------|-----------|
| idle | modal opened, no open done yet in this session of the modal | "KHÁM PHÁ SECRET BOX CỦA BẠN" | closed gift box | "Click vào box để mở" | enabled (count above 0 by entry rule) |
| success, count above 0 | last open succeeded, `remaining_unopened` above 0 | "MỞ SECRET BOX THÀNH CÔNG" | received badge inside box | "Click vào box để tiếp tục mở" | enabled |
| success, count 0 | last open succeeded, `remaining_unopened` = 0 | "MỞ SECRET BOX THÀNH CÔNG" | received badge inside box | hidden | disabled |

## Cross-Cutting Logic

### Requirements

| Code | Description | Endpoint/Handler | Verifiable |
|------|-------------|------------------|------------|
| FR-001 | Both entry buttons open the SAME modal component: "Mở Secret Box" in the `/kudos` sidebar stats box and in the own-Profile stats block. Profile button is enabled when unopened above 0 and disabled at 0 (existing). Kudos sidebar keeps its visitor behavior: a guest click goes to login and no modal opens | PAGE `/kudos`, PAGE `/profile` | yes |
| FR-002 | The modal opens only for a signed-in owner with unopened above 0 (button disabled at 0 is the entry guard; the server re-checks on every open) | UI + RPC `open_secret_box` | yes |
| FR-003 | IDLE phase copy and layout as in Polymorphic Behavior; footer shows the label "Secretbox chưa mở" (small, white) and the count (large, bold, yellow) with leading zero to two digits; the count shown is the backend unopened count passed in by the opener | UI | yes |
| FR-004 | Clicking the box (idle or success with count above 0) calls `open_secret_box()` once; the box is non-interactive while the call is in flight (no double submit) | UI + RPC | yes |
| FR-005 | On success the modal shows the SUCCESS phase: received badge image inside the box illustration, count = returned `remaining_unopened`, one badge per open; further clicks open the next box | UI | yes |
| FR-006 | At `remaining_unopened` = 0 the instruction is hidden and box click is disabled | UI | yes |
| FR-007 | Close (X), Esc and backdrop click close the modal; on close the page counters (opened, unopened) and, on Profile, the badge collection reflect the new backend state (mechanism TBD (draft)) | UI | yes |
| FR-008 | The count displayed always reflects the backend: it comes from the opener at open time and from each RPC result afterwards, never from a client-side decrement | UI | yes |
| FR-009 | Invalid, unknown or missing badge key in a result or in stored data renders a fallback badge image; no crash, no broken-image icon | UI | yes |
| FR-010 | RPC failure (network error, no unopened box, not signed in) keeps the current phase and count, re-enables the box and shows an inline error with the box still retryable; copy TBD (draft) | UI + RPC | yes |
| FR-011 | NEW migration (own file after 20261027000001): `alter table public.secret_boxes add column badge text` (nullable; null = unopened or opened before this feature) with a check constraint limiting non-null values to the 6 badge keys | DB migration | yes |
| FR-012 | NEW function `public.open_secret_box()` `SECURITY DEFINER` with a pinned `search_path`, no arguments: derive the profile from `auth.uid()` via `profiles.auth_user_id`; atomically claim ONE unopened owned box (`FOR UPDATE SKIP LOCKED` or equivalent); draw a badge server-side by weighted random (ALG-001); set `opened_at = now()` and `badge`; return `badge` and `remaining_unopened` (unopened count of the caller after the claim) | DB migration | yes |
| FR-013 | No unopened box for the caller, or no signed-in profile: the function raises a controlled error and changes nothing | RPC `open_secret_box` | yes |
| FR-014 | Grants: `revoke all` on the function from `public` and `anon`, `grant execute` to `authenticated` only. No client-writable path to `secret_boxes` is added (no insert, update or delete grant or policy; owner-only select policy unchanged) | DB migration | yes |
| FR-015 | Client cannot influence the outcome: the RPC takes no input; any tampered request (extra params, forged badge, forged profile id, replayed call) is ineffective; the badge exists only as the stored result of the draw | RPC `open_secret_box` | yes |
| FR-016 | Concurrency: two simultaneous calls never claim the same box and never over-open; with N unopened and M calls the result is min(N, M) successes and the rest controlled errors | RPC `open_secret_box` | yes |
| FR-017 | Profile self face: the 6 badge slots unlock from the owner's own opened boxes (distinct non-null `badge` values read through the existing owner-only select); other face and other payloads carry no badge data (default; see Unresolved Questions) | PAGE `/profile` | yes |
| FR-018 | Copy lives in a NEW `secret-box` copy module (vi exact from the frame, en draft); badge display names are TBD (draft) | UI | yes |

### Business Rules

#### BR-001_ServerOnlyDraw
**Rule:** the badge is chosen only inside the database function from a server random draw; the client never supplies or sees odds before the result, and cannot repeat, skip or choose a draw.
**Linked FR:** FR-012, FR-015

#### BR-002_OneBadgePerOpen
**Rule:** one call claims exactly one box and yields exactly one badge; the box stays opened (never re-drawn).
**Linked FR:** FR-005, FR-012, FR-016

#### BR-003_OwnerOnly
**Rule:** only the box owner (via the verified session) can open a box; guests and other users cannot open or read it.
**Linked FR:** FR-002, FR-012, FR-014

#### BR-004_BadgeUnlocksProfileSlot
**Rule:** a badge is unlocked on the owner's Profile exactly when at least one of their opened boxes carries that badge key; duplicates do not add slots.
**Linked FR:** FR-017

### Decision Logic

#### DEC-001_ModalPhase
**Subtype:** flow
**Linked FR:** FR-003, FR-005, FR-006

| Condition | Outcome | user_visible_outcome |
|-----------|---------|----------------------|
| modal just opened | idle | "KHÁM PHÁ SECRET BOX CỦA BẠN", closed box, count from opener |
| open succeeded and `remaining_unopened` above 0 | success, continue | "MỞ SECRET BOX THÀNH CÔNG", badge, "Click vào box để tiếp tục mở" |
| open succeeded and `remaining_unopened` = 0 | success, done | badge shown, no instruction, box disabled |
| open failed | previous phase kept | inline error, box retryable |

### State Machines

#### SM-001_SecretBoxModal
**kind:** ui
**Linked FR:** FR-004, FR-005, FR-006, FR-010
**States:** Idle, Opening, Success, Done, Error

| From | To | Guard | Side effect |
|------|----|-------|-------------|
| Idle | Opening | box clicked | RPC call, box inert |
| Success | Opening | box clicked and count above 0 | RPC call, box inert |
| Opening | Success | RPC ok and `remaining_unopened` above 0 | show badge, set count |
| Opening | Done | RPC ok and `remaining_unopened` = 0 | show badge, hide instruction, disable box |
| Opening | Error | RPC failed | keep last phase and count, inline error, box retryable (target phase TBD (draft)) |
| any | closed | X, Esc or backdrop | page state refresh (FR-007) |

### Algorithms

#### ALG-001_WeightedBadgeDraw
**Linked FR:** FR-012
**Steps:** one server-side `random()` draw in [0,100) against cumulative weights in this fixed order; weights sum to 100.

| Badge key (draft) | Display name | Weight |
|-------------------|--------------|--------|
| stay_gold | Stay Gold | 30 |
| flow_to_horizon | Flow to Horizon | 25 |
| beyond_the_boundary | Beyond the Boundary | 10 |
| root_further | Root Further | 5 |
| touch_of_light | Touch of Light | 20 |
| revival | Revival | 10 |

Key spelling and the mapping of keys to the 6 Profile slot positions are TBD (draft).

### External Integrations

None. Supabase Postgres only (table, function, owner-only RLS).

### Data and API

**Entry:** `KudosStatsBox` (`/kudos`) and `ProfileStats` (`/profile`) mount the same modal; each passes the current unopened count.

**RPC:** `public.open_secret_box()` returns one row `(badge text, remaining_unopened int)`. Called from the signed-in client path through a thin server action or the Supabase client under the user session (choice TBD (draft)); it must run under the caller's session so `auth.uid()` is set.

**Reads:** Profile self badges: `select distinct badge from secret_boxes where opened_at is not null and badge is not null` under owner-only RLS. Counters (opened, unopened) keep flowing from the existing stats helper.

**DB impact:**

| Event | Object | Operation | Source |
|-------|--------|-----------|--------|
| Migration | `secret_boxes.badge` | ADD COLUMN + check constraint | TBD (draft) |
| Migration | `open_secret_box()` | CREATE FUNCTION + grants | TBD (draft) |
| Box click | `secret_boxes` (one unopened row of caller) | UPDATE `opened_at`, `badge` (inside the definer function only) | TBD (draft) |
| Profile load (self) | `secret_boxes` | SELECT badge | TBD (draft) |

### Verification

- **SC-001** Entry: signed-in user with unopened above 0 opens the modal from `/kudos` and from own Profile; same content; at 0 the buttons are disabled and no modal opens; a guest click on `/kudos` goes to login (FR-001, FR-002; TC ACCESSING)
- **SC-002** IDLE layout and copy match the frame: title, instruction, centered box, label, yellow two-digit count, X (FR-003; TC GUI)
- **SC-003** Click the box: SUCCESS title, badge inside box, count decremented by 1, instruction "Click vào box để tiếp tục mở"; repeat until 0 then instruction hidden and box disabled (FR-004 to FR-006; TC FUNCTION)
- **SC-004** Each open returns exactly one badge; the stored `badge` is set and `opened_at` is set; unopened decreases by 1 server-side (FR-005, FR-008, FR-012)
- **SC-005** Distribution: over a large sample of opens the six badges converge to 30/25/10/5/20/10 percent within tolerance (ALG-001; automated DB-level check)
- **SC-006** Security: anon cannot execute the function; user B cannot open or alter user A's boxes; direct `update` on `secret_boxes` from the client is denied; tampered or replayed requests do not change the outcome (FR-014, FR-015; TC Security)
- **SC-007** Concurrency: parallel calls never exceed unopened and never claim one box twice (FR-016)
- **SC-008** No unopened box: controlled error, no state change, modal shows retryable error (FR-010, FR-013)
- **SC-009** Corrupt or unknown badge key renders the fallback image without a crash (FR-009)
- **SC-010** After opening, Profile self face shows the matching slot unlocked and counters updated; other face shows no badge data (FR-007, FR-017)

## User Stories

### US001_OpenMySecretBox — Open my gift boxes (Priority: P1)

**What happens:** A signed-in Sunner with unopened Secret Boxes clicks "Mở Secret Box", clicks the gift box in the modal, and discovers which badge they received, repeating until none are left.
**Why this priority:** It is the reward moment of the SAA Kudos loop and the only way the Secret Box counters change.
**Independent Test:** Sign in as a persona with unopened boxes, open the modal from the sidebar, open one box, verify badge, count minus 1 and DB row updated.
**Endpoints**: RPC `open_secret_box`, PAGE `/kudos`, PAGE `/profile`

**Acceptance Scenarios:**

1. **Given** unopened above 0, **When** the user clicks "Mở Secret Box" on `/kudos` or own Profile, **Then** the modal opens in the idle phase with the current count.
2. **Given** the idle modal, **When** the user clicks the box, **Then** the success phase shows one badge and the count decreases by 1.
3. **Given** the success phase with count above 0, **When** the user clicks the box again, **Then** another box opens and another badge shows.
4. **Given** the last box was opened, **When** the success phase renders, **Then** the instruction is hidden and the box is disabled.
5. **Given** the server call fails, **When** the box was clicked, **Then** the count is unchanged and an inline retryable error shows.

**Requirements fulfilled:**
- **FR-001** Both entries
- **FR-002** Entry guard
- **FR-003** Idle phase
- **FR-004** Single call per click
- **FR-005** Success phase
- **FR-006** Zero state
- **FR-007** Close and refresh
- **FR-008** Backend count
- **FR-009** Fallback badge
- **FR-010** Failure feedback
- **FR-018** Copy

**Rules enforced:** BR-002

**Verification:**
- **SC-001**, **SC-002**, **SC-003**, **SC-004**, **SC-008**, **SC-009**

---

### US002_TrustTheDraw — The draw is fair and tamper-proof (Priority: P1)

**What happens:** Every open is decided by the server with the published odds; a user cannot get a better badge, extra opens, or open someone else's boxes.
**Why this priority:** Rewards are prizes; client-side trust would let anyone mint the rarest badge.
**Independent Test:** Call the function as anon and as another user, replay and parallelize calls, check the badge distribution.
**Endpoints**: RPC `open_secret_box`

**Acceptance Scenarios:**

1. **Given** a guest, **When** the function is called, **Then** it is denied.
2. **Given** user A with 1 unopened box, **When** two calls run in parallel, **Then** exactly one succeeds.
3. **Given** a client that forges a badge or a profile id, **When** it calls the function, **Then** nothing changes and the draw is unaffected (no input accepted).
4. **Given** a large sample, **When** badges are tallied, **Then** shares match the weights.

**Requirements fulfilled:**
- **FR-011** Column
- **FR-012** Function
- **FR-013** No box error
- **FR-014** Grants
- **FR-015** Tamper-proof
- **FR-016** Concurrency

**Rules enforced:** BR-001, BR-002, BR-003

**Verification:**
- **SC-005**, **SC-006**, **SC-007**

---

### US003_SeeBadgesOnProfile — My badges unlock on my Profile (Priority: P2)

**What happens:** Each distinct badge I have opened lights up its slot in "Bộ sưu tập icon của tôi" on my Profile.
**Why this priority:** Closes the loop from reward to visible collection (clarified decision).
**Independent Test:** Open a box, open own Profile, verify the matching slot is unlocked and the other five stay locked.
**Endpoints**: PAGE `/profile`

**Acceptance Scenarios:**

1. **Given** an opened box with badge X, **When** the owner opens their Profile, **Then** slot X is unlocked.
2. **Given** two opened boxes with the same badge, **When** the Profile renders, **Then** that slot shows once.
3. **Given** another Sunner's Profile, **When** it renders, **Then** it carries no badge data (default).

**Requirements fulfilled:**
- **FR-017** Slots unlock from own boxes
- **FR-007** Refresh on close

**Rules enforced:** BR-004

**Verification:**
- **SC-010**

---

### Edge Cases

See edge-cases.md.

## Key Entities

| Entity | Table/View | Key Columns | Purpose |
|--------|------------|-------------|---------|
| Secret box | `secret_boxes` | id, profile_id, opened_at, badge (NEW) | one gift box; unopened when `opened_at` is null; `badge` set on open |
| Badge key set | check constraint on `secret_boxes.badge` | 6 keys | closed list of awardable badges |
| Open function (NEW) | `public.open_secret_box()` | returns badge, remaining_unopened | only write path for opening |
| Profile (read) | `viewer_profile` | id | caller profile derivation (existing) |
| Copy (NEW) | static `secret-box` copy module | vi, en keys | modal copy |

RLS and grant intent: `secret_boxes` keeps owner-only select for `authenticated` and gains NO write policy or grant; the definer function is the only writer. Function execute granted to `authenticated` only. See system draft `spec/system/permissions-secret-box.md`.

## Artifact References

| Artifact | File | Codes Used | Reviewed |
|----------|------|------------|----------|
| System Overview | [overview.md](../../../../docs/system/overview.md) | — | [ ] |
| Architecture | [architecture.md](../../../../docs/system/architecture.md) | TBD (draft) | [ ] |
| Feature List | [feature-list.md](../../../../docs/generated/feature-list.md) | TBD (draft) | [ ] |
| API Map | [api-map.md](../../../../docs/generated/api-map.md) | TBD (draft) | [ ] |
| Entities | [entities.md](../../../../docs/generated/entities.md) | TBD (draft) | [ ] |
| Screens | [screens.md](screens.md) | SCR### TBD (draft) | [ ] |
| Behavior Logic | [behavior-logic.md](../../../../docs/generated/behavior-logic.md) | TBD (draft) | [ ] |
| Permissions | [permissions.md](../../../../docs/system/permissions.md) | TBD (draft) | [ ] |
| Permissions Matrix | [permissions-matrix.md](../../../../docs/generated/permissions-matrix.md) | TBD (draft) | [ ] |
| User Stories | [user-stories.md](../../../../docs/generated/user-stories.md) | TBD (draft) | [ ] |

System-doc forward-draft: `plans/261028-1059-open-secret-box/spec/system/permissions-secret-box.md` (open function grants, `badge` column policy).

## Assumptions

- Sources: MoMorph J3-4YFIpMM frame 1466:7676 (spec rows incl. success state, 19 test cases) plus `clarifications.md` (3 decisions, authoritative).
- Success phase is specified in the spec rows, not drawn as a separate frame; it reuses the same modal.
- Existing `secret_boxes(id, profile_id, opened_at)` with owner-only select policy, and stats counters `secretBoxOpened` / `secretBoxUnopened` already flow to both stats boxes; they are reused unchanged.
- Kudos sidebar button keeps the existing signed-in gating (guest goes to login); only the dialog body changes from the "under construction" placeholder.
- Badge odds are fixed in the function body (no admin tuning, no config table; YAGNI).
- Presentational modal and its copy module already exist in the working tree (`src/components/secret-box/`); wiring, RPC, migration and Profile unlock are the plan's work.

## Source Code References

No source code exists yet for the migration, the function, the open action or the Profile unlock. Existing code the plan builds on, by name only: `src/components/kudos/kudos-stats-box.tsx`, `src/components/profile/profile-stats.tsx`, `src/components/profile/profile-badge-collection.tsx`, `src/lib/profile/profile-types.ts`, viewer stats helper in `src/lib/kudos/`, migrations under `supabase/migrations/` (precedent 20261021000002, 20261022000003), `supabase/seed.sql`.

## Unresolved Questions

Resolved in `clarifications.md`: entry from both `/kudos` and Profile; backend design (badge column plus definer RPC with server-side weighted draw); badge unlocks Profile slots.

Still open (draft): see the Gaps block returned with this draft (seed backfill of legacy opened boxes, other-face badge visibility, key-to-slot order, badge image assets and names, error copy, post-open refresh mechanism).

## Source Walkthrough

TBD (draft) — no source code written yet; read order for the plan: `supabase/migrations/20261021000001_kudos_schema.sql` (table), `20261021000002_kudos_rls_and_grants.sql` (owner-only select), then the two stats components, then `src/components/secret-box/`.

### Call Hierarchy

```text
TBD (draft): stats button -> SecretBoxModal -> open action -> rpc open_secret_box -> secret_boxes update
```

## DB Impact per Event

| Event/Endpoint | Table | Columns | Operation | Value Derivation | Source |
|-----------------|-------|---------|-----------|-------------------|--------|
| RPC `open_secret_box` | `secret_boxes` | opened_at, badge | UPDATE | `now()`; badge from ALG-001 weighted draw on one claimed unopened row of the caller | TBD (draft) |
