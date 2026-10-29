# Phase 04 — Temper: e2e, DB rules, isolation, README

## Context Links
- Spec: SC-001..SC-010; `edge-cases.md` TC coverage (19 TCs, MoMorph J3-4YFIpMM)
- Config: `playwright.config.ts` (`WRITE_SPECS`, projects chromium → profile-persona → kudos-writes → kudos-seed-sanity)
- Helpers: `e2e/helpers/test-user.ts` (`createTestUser` fires trigger profile; `deleteTestUser` → `releaseTestUserRows` deletes trigger profile ⇒ boxes cascade), `kudos-db-admin.ts` (`serviceDb`, `anonDb`, `userDb`, `profileIdsForAuthUser`), `kudos-fixtures.ts` (`personaContext`)
- Existing specs to update: `kudos-board-persona.spec.ts` SC-012 (asserts placeholder), `profile-page-persona-self.spec.ts` (asserts disabled button), `kudos-compose-seed-sanity.spec.ts` (final guard)

## Overview
Priority P1 · Status complete · Outcome: 3 secret-box e2e specs + `secret-box-db` helper + persona/seed-sanity edits + `WRITE_SPECS` + README landed; vitest 826/826, playwright 281/281 twice on one `db reset`, tsc/eslint/build clean.

## Key Insights
- Isolation: every box-OPENING test uses a fresh test user + service-role-inserted unopened boxes; cleanup is automatic (trigger profile delete cascades `secret_boxes`). Persona (25/25) and Sunner 1 (3 unopened) are never opened ⇒ suite runs twice on one `db reset`.
- Persona specs only open/close the modal (read-only) — never click the box.
- Run opening specs in `kudos-writes` (serial) by extending `WRITE_SPECS` to `/(kudos-compose-writes-|secret-box-writes-).*\.spec\.ts/` (project convention for DB writes).
- Distribution (SC-005) not e2e-asserted: documented manual SQL check.

## Requirements / Test matrix
| Level | What | Where |
|-------|------|-------|
| Unit | catalog, action, query (phase 02); opener, modal, entries, loader (phase 03) | vitest |
| API e2e | anon denied; extra param rejected; direct `update` denied; user B cannot touch A's boxes; 1 box + 2 parallel calls ⇒ 1 ok + 1 `no_unopened_box`; 0 boxes ⇒ controlled error, no change; row has `opened_at` + valid `badge` | `e2e/secret-box-writes-db-rules.spec.ts` |
| UI e2e | /kudos: 3 boxes ⇒ modal idle "03" → click ⇒ success title, badge img, "02", continue instruction → to "00", instruction hidden, box disabled → close ⇒ sidebar counters 3/0 updated | `e2e/secret-box-writes-open-flow.spec.ts` |
| UI e2e | /profile: open 1 box ⇒ close ⇒ matching slot unlocked (aria-label without "(chưa mở khóa)"), others locked; other face of that user (viewed by another test user) shows 6 locked + no badge keys in payload | same file |
| UI e2e | fresh user 0 boxes ⇒ both buttons disabled, no modal; guest /kudos click ⇒ login | `e2e/secret-box-writes-entry-gating.spec.ts` |
| UI e2e | persona: /kudos and /profile open modal with "25", Esc / X / backdrop close, no open | edits to persona specs |
| Final guard | persona 25/25; zero `secret_boxes` rows with non-null `badge`; zero boxes owned by `E2E Tester%` profiles | `kudos-compose-seed-sanity.spec.ts` |
| Manual | distribution: SQL in README (10k boxes on a temp profile in a rolled-back txn, tally vs 30/25/10/5/20/10 ±2pp) | `e2e/README.md` |

## Architecture
`e2e/helpers/secret-box-db.ts`: `insertUnopenedBoxes(profileId, n)` (service role), `boxesOf(profileId)`, `trashBadgeRows()` count for the guard. Specs resolve the trigger profile via `profileIdsForAuthUser(testUser.id)`.

## Related Code Files
- Create: `e2e/helpers/secret-box-db.ts`, `e2e/secret-box-writes-db-rules.spec.ts`, `e2e/secret-box-writes-open-flow.spec.ts`, `e2e/secret-box-writes-entry-gating.spec.ts`
- Modify: `playwright.config.ts` (regex only), `e2e/kudos-board-persona.spec.ts`, `e2e/profile-page-persona-self.spec.ts`, `e2e/kudos-compose-seed-sanity.spec.ts`, `e2e/README.md` (new F009 section: projects, TC map, isolation, manual distribution SQL)
- Delete: none

## Implementation Steps
1. Helper + DB-rules spec (fast feedback on phase 01).
2. Open-flow + gating specs; update persona specs.
3. Seed-sanity guard.
4. `npx supabase db reset` → `npx playwright test` → `npx playwright test` again (no reset). Both green.
5. Full `npm test`, lint, typecheck, build.
6. README F009 section + TC map (19 TCs → spec/test).

## Todo List
- [x] helper
- [x] db-rules spec (security + concurrency)
- [x] open-flow spec (/kudos + /profile + other face)
- [x] entry-gating spec (0 boxes, guest)
- [x] persona spec updates (read-only modal)
- [x] seed-sanity guard
- [x] WRITE_SPECS regex
- [x] two consecutive full runs green on one reset
- [x] README

## Success Criteria
- SC-001..SC-004, SC-006..SC-010 automated; SC-005 documented manual; full suite green twice after one reset; no persona/Sunner box state change.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Random badge makes UI assertion flaky | H | M | assert badge img present + name in catalog set; read actual key from DB row to check slot |
| Persona spec accidentally clicks box | L | H | seed-sanity guard fails the run; review |
| Orphan boxes if teardown crashes | L | M | cascade on profile delete; guard counts `E2E Tester%` boxes |
| Parallel-call test timing | M | L | `Promise.all` of two `userDb` rpc calls, assert counts not order |

## Security Considerations
Service-role key only via `getSupabaseLocalEnv()` at runtime; never logged. Tests prove no client write path.

## Next Steps
Phase 05 docs.
