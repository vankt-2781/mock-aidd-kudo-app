# Phase 01 — DB: badge column + `open_secret_box()` RPC

## Context Links
- Spec: `spec/open-secret-box/technical-spec.md` (FR-011..FR-016, ALG-001, BR-001..003)
- Decisions: `clarifications.md` (badge column + definer RPC, weights hardcoded, legacy rows null, controlled error)
- Precedent: `supabase/migrations/20261021000003_kudos_views_and_functions.sql` (`set_kudos_like`: jsonb return, `search_path = ''`, errcodes, revoke/grant), `20261022000002_kudos_masked_views_and_column_grants.sql` (current `secret_boxes_owner_read` policy via `viewer_profile`)
- Table: `20261021000001_kudos_schema.sql` (`secret_boxes(id, profile_id, opened_at)`, FK `on delete cascade`)

## Overview
Priority P1 · Status complete · Outcome: migration `20261028000001_secret_box_badge_and_open_function.sql` + seed invariant landed; verified via docker psql including a 10k-draw distribution check.

## Key Insights
- Latest migration `20261027000001` → new file `20261028000001_secret_box_badge_and_open_function.sql`.
- Seed inserts boxes without `badge` → nullable column + CHECK keeps `db reset` green (persona 25/25, Sunner 1 three unopened).
- Definer function owned by postgres bypasses RLS; identity only from `auth.uid()` → `profiles.auth_user_id`.
- `FOR UPDATE SKIP LOCKED` on the claim gives FR-016 (min(N,M) successes) without advisory locks.

## Requirements
- FR-011: `alter table public.secret_boxes add column badge text` + `constraint secret_boxes_badge_key_check check (badge is null or badge in (6 keys))`. Optional coherence check `badge is null or opened_at is not null`.
- FR-012: `public.open_secret_box()` no args, `returns jsonb`, `language plpgsql security definer set search_path = ''`.
- FR-013: raise `unauthenticated` (28000) when `auth.uid()` null; `no_profile` (P0002); `no_unopened_box` (P0001) — no state change.
- FR-014: `revoke all on function ... from public, anon; grant execute ... to authenticated`. No table grant/policy change.
- FR-015: zero parameters → any extra PostgREST param is a "function not found" error.

## Architecture
```
v_uid := auth.uid() -> v_profile from public.profiles where auth_user_id = v_uid
select id into v_box from public.secret_boxes
  where profile_id = v_profile and opened_at is null
  order by id limit 1 for update skip locked;
if not found -> raise 'no_unopened_box'
v_roll := floor(random() * 100)::int        -- [0,100)
badge := case when v_roll < 30 then 'stay_gold'
              when v_roll < 55 then 'flow_to_horizon'
              when v_roll < 65 then 'beyond_the_boundary'
              when v_roll < 70 then 'root_further'
              when v_roll < 90 then 'touch_of_light'
              else 'revival' end
update public.secret_boxes set opened_at = now(), badge = v_badge where id = v_box;
return jsonb_build_object('badge', v_badge, 'remaining_unopened',
  (select count(*)::int from public.secret_boxes where profile_id = v_profile and opened_at is null));
```
Header comment: purpose, weights (change = new migration), ROLLBACK line (`drop function if exists public.open_secret_box(); alter table public.secret_boxes drop constraint if exists ...; alter table public.secret_boxes drop column if exists badge;`).

## Related Code Files
- Create: `supabase/migrations/20261028000001_secret_box_badge_and_open_function.sql`
- Modify: `supabase/seed.sql` — invariant block: add `if exists (select 1 from public.secret_boxes where badge is not null) then raise exception 'seed: secret box badges must start empty'; end if;`
- Delete: none

## Implementation Steps
1. Write migration (column, CHECK, function, revoke/grant) following `set_kudos_like` style.
2. Add the seed invariant line.
3. `npx supabase db reset` → must succeed (seed invariants run).
4. Smoke via psql as postgres inside a transaction: `set local role authenticated; select set_config('request.jwt.claims', '{"sub":"<persona-claimed uid>"}', true); select public.open_secret_box();` then `rollback`.
5. Verify `\df+ public.open_secret_box` ACL: authenticated only.

## Todo List
- [x] migration file with ROLLBACK header
- [x] CHECK constraint (6 keys, nullable)
- [x] function: auth, profile, SKIP LOCKED claim, weighted draw, update, jsonb return
- [x] revoke public/anon, grant authenticated
- [x] seed invariant (no badges at reset)
- [x] `db reset` green

## Success Criteria
- `db reset` green; persona 25/25 and Sunner 1 three unopened unchanged.
- anon `rpc('open_secret_box')` → permission denied; authenticated with boxes → `{badge, remaining_unopened}` and exactly one row flips.
- Direct client `update secret_boxes` still denied (no grant).

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| `random()` bias/off-by-one in cumulative bounds | L | M | bounds documented; manual distribution SQL in phase-04 README |
| Claim race opens same box twice | L | H | `FOR UPDATE SKIP LOCKED`; API-level concurrency e2e (phase-04) |
| CHECK breaks seed | L | H | column nullable; seed untouched except invariant |
| `search_path` hijack | L | H | `set search_path = ''`, fully qualified names |

## Security Considerations
Definer function is the only writer; no input; owner derived from session. Owner-only select policy unchanged, so `badge` readable only by owner.

## Next Steps
Phase 03 consumes it at runtime; phase 04 proves FR-013..016 at API level.
