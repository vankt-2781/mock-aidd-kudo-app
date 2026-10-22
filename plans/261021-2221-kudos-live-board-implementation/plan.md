---
title: "Sun* Kudos Live board (/kudos) — schema, data layer, like rules, return-to login, spotlight"
description: "Back the built Track A board with the first Supabase schema (RLS, like function, seed), typed queries/actions, allow-listed return-to login, i18n, interactive spotlight and e2e."
status: pending
priority: P1
effort: 21h
branch: feature/kudos-live-board
tags: [kudos, supabase, migrations, rls, server-actions, auth, return-to, i18n, spotlight, e2e, momorph]
created: 2026-10-21
work_type: feature
spec: docs/features/F006_KudosLiveBoard/
system_docs: [docs/system/architecture.md, docs/system/permissions.md]
---

# Kudos Live board — Plan

MoMorph: Sun* Kudos - Live board https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ
Contract: [technical-spec.md](spec/kudos-live-board/technical-spec.md) (FR-001..031, BR-001..007, DEC-001..003, SM-001..003, ALG-001..003, SC-001..015) ·
Decisions: [clarifications.md](clarifications.md) · Digest: [research/momorph-kudos-live-board-digest.md](research/momorph-kudos-live-board-digest.md)

| Phase | File | Track | Depends | Effort | Status |
|-------|------|-------|---------|--------|--------|
| 00 | Track A UI (22 presentational files, mock data) | A | — | done | completed |
| 01 | [phase-01-db-schema-rls-like-function-seed.md](phase-01-db-schema-rls-like-function-seed.md) | B | — | 3.5h | pending |
| 02 | [phase-02-kudos-data-access-layer.md](phase-02-kudos-data-access-layer.md) | B | 01 | 3h | pending |
| 03 | [phase-03-return-to-login-allow-list.md](phase-03-return-to-login-allow-list.md) | B | — | 2h | pending |
| 04 | [phase-04-kudos-i18n-dictionary.md](phase-04-kudos-i18n-dictionary.md) | B | — | 1h | pending |
| 05 | [phase-05-board-page-integration.md](phase-05-board-page-integration.md) | Integration | 02,03,04 | 4.5h | pending |
| 06 | [phase-06-spotlight-interactivity.md](phase-06-spotlight-interactivity.md) | Integration | 02,03,04 | 3h | pending |
| 07 | [phase-07-e2e-and-db-rule-tests.md](phase-07-e2e-and-db-rule-tests.md) | Gate | 01,05,06 | 2.5h | pending |
| 08 | [phase-08-verification-and-docs-reconcile.md](phase-08-verification-and-docs-reconcile.md) | Gate | 07 | 1.5h | pending |

Parallel: (01 ‖ 03 ‖ 04) → 02 → (05 ‖ 06, disjoint files; 06 lands its section signature first) → 07 → 08. Unit tests live in their phase (TDD); 07 owns e2e only.

## Data flow
`GET /kudos?hashtag=<name>&department=<code>` → page `<Suspense>` → `connection()` → `getRequestLocale` + `getKudosViewer()` (getClaims → profile id | null) →
parallel: filter options, highlight top-5 (filtered), feed page 1 (filtered, keyset 10), spotlight (unfiltered: total, receivers, latest 6 activity), gift list 10, viewer stats (signed-in only) →
mappers → Track A view types → components. Heart click → `KudosLikeStore` optimistic → `toggleKudosLike(kudosId, liked)` → verified session → RPC `set_kudos_like` (SECURITY DEFINER: auth, no self-like, special day Asia/Ho_Chi_Minh, idempotent) → `{liked, likeCount}` → store settles (all cards of that kudos). Scroll end → `loadMoreKudos(filters, cursor)` → append. Visitor gated click → `/login?next=/kudos` → login forwards `next` into OAuth `redirectTo` → `/auth/callback?next=` → `resolveReturnTo` (exact allow-list) → `/kudos` | `/todo`.

## Shared contracts
- DB read model (01 → 02): views `kudos_feed`, `profile_kudos_stats`, `kudos_spotlight_receivers` (all `security_invoker`); RPC `set_kudos_like(p_kudos_id uuid, p_liked boolean) returns jsonb {liked, like_count}`; errors `P0001` messages `unauthenticated|no_profile|forbidden|not_found`.
- `src/lib/auth/return-to.ts` (03 → 05): `RETURN_TO_ALLOW_LIST`, `resolveReturnTo(raw)`, `buildLoginHref(next)`; `KUDOS_LOGIN_HREF = "/login?next=%2Fkudos"`.
- `src/components/kudos/kudos-types.ts` (02 owns edits; 05 only removes `title`): `KudosPost` + `likedByViewer`, `viewerIsSender`; `KudosUser` + `stars`, `profileId`; `SpotlightData`.
- `src/lib/kudos/kudos-filter-params.ts` (02): `parseKudosFilters(searchParams, options)`, `buildKudosFilterHref(filters, patch)`.
- `getKudosMessages(locale): KudosMessages` (04) — prop-drilled like awards; no client context for copy.

## Key decisions
- **Seed strategy:** one deterministic `supabase/seed.sql` (fixed UUIDs/timestamps; 388 kudos, top-5 like counts 1000/980/960/940/920, persona with 25/25/25 stats + 25/25 boxes, `Pioneer` tag on exactly 12 kudos, one zero-kudos department, 12 gift events, 1 special day 2026-11-20). Dev + e2e both run on `npx supabase db reset` (wipes local auth users too → re-sign-in after reset).
- **E2E vs DB:** e2e never creates/deletes kudos (keeps 388 and top-5 stable under `fullyParallel`); like tests use distinct low-traffic target kudos and relative counts; persona/special-day tests run `serial` and restore state via service role. DB rules (RLS, RPC) proven by a Playwright API-level spec with real user JWTs — no pgTAP.
- **Empty states:** filter-to-empty (zero-kudos department) proves highlight/feed empty in e2e; spotlight-empty and gift-list-empty are jsdom component tests (no second DB — single dev server/DB, see F005 precedent).
- Likes write ONLY through the RPC (no insert/delete grants on `kudos_likes`) so `hearts_awarded` cannot be forged; idempotent desired-state RPC replaces "toggle" to converge under rapid clicks.
- Cross-card like sync via a client store, not `revalidatePath` (avoids re-running 6 queries and desyncing appended feed pages); FR-029 satisfied by authoritative server result + dynamic page on reload.

## Auth-sensitive surfaces — inspection requires USER SIGN-OFF
1. Return-to allow-list (03): callback redirect, proxy `/login?next=` for signed-in users, OAuth `redirectTo`, `config.toml` redirect URL glob.
2. Like server action + `set_kudos_like` SECURITY DEFINER function (01/02).
3. RLS policies, grants, `security_invoker` views, `handle_new_auth_user` trigger on `auth.users` (01).

## Rollback
Per-phase git revert. DB: migrations are additive (new tables/views/functions + one trigger on `auth.users`); down = `drop trigger on_auth_user_created_kudos_profile; drop schema objects` script noted in 01; local `db reset` after revert. Return-to off-switch: empty `RETURN_TO_ALLOW_LIST` → everything falls back to `/todo`.

## Done (observable)
tsc 0 · eslint 0 · vitest 312 prior + new green · `next build` 0 · Playwright 105 prior + new green after `db reset` · `grep -rn "kudos-mock-data\|KUDOS_COPY" src` empty · SC-001..015 each mapped in e2e/README to a passing test or recorded deviation.

## Open
EN copy PM review · Phòng ban filter matches RECEIVER department (default, confirm) · TC deviations 9e689933, 43b54c29, f183a3e4, ca8f60b3 · single gift list (frame over CSV) · title row removed from cards (spec: no title column).
