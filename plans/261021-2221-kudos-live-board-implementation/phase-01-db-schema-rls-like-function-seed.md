# Phase 01 — DB schema, RLS, like function, views, deterministic seed

## Context Links
- Spec: [technical-spec.md](spec/kudos-live-board/technical-spec.md) — FR-016/017/027, BR-001/002/003/006/007, ALG-002/003, Key Entities + RLS intent, SC-004/005/013
- Edge cases: [edge-cases.md](spec/kudos-live-board/edge-cases.md) (day boundary, removed special day, no-profile user, double like)
- Existing: `supabase/config.toml` (`[db.seed] sql_paths = ["./seed.sql"]` already enabled), no `supabase/migrations/` yet
- Mock values to mirror: `src/components/kudos/kudos-mock-data.ts`, `src/components/kudos/spotlight-words.ts` (names)

## Overview
Priority P1 · Status pending · Effort 3.5h · Parallel with 03, 04. First real schema in the app.

## Key Insights
- Views default to owner rights and BYPASS RLS → every view MUST be `with (security_invoker = true)`; `secret_boxes` never joined into a public view.
- `hearts_awarded` must be server-decided → no client insert/delete on `kudos_likes`; only `set_kudos_like` (SECURITY DEFINER, `set search_path = ''`, fully-qualified names).
- Idempotent desired-state RPC (`p_liked`) instead of blind toggle: double click / two tabs converge; `on conflict (user_id, kudos_id) do nothing` covers the insert race.
- Trigger on `auth.users` runs inside every sign-up (incl. every e2e `createTestUser`) → it must never fail the sign-up: `on conflict do nothing` + `exception when others then return new`.
- `profiles.auth_user_id` FK `on delete set null` (not cascade): test-user teardown releases a claimed seed persona instead of deleting seeded history.
- Existing local auth users predate the trigger → migration backfills profiles.

## Requirements
- Tables (uuid PK `gen_random_uuid()`, `created_at timestamptz default now()` where relevant):
  `departments(id, code unique, name)`, `profiles(id, auth_user_id uuid unique null → auth.users on delete set null, display_name, avatar_url null, department_id null → departments)`,
  `hashtags(id, name unique)`, `kudos(id, sender_id, receiver_id → profiles on delete cascade, content text not null, images text[] default '{}', created_at; check sender_id <> receiver_id)`,
  `kudos_hashtags(kudos_id, hashtag_id, pk both)`, `kudos_likes(id, kudos_id → kudos cascade, user_id → profiles cascade, hearts_awarded smallint check in (1,2), created_at, unique(user_id, kudos_id))`,
  `special_days(day date pk, multiplier smallint default 2 check = 2)`, `gift_events(id, profile_id, description, created_at)`, `secret_boxes(id, profile_id, opened_at null)`.
- Indexes: `kudos(created_at desc, id desc)`, `kudos(receiver_id)`, `kudos(sender_id)`, `kudos_likes(kudos_id)`, `kudos_hashtags(hashtag_id)`, `gift_events(created_at desc)`.
- RLS enabled on all 9 tables. `select` to `anon, authenticated` on all except `secret_boxes` (policy: `profile_id in (select id from public.profiles where auth_user_id = auth.uid())`). No insert/update/delete grants or policies for `anon/authenticated` anywhere (revoke explicitly on `kudos_likes`).
- Views (security_invoker): `profile_kudos_stats(profile_id, kudos_received, kudos_sent, hearts_received, stars)` — stars per BR-007 (≥50→3, ≥20→2, ≥10→1, else 0); hearts = sum(hearts_awarded) over likes on kudos the profile SENT.
  `kudos_feed(id, created_at, content, images, sender_* , receiver_* {id, display_name, avatar_url, department_code, stars}, hashtag_names text[], like_count int)`.
  `kudos_spotlight_receivers(receiver_id, display_name, kudos_count, latest_kudos_id, latest_received_at)`.
- Function `public.set_kudos_like(p_kudos_id uuid, p_liked boolean) returns jsonb` — grant execute to `authenticated` only, revoke from `public, anon`:
  1. `auth.uid()` null → raise `'unauthenticated'`; profile for uid missing → `'no_profile'`; kudos missing → `'not_found'`; sender = profile → `'forbidden'`.
  2. `p_liked` true → insert with `hearts_awarded = case when exists(special_days where day = (now() at time zone 'Asia/Ho_Chi_Minh')::date) then 2 else 1 end` on conflict do nothing; false → delete own row.
  3. return `{liked: exists(own row), like_count: count(*) for kudos}`.
- Function `public.handle_new_auth_user()` + trigger `on_auth_user_created_kudos_profile after insert on auth.users`: display_name = `raw_user_meta_data->>'full_name'` ?? `'name'` ?? email local part; avatar_url = `'avatar_url'`.

## Architecture
Migrations (timestamp order): `20261021000001_kudos_schema.sql` (tables, indexes, FKs) → `20261021000002_kudos_rls_and_grants.sql` → `20261021000003_kudos_views_and_functions.sql` (views, RPC, trigger + backfill).
Seed `supabase/seed.sql` (runs after migrations on `db reset`; superuser → bypasses RLS). IDs: `('00000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid` with per-table prefix ranges (dept 1xx, profile 1xxxx, kudos 2xxxx…) documented in a header comment; e2e mirrors them in `e2e/helpers/kudos-seed-constants.ts` (07).

Seed invariants (assert with the verification SQL at the end of `seed.sql` as `do $$ … raise exception …` checks):
| Invariant | Value |
|---|---|
| total kudos | 388; newest `created_at` = `2025-10-30 10:00+07` (matches "10:00 - 10/30/2025"), then fixed steps back |
| named Sunners | ~60 (names from spotlight-words + mock: Huỳnh Dương Xuân, Huỳnh Dương Xuân Nhật, Nguyễn Bá Chức, Đỗ hoàng Hiệp …), departments round-robin incl. `CEVC10` |
| liker pool | 1000 profiles `Sunner Liker ####`, no department, never sender/receiver |
| top-5 by likes | 5 fixed kudos with 1000/980/960/940/920 likes; all others ≤ 20 likes |
| persona `E2E Persona` | received 25, sent 25, hearts 25 (each sent kudos liked once), secret boxes 25 opened / 25 unopened, auth_user_id null |
| like-target kudos | 4 fixed kudos with 0 likes, sender ≠ persona, reserved for e2e like tests |
| `Pioneer` hashtag | on exactly 12 kudos (feed: page 10 + 2 then end) |
| `CEVC99` department | exists, has zero profiles → filter-to-empty |
| hashtags | Dedicated, Inspring (design spelling), Teamwork, Creative, Supportive, Leadership, IDOL GIỚI TRẺ, Pioneer (stored without `#`) |
| gift_events | 12 rows, "Nhận được 1 áo phông SAA" etc. (list shows newest 10) |
| special_days | one row `2026-11-20` (demo; e2e manages "today" itself) |
| images | `/images/kudos/sample-image.png` × 0..5 deterministic per kudos |

## Related Code Files (ownership)
- Create: `supabase/migrations/20261021000001_kudos_schema.sql`, `supabase/migrations/20261021000002_kudos_rls_and_grants.sql`, `supabase/migrations/20261021000003_kudos_views_and_functions.sql`, `supabase/seed.sql`
- Modify: none (`config.toml` belongs to 03)

## Implementation Steps
1. Write schema migration; `npx supabase db reset` → applies cleanly.
2. RLS + grants migration; revoke `insert, update, delete` on all kudos tables from `anon, authenticated`.
3. Views (security_invoker) + RPC + trigger + backfill `insert into profiles(auth_user_id, display_name) select id, … from auth.users on conflict do nothing`.
4. Seed with `generate_series`; end with invariant `do $$` block.
5. Smoke via `psql "$(npx supabase status -o env | …DB_URL)"` (never read `.env.local`): `set role anon; select count(*) from kudos_feed;` ok; `insert into kudos_likes …` → permission denied; `select * from secret_boxes` → 0 rows; `select set_kudos_like(...)` as anon → permission denied.
6. Confirm existing e2e auth flow unaffected: `npx playwright test e2e/authenticated.spec.ts` (trigger runs on user create).

## Todo List
- [ ] schema migration
- [ ] RLS + grants migration
- [ ] views + RPC + trigger + backfill
- [ ] seed.sql + invariant checks
- [ ] psql smoke as anon/authenticated
- [ ] authenticated.spec.ts still green

## Success Criteria
- `npx supabase db reset` exit 0, invariant block passes; anon can read all board views, cannot write anything, sees no `secret_boxes`.
- RPC rules hold under psql role simulation (`set local request.jwt.claims`): no self-like, idempotent, 2 hearts on special day, exact revoke.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Trigger error breaks every sign-up / e2e user create | M | High | exception-swallowing trigger; step 6 check |
| View leaks via owner rights | M | High | `security_invoker = true` on all views; smoke as anon |
| `like_count` aggregate over all kudos for top-5 slow at scale | L | M | fine at 388; index on `kudos_likes(kudos_id)`; note materialized counter later |
| Seed drift vs e2e constants | M | M | invariant block + e2e seed-sanity test (07) |

## Security Considerations
SECURITY DEFINER with `search_path = ''`; identity only from `auth.uid()`; no service-role key in app runtime; seed users have no auth accounts. Rollback script (comment in migration 3): drop trigger, functions, views, tables in reverse order. **User sign-off required** on RLS/grants/RPC/trigger.

## Next Steps
Unblocks 02 (read model + RPC contract) and 07 (seed constants).
