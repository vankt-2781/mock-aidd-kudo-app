# Phase 01 — own_sent_kudos view migration

## Context Links
- Contract: plan.md "Shared contracts → View"; technical-spec FR-023, BR-002, BR-003, SC-006
- Precedent: `supabase/migrations/20261022000002_kudos_masked_views_and_column_grants.sql` (kudos_feed lines 97-129, grants line 141+, ROLLBACK header style)

## Overview
Priority P1 · Status completed · Track B · Depends: none · Runs in parallel with 02. File ownership: `supabase/migrations/**` ONLY.
Add a caller-scoped SECURITY DEFINER view that returns the caller's own sent kudos, anonymous included, with REAL sender fields, in the exact `kudos_feed` shape so the board cursor + mapper are reused.

## Key Insights
- `kudos.sender_id` is column-revoked for anon/authenticated (F007) → view must be definer (`security_invoker = false`), owner postgres.
- `kudos_feed` masks anonymous senders; `own_sent_kudos` must not — every row is the caller's own (BR-003).
- 19 columns must match `kudos_feed` exactly (name, order, type) — 02 types the rows as `KudosFeedRow`. Do NOT select `anonymous_name`.
- `auth.uid()` null (anon / service role w/o JWT) → subquery null → 0 rows; plus no grant to anon.

## Requirements
- New file `supabase/migrations/20261027000001_profile_own_sent_kudos_view.sql` (timestamp after 20261022000004).
- Columns: `id, created_at, content (k.content_text), images, sender_id (k.sender_id), sender_display_name (sp.display_name), sender_avatar_url, sender_department_code (sd.code), sender_stars (ss.stars), receiver_id, receiver_display_name, receiver_avatar_url, receiver_department_code, receiver_stars, hashtag_names (same subquery + '{}' coalesce), like_count (::int), title, is_anonymous, viewer_is_sender (true)`. Same joins as kudos_feed.
- `where k.sender_id = (select p.id from public.profiles p where p.auth_user_id = auth.uid())`.
- `alter view ... set (security_invoker = false)`; `revoke all on public.own_sent_kudos from public, anon, authenticated; grant select on public.own_sent_kudos to authenticated;`
- Header ROLLBACK comment: `-- ROLLBACK: drop view if exists public.own_sent_kudos;`
- No change to any existing view, table, function or seed.

## Architecture
`kudos k` ⋈ sender profile/department/stats ⋈ receiver profile/department/stats → filter by caller profile → 19 cols. PostgREST exposes it as `from("own_sent_kudos")`; 02 applies keyset `or()` + order + limit 11.

## Related Code Files
- Create: `supabase/migrations/20261027000001_profile_own_sent_kudos_view.sql`
- Read: migration 20261022000002 (kudos_feed body), `supabase/seed.sql` (persona 00000000-0000-4000-8000-000000010100)

## Implementation Steps
1. Copy kudos_feed select list; replace masked `case` expressions with real sender columns; `viewer_is_sender` → `true`.
2. Add caller WHERE, definer option, revoke/grant, ROLLBACK header.
3. `npx supabase db reset` twice → exit 0 both.
4. Column gate (docker psql): compare `information_schema.columns` (column_name, ordinal_position, data_type) of `kudos_feed` vs `own_sent_kudos` with `EXCEPT` in both directions → 0 rows each.
5. Isolation smoke via docker psql (`set local role authenticated; set local request.jwt.claims = '{"sub":"<uid>","role":"authenticated"}'` inside a transaction, rolled back):
   - claim persona to a test auth user; insert one anonymous kudos as persona (service role, in txn) → visible with real `sender_display_name`, `is_anonymous = true`, `viewer_is_sender = true`;
   - caller = another claimed profile → 0 persona rows (only own);
   - `set role anon` → `select` raises permission denied;
   - `insert/update/delete` on the view as authenticated → permission denied; `has_table_privilege('authenticated','public.own_sent_kudos','INSERT')` false.
   - ROLLBACK the txn (seed untouched).

## Todo List
- [x] Migration file with 19 mirrored columns, real sender fields, caller WHERE
- [x] definer + revoke/grant + ROLLBACK header
- [x] db reset ×2 exit 0
- [x] Column-match gate 0/0 mismatches
- [x] psql isolation smoke (own incl. anonymous real name; other caller 0; anon denied; no write privileges)

**Completed:** db reset ×2 exit 0 · 19-column match gate 0 mismatches both directions · isolation smoke passed incl. anonymous row showing real name to owner vs masked elsewhere. Reviewer deferred a permanent cross-caller DB test for the view (M1).

## Success Criteria
db reset ×2 exit 0 · column EXCEPT both directions 0 rows · smoke assertions all hold · `git diff --stat` touches only the new migration.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Column drift vs kudos_feed (type of like_count / hashtag_names) | M | H | information_schema EXCEPT gate incl. data_type |
| Definer view leaks other callers' rows | L | H | WHERE on auth.uid() + smoke with 2 callers + anon denied |
| Accidentally masking / unmasking wrong fields | L | M | smoke asserts real name on anonymous row |
| Seed dirtied by smoke | L | M | everything inside one rolled-back txn |

## Security Considerations
Intentional bypass of the `sender_id` column revoke, bounded to the caller's own rows. `security_barrier` hardening + query plan at volume deferred (reviewer-noted).

## Next Steps
03 integration and 04 e2e need it applied (`db reset`). 02 does not.
