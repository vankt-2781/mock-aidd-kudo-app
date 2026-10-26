# Phase 02 — DB migration: columns, masked views, send_kudos, kudos-images Storage

## Context Links
- [plan.md](plan.md) shared contract "DB" · technical-spec FR-017..025, FR-031, ALG-003, INT-001/003, Key Entities, DB Impact · [permissions.md draft](spec/system/permissions.md)
- Existing (NEVER edit): `supabase/migrations/20261021000001..3_*.sql`, `supabase/seed.sql` (8 hashtags, no case dupes — verified: Dedicated, Inspring, Teamwork, Creative, Supportive, Leadership, IDOL GIỚI TRẺ, Pioneer)
- Pattern to copy: `set_kudos_like` (definer, `search_path = ''`, `auth.uid()`, errcodes)

## Overview
Priority P1 · done (2026-10-23) · 4h · no deps (parallel with 01). AUTH-SENSITIVE → inspected (round 1 REWORK → re-inspection SEALED, score 8). Shipped: four migrations (columns+backfill, masked definer views + `sender_id` revoke, `send_kudos` + `app_settings` origin anchor, storage bucket); inspection rework added identity-free image registry paths (`kudos_image_uploads` + `reserve_kudos_image_path` RPC + definer-predicate storage policy), `profiles.auth_user_id` revoke (`viewer_profile` definer view), `send_kudos` caps.

## Key Insights
- Current views are `security_invoker`; after revoking `kudos.sender_id` from anon/authenticated they would fail → `kudos_feed`, `kudos_highlights`, `profile_kudos_stats` become definer views (owner postgres). `kudos_spotlight_receivers`, `kudos_total` reference no sender column → stay invoker (verify `count(*)` works under column grants; fallback: make `kudos_total` definer).
- Postgres cannot "revoke one column" from a table-level grant: `revoke select on kudos` then `grant select (<all but sender_id>)`. Side effect: PostgREST `select=*` on `kudos` now errors for anon/authenticated (app never does it; PR #6 helpers use service role).
- `kudos_highlights` is `select *` (star frozen at creation) → must be recreated. Drop order: highlights → feed → profile_kudos_stats; recreate reverse; re-grant select.
- `auth.uid()` reads the request GUC, so it works inside definer views → `viewer_is_sender`.
- PR #6 reads `kudos_feed.content` and matches `(#n)$` → keep `content` column, source it from `content_text` (backfilled = old content).
- Public `hearts_received` counts likes on kudos the person SENT → anonymous kudos would leak via it too; exclude anonymous there as well (open question in plan.md, safe default).

## Requirements
- `20261022000001_kudos_compose_columns_and_hashtag_index.sql`: add `title text null check (char_length(title) <= 60)`, `content_text text` → backfill `= content` → `set not null` + `check (char_length(content_text) <= 5000)`, `is_anonymous boolean not null default false`, `anonymous_name text null check (char_length <= 30)`, `check (anonymous_name is null or is_anonymous)`; preflight `do $$ ... raise exception if exists case-dupe in hashtags $$`; `create unique index hashtags_name_lower_key on hashtags (lower(name))`; `check (char_length(name) between 1 and 30)` on hashtags.
- `20261022000002_kudos_masked_views_and_column_grants.sql`: column grants; recreate 3 views (contract in plan.md: same leading columns/types, appended `title, is_anonymous, viewer_is_sender`; anonymous rows → `sender_id, sender_avatar_url, sender_department_code, sender_stars` null, `sender_display_name = anonymous_name`); public stats exclude anonymous from `kudos_sent` and `hearts_received`; new `viewer_kudos_stats` (definer, `where p.auth_user_id = auth.uid()`, all kudos; select to authenticated only).
- `20261022000003_kudos_send_function.sql`: `send_kudos(...)` per contract. Order: auth → profile → args non-null → receiver exists → not self → content_text trimmed non-empty ≤5000 → title/anon name trim+null-if-empty, lengths → anon name only if anonymous → hashtags: trim, strip `#`, distinct on lower, count 1..5, each ≤30 → images ≤5, each contains `/storage/v1/object/public/kudos-images/<auth.uid()>/` → insert kudos → `insert into hashtags(name) ... on conflict do nothing` → link by `lower(name)` → return id. `revoke all from public, anon; grant execute to authenticated`.
- `20261022000004_kudos_images_storage_bucket.sql`: `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('kudos-images','kudos-images', true, 5242880, '{image/jpeg,image/png}') on conflict (id) do nothing`; policy `kudos_images_insert_own_folder` on `storage.objects` for insert to authenticated with check `bucket_id = 'kudos-images' and (storage.foldername(name))[1] = (select auth.uid())::text`. No select/update/delete policies (public URL read needs none; no client delete — orphans accepted). Migration (not `config.toml`) = one source for local + hosted.
- Each file < 200 lines, header comment with ROLLBACK block.

## Architecture
Writes: only `send_kudos` (definer) + Storage insert policy. Reads: masked definer views (the only path to sender data), `kudos` column grants, owner-only `viewer_kudos_stats`. Seed untouched (all legacy rows non-anonymous, `title` null).

## Related Code Files
**FILE OWNERSHIP (exclusive):** `supabase/migrations/20261022000001_kudos_compose_columns_and_hashtag_index.sql`, `..._000002_kudos_masked_views_and_column_grants.sql`, `..._000003_kudos_send_function.sql`, `..._000004_kudos_images_storage_bucket.sql`. Create only. No app code, no seed, no `config.toml` edit.

## Implementation Steps
1. Write 000001; `npx supabase db reset`; psql: `content_text = content` for all 388, index exists.
2. Write 000002; psql as `anon`/`authenticated` (`set role` + `set request.jwt.claims`): `select sender_id from kudos` → 42501; `select * from kudos_feed limit 1` works; columns 1..17 identical to F006 (`\d+ kudos_feed` diff vs old); `select count(*) from kudos_total` works.
3. Write 000003; psql smoke as a claimed user: valid call returns uuid; self/6 tags/6 images/foreign folder/blank text/anon-name-without-flag each raise expected code; nothing persisted on failure.
4. Write 000004; reset; check bucket row and policy.
5. `npx supabase db reset` from scratch twice (idempotent seed) → 388 kudos, 8 hashtags; run existing vitest (no DB) + PR #6 `kudos-seed-sanity`/`kudos-like-db-rules` if available.

## Todo List
- [x] 000001 columns/backfill/index (+ dupe preflight)
- [x] 000002 grants + masked views + viewer_kudos_stats
- [x] 000003 send_kudos (+ app_settings origin anchor)
- [x] 000004 bucket + policy
- [x] psql proofs recorded in reports/

## Success Criteria
`db reset` clean; anon cannot read `kudos.sender_id` directly, via `select *`, or via PostgREST embed on the sender FK; view leading columns byte-identical; F006 seed counts unchanged; send_kudos error matrix as specified.

## Risk Assessment
| Risk | L | I | Mitigation |
|---|---|---|---|
| View shape drift breaks 45 F006 e2e | M | H | diff `\d+` old vs new; append-only columns; run PR #6 specs |
| Definer view leaks a column | M | H | explicit column list (no `k.*`); 06 API spec queries every view as anon |
| Supabase advisor flags definer views | H | L | intended; comment in migration + permissions doc |
| `storage.foldername` / policy shape differs by Storage version | L | M | verify upload in step 4 with a real JWT (06 also proves) |
| `count(*)` denied under column grants | L | M | fallback: `kudos_total` definer |

## Security Considerations
Sender id only via service role / DB owner. `send_kudos` re-derives sender; never trusts HTML (stored untrusted). `search_path = ''`, fully-qualified names. No insert/update/delete grants added to any table.

## Next Steps
04 consumes the contract; 06 proves it end to end.
