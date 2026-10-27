---
title: "Profile (self + other face) — own_sent_kudos view, guard, profile data layer, page wiring, e2e"
description: "Back the Track A profile UI with a caller-scoped own_sent_kudos view, /profile guard, profile queries/action/dictionary, real-data page wiring for both faces, and e2e."
status: completed
priority: P1
effort: 15h
branch: feature/profile-self
tags: [profile, kudos, supabase, migrations, security-definer, server-actions, guard, i18n, e2e, momorph]
created: 2026-10-27
work_type: feature
spec: docs/features/F008_Profile/
system_docs: [plans/261027-1257-profile-self-implementation/spec/system/permissions.md]
---

# Profile (self + other face) — Plan

MoMorph: self https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/3FoIx6ALVb · other https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/w4WUvsJ9KI
Contract: [technical-spec.md](spec/profile/technical-spec.md) (FR-001..026, BR-001..005, SC-001..011) · [edge-cases.md](spec/profile/edge-cases.md) · Decisions: [clarifications.md](clarifications.md) (24, authoritative) · Digest: [research/momorph-profile-screen-digest.md](research/momorph-profile-screen-digest.md)

| Phase | File | Track | Depends | Effort | Status |
|-------|------|-------|---------|--------|--------|
| 00 | Track A UI (`src/components/profile/**`, 11 files, Figma mocks; page renders mocks) | A | — | done | completed |
| 01 | [phase-01-own-sent-kudos-view-migration.md](phase-01-own-sent-kudos-view-migration.md) | B | — | 1.5h | completed |
| 02 | [phase-02-guard-and-profile-data-layer.md](phase-02-guard-and-profile-data-layer.md) | B | — (01 contract) | 4h | completed |
| 03 | [phase-03-profile-page-integration.md](phase-03-profile-page-integration.md) | Integration | 01, 02 | 5h | completed |
| 04 | [phase-04-e2e-tempering.md](phase-04-e2e-tempering.md) | Gate | 03 | 4.5h | completed |

Sequencing: (01 ‖ 02, disjoint files; 02 mocks Supabase so it never needs the view live) → 03 → 04. Unit tests live in their phase (RED first); 04 owns e2e only.
Ownership: 01 `supabase/**` · 02 `src/lib/**` (auth, profile, kudos, i18n) · 03 `src/app/(site)/profile/**`, `src/components/{profile,kudos,kudos-compose}/**` · 04 `e2e/**`, `playwright.config.ts`.

## Data flow
`/profile?id&dir` → proxy `decideRouteRedirect` (guest → `/login?next=%2Fprofile`) → page re-check → `resolveProfileTarget(raw id, viewer)` → `self` | `other{id}` | `not-found` (`notFound()`, no query for bad shape). Self: `getProfileHeader(viewer.profileId)` + `getViewerStats` (ONE fetch → 5 counters + dropdown N/M; null → inline error + retry) + `getProfileFeedPage(self, dir)`. Other: `getProfileHeader(id)` (null → not-found) + received page; no counts. Scroll → sentinel → `getProfileKudosPage(profileId, direction, cursor)` → same query helper → `KudosFeedPage`. Received = `kudos_feed` `receiver_id = id` (masked) → `mapFeedRow`; Sent = `own_sent_kudos` (definer, `auth.uid()`-scoped) → `mapOwnSentRow`.

## Shared contracts (pinned; 01 and 02 code against these independently)
- **View (01):** `public.own_sent_kudos`, `security_invoker = false`, exactly the 19 `kudos_feed` columns in order/name/type: `id, created_at, content, images, sender_id, sender_display_name, sender_avatar_url, sender_department_code, sender_stars, receiver_id, receiver_display_name, receiver_avatar_url, receiver_department_code, receiver_stars, hashtag_names, like_count, title, is_anonymous, viewer_is_sender`. Sender fields REAL (never masked, no `anonymous_name`); `viewer_is_sender = true`; `where k.sender_id = (select p.id from profiles p where p.auth_user_id = auth.uid())`. `revoke all from anon, authenticated, public; grant select to authenticated`.
- **Action (02 → 03):** `getProfileKudosPage(profileId: string, direction: ProfileKudosDirection, cursor: string | null): Promise<KudosFeedPage>`; validate all first (uuid, enum, cursor decodes when non-null) → invalid = EMPTY; no session = EMPTY; `sent` and `profileId.toLowerCase() !== viewer.profileId` = EMPTY; query errors = EMPTY (board parity, logged).
- **Types (02):** `ProfileKudosDirection = "received" | "sent"` in `src/lib/profile/profile-types.ts` (03 re-points `ProfileDirection` to it). `KudosBoardPost.senderRevealedAnonymous: boolean` (true only from `mapOwnSentRow` when `is_anonymous`; `mapFeedRow` always false). `ProfileTarget = {kind:"self"} | {kind:"other", profileId} | {kind:"not-found"}`.
- **`?dir` (02 parse, 03 links):** `parseProfileDirection(raw, face)` → `"sent"` only when face self and raw === "sent"; else `"received"`. Links: `/profile?dir=sent` / `/profile` (self keeps `?id=` if present).
- **Copy (02 → 03):** `getProfileMessages(locale)`; `stats` and `heroLabels` are the kudos dictionary objects by identity.

## Key decisions
- Two-layer Sent scoping (BR-002): action refuses non-self AND view filters by `auth.uid()`. Other face never selects `kudos_sent/kudos_received/hearts_received` and renders no count (BR-001).
- Not-found is one output for every failure (BR-004); under cacheComponents streaming HTTP is 200 → tests assert text.
- Compose `initialRecipient` optional, default null — board/homepage unchanged, compose suites pass unmodified.
- Card links `/profile?id=` for non-anonymous sender + receiver; action bar + sidebar keep `/profile`.

## Auth-sensitive surfaces — inspection requires USER SIGN-OFF
1. `own_sent_kudos` SECURITY DEFINER view (bypasses `kudos.sender_id` column revoke on purpose) (01).
2. `getProfileKudosPage` authorization + `resolveProfileTarget` shape check (02); guard + allow-list change (02).

## Rollback
Per-phase git revert. 01: `drop view if exists public.own_sent_kudos;` (header block) + `db reset`. 02/03 revert restores mock page; 03 card-link change isolated to `kudos-card-env.ts` + `kudos-user-info.tsx`. 04 tests only.

## Done (observable)
tsc 0 · eslint 0 · vitest 642 baseline + new green (compose suites unchanged) · `next build` 0 · `db reset` then Playwright 227 baseline + new green TWICE on one reset · `grep -rn "MOCK_PROFILE_" src --include=*.tsx` only in tests/fixtures · SC-001..011 mapped in e2e/README.

## Completion record (clean-restart run)
- 00: Track A done — 11 presentational files, screenshot matched frame. 01: db reset ×2 exit 0, 19-column match gate 0 mismatches, isolation smoke (anonymous real-name vs masked). 02: 732 unit green at completion. 03: 761 unit green + live checks (guest 307 `next=%2Fprofile`, both faces, no sent count on other face, not-found text). 04: 37 new e2e, FULL suite 264/264 TWICE on one reset, zero flakes/red runs at the gate; `npx next build` succeeded afterwards.
- Inspection: reviewer SEALED 9/10, 0 critical. Deferred: permanent cross-caller DB test for the view (M1); `profileHref` empty-id fallback tightening (L1). M2 (forged-sent never reaches query layer) already covered by phase-02 unit tests.

## Deferred
Spam chip · badge unlock source/artwork · "Mở Secret Box" stays disabled · hero avatar bitmap stand-in · end-of-list message (board parity) · seed-sanity pins for …010001/…020001 · no-profile-row viewer lookup guard (product call) · `security_barrier` hardening · view query plan at volume · cross-caller DB test for view (M1) · `profileHref` empty-id fallback (L1).
