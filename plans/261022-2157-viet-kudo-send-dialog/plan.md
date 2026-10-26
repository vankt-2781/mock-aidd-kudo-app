---
title: "Viết Kudo send dialog — schema, masked views, send_kudos, Storage, TipTap editor, compose wiring, e2e"
description: "Back the built Track A compose modal with a new migration (title/content_text/anonymous, masked definer views, send_kudos, kudos-images bucket), TipTap editor, compose data layer, board wiring and e2e."
status: completed
priority: P1
effort: 23.5h
branch: feature/kudos-send-dialog
tags: [kudos, compose, supabase, migrations, storage, rls, server-actions, tiptap, sanitize, anonymous, e2e, momorph]
created: 2026-10-22
work_type: feature
spec: docs/features/F007_KudosSendDialog/
system_docs: [docs/system/architecture.md, docs/system/permissions.md]
---

# Viết Kudo send dialog — Plan

MoMorph: Viết Kudo https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 · Live board (card title line) https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
Contract: [technical-spec.md](spec/kudos-send-dialog/technical-spec.md) (FR-001..031, BR-001..007, DEC-001..002, ALG-001..003, INT-001..003, SC-001..016) · Decisions: [clarifications.md](clarifications.md) · Digest: [research/momorph-viet-kudo-digest.md](research/momorph-viet-kudo-digest.md)

| Phase | File | Track | Depends | Effort | Status |
|-------|------|-------|---------|--------|--------|
| 00 | Track A UI (`src/components/kudos-compose/**`, 15 files, mock data) | A | — | done | completed |
| 01 | [phase-01-branch-sync-deps-and-compose-dictionary.md](phase-01-branch-sync-deps-and-compose-dictionary.md) | B | — | 1h | completed |
| 02 | [phase-02-db-migration-masked-views-send-function-storage.md](phase-02-db-migration-masked-views-send-function-storage.md) | B | — | 4h | completed |
| 03 | [phase-03-tiptap-kudos-editor.md](phase-03-tiptap-kudos-editor.md) | B | 01 | 3h | completed |
| 04 | [phase-04-compose-data-layer-and-board-read-side.md](phase-04-compose-data-layer-and-board-read-side.md) | B | 01 (02 contract) | 5h | completed |
| 05 | [phase-05-compose-modal-integration.md](phase-05-compose-modal-integration.md) | Integration | 03, 04 | 4.5h | completed |
| 06 | [phase-06-e2e-and-db-storage-rule-tests.md](phase-06-e2e-and-db-storage-rule-tests.md) | Gate | 02, 05, PR #6 in main | 4.5h | completed |
| 07 | [phase-07-verification-and-docs-reconcile.md](phase-07-verification-and-docs-reconcile.md) | Gate | 06 | 1.5h | completed |

**Completed 2026-10-23.** Phases 01–06 executed + inspection rework (round 1 REWORK — critical anonymous-image identity leak via uid storage paths → identity-free registry paths; re-inspection SEALED, score 8, 0 critical). Phase 07 verification ran inline: `db reset` ×2, tsc 0, lint 0, vitest 634/634, build 0, Playwright 181/181 ×2 + seed-sanity 7/7; docs reconcile via doc-writer.
**Deferred condition:** PR #6 (`fix/kudos-spotlight-and-e2e`) still open → the full F006 45-e2e regression is deferred until PR #6 merges and main is re-merged into this branch. Also open: PM copy review list, `app_settings.storage_public_base` per-environment deploy note, deferred hardening (reserve race, send rate limit, orphan sweep).

Parallel: (01 ‖ 02) → (03 ‖ 04, disjoint files; 04 codes against the 02 contract below, mocks Supabase in unit tests) → 05 → 06 → 07. Unit tests live in their phase (RED first); 06 owns e2e only.

## Data flow
Pill (signed in) → `KudosComposeLauncher` → modal + `KudosEditor` (TipTap, HTML out) · recipient/`@` → `searchSunners(q)` (trim, ilike escaped, self excluded, ≤10) · hashtag options = board `getFilterOptions().hashtags` (no extra query) · image pick → client validate (jpg/png ≤5MB, ≤5) → browser Storage upload `kudos-images/<auth uid>/<uuid>.<ext>` → public URL thumb · Gửi → client validate (DEC-002) → `sendKudos(input)` → `getUser()` → `parseSendKudosInput` (ALG-001, URLs own-folder, limits) → `sanitizeKudosHtml` → `content_text` (ALG-002) → RPC `send_kudos` (definer, sender = `auth.uid()`, atomic) → `{status:"ok"}` → close, `router.refresh()`, toast. Board: `kudos_feed` (definer, masked) → `mapFeedRow` (title, `senderAnonymous`, `viewer_is_sender`) → cards; sidebar → `viewer_kudos_stats` (owner-only).

## Shared contracts
- **DB (02 → 04/06):** `kudos` + `title` (≤60, null), `content_text` (not null, ≤5000), `is_anonymous` (default false), `anonymous_name` (≤30, only if anonymous). Column grants on `kudos`: everything EXCEPT `sender_id` for anon/authenticated. `kudos_feed` keeps all 17 F006 columns in order (`content` now carries `content_text`; sender_* null when anonymous, `sender_display_name` = `anonymous_name`), appends `title, is_anonymous, viewer_is_sender`. `kudos_highlights` = same shape. `profile_kudos_stats` same columns, public `kudos_sent`/`hearts_received` exclude anonymous. New `viewer_kudos_stats` (authenticated, own row only, all kudos). RPC `send_kudos(p_receiver_id uuid, p_title text, p_content text, p_content_text text, p_hashtags text[], p_images text[], p_is_anonymous boolean, p_anonymous_name text) returns uuid`; errors `28000 unauthenticated`, `P0002 no_profile|receiver_not_found`, `42501 self_kudos`, `22023 invalid_argument:<field>`.
- **Actions (04 → 05):** `searchSunners(query): Promise<ComposeSunner[]>`; `sendKudos(input: SendKudosInput): Promise<SendKudosResult>` = `ok{kudosId} | unauthenticated | invalid{fields} | error`. Client: `validateKudosImageFile(file)`, `uploadKudosImage(file)`. Limits: `src/lib/kudos-compose/kudos-compose-limits.ts` (Track A `COMPOSE_MAX_*` re-export it).
- **Board types (04):** `KudosBoardPost.title: string | null`, `senderAnonymous: boolean`; `viewerIsSender` from `viewer_is_sender`.
- **Copy (01):** `KudosMessages.compose` (all modal copy, errors, toasts, link dialog) + `card.anonymousAlias` ("Ẩn danh").

## Key decisions
- **View compatibility:** drop + recreate `kudos_highlights → kudos_feed → profile_kudos_stats` in the new migration with identical leading columns (names, order, types); new columns only appended; `content` column re-sourced from `content_text` (= backfilled seed text, so PR #6 marker regex still matches). Views switch to definer (`security_invoker = false`) because `sender_id` is column-revoked; spotlight/total views stay invoker (no sender columns).
- **Sanitize boundary:** the server action sanitizes, but `send_kudos` is callable directly by an authenticated user via PostgREST → `kudos.content` is UNTRUSTED HTML at rest; any future HTML render must re-sanitize. Board renders `content_text` as React text (safe). DB enforces structure (auth, self, counts, lengths, own image folder).
- **E2E cleanup:** read-only/upload-only compose specs run in the existing parallel `chromium` project (no DB rows; Storage objects removed per test). Every spec that CREATES kudos lives in `e2e/kudos-compose-writes-*.spec.ts`, ignored by `chromium` and run by a second Playwright project `kudos-writes` with `dependencies: ["chromium"]`, serial, each test deleting its kudos + test-created hashtags (unique `e2e_<rand>` names) + Storage objects via service role in `afterEach` → seed invariants (388 kudos, 8 hashtags, top-5) never observed dirty.

## Auth-sensitive surfaces — inspection requires USER SIGN-OFF
1. Column-level revoke of `kudos.sender_id` + definer masked views + `viewer_kudos_stats` + `viewer_is_sender` (02).
2. `send_kudos` SECURITY DEFINER + `sendKudos` action (02/04), incl. the direct-RPC sanitize bypass above.
3. `kudos-images` bucket + `storage.objects` insert policy (02); client upload helper (04).

## Rollback
Per-phase git revert. DB: migrations additive except view recreation; header of each new migration carries a down script (drop policy/bucket when empty, drop `send_kudos`, `viewer_kudos_stats`, re-run F006 view block, re-grant `select on kudos`, drop columns/index). Local: revert + `npx supabase db reset`. Feature off-switch: action bar falls back to the placeholder dialog (one import).

## Done (observable)
tsc 0 · eslint 0 · vitest 483 prior + new green · `next build` 0 · Playwright 105 + 45 (PR #6) + new green after `db reset`, twice in a row (cleanup proven) · `grep -rn "MOCK_SUNNERS\|MOCK_HASHTAGS\|COMPOSE_COPY" src --include=*.tsx` empty outside tests · SC-001..016 mapped in e2e/README.

## Open
Public `hearts_received` also excludes anonymous (same side channel as BR-007 — confirm) · `send_kudos` direct-call sanitize bypass accepted (confirm) · existing tags with spaces ("IDOL GIỚI TRẺ") pickable though new tags are `[\p{L}\p{N}_]` only · Tiêu chuẩn cộng đồng = inert `#` link · PM copy list (spec Unresolved 2) · PR #6 merge timing.
