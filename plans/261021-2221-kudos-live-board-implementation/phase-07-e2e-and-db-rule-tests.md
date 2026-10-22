# Phase 07 — E2E board specs + DB rule tests against local Supabase seed

## Context Links
- Spec: SC-001..015; TC buckets in [research digest](research/momorph-kudos-live-board-digest.md)
- Depends: 01 (seed), 05, 06
- Existing: `e2e/fixtures.ts` (`testUser`, `signedInContext`, `adminUser`), `e2e/helpers/test-user.ts`, `e2e/helpers/supabase-local-env.ts` (service-role key at runtime from `npx supabase status -o env`), `playwright.config.ts` (`fullyParallel`, post-launch env, single dev server)

## Overview
Priority P1 · Status pending · Effort 2.5h. Tester owns e2e files only; no implementation edits (report defects back).

## Key Insights
- **Precondition:** `npx supabase db reset` before the run (README). A seed-sanity test fails fast with a clear message if the DB is stale (388 total, top-5 ids, persona stats).
- **Determinism under `fullyParallel`:** no test creates or deletes kudos; like tests each own a distinct seeded like-target kudos (0 likes, never in top-5) and assert relative counts; persona + special-day tests are `test.describe.configure({ mode: "serial" })` in their own files and restore state.
- **Persona claim** (stats, self-like): service role deletes the trigger-created profile of the fresh `testUser`, sets `profiles.auth_user_id = testUser.id` on `E2E Persona`; FK `on delete set null` releases it on fixture teardown; extra `afterEach` release for safety.
- **DB rules without pgTAP:** API-level Playwright spec (no browser page) calling `rpc("set_kudos_like")` and direct table writes through supabase-js with the test user's JWT / anon key → proves RLS + RPC against the real DB.
- **Special day "today":** compute `Asia/Ho_Chi_Minh` date in Node (`Intl.DateTimeFormat("en-CA", {timeZone})`); serial group: ensure absent → like → `hearts_awarded = 1`; insert today → like other target → `2`; unlike → sender hearts drop by exactly 2; restore original row state. Other parallel like tests never assert `hearts_awarded`.
- **Empty states:** `?department=CEVC99` proves highlight + feed empty copy in e2e; spotlight-empty and gift-list-empty stay jsdom-only (05/06) — justified: one dev server + one DB, emptying shared tables would break parallel specs (F005 precedent).
- Return-to after Google is not end-to-end automatable (Google stubbed): e2e asserts the authorize `redirect_to` carries `next=%2Fkudos`, and `/auth/callback?code=bad&next=/kudos` → `/login?error=oauth`; signed-in `/login?next=/kudos` → `/kudos`; signed-in `/login?next=https://evil.com` → `/todo`. Real code exchange with next = MANUAL (08).

## Requirements — spec files
| File | Covers |
|---|---|
| `e2e/kudos-seed-sanity.spec.ts` | DB matches `kudos-seed-constants.ts` |
| `e2e/kudos-board-public-render.spec.ts` | SC-001, SC-014 (vi exact copy, en draft via cookie), seeded highlight top card (like count 1.000), total "388 KUDOS", gift list 10 rows, stats hidden, FR-008/009 card fields, title row absent |
| `e2e/kudos-board-filters-and-carousel.spec.ts` | SC-006, SC-007: hashtag + department dropdown, "Tất cả" clear, tag click on card, carousel 1/5, prev disabled at 1, next disabled at 5, reset to 1 on filter change, `CEVC99` → empty copy both sections |
| `e2e/kudos-board-feed-infinite-scroll.spec.ts` | SC-008: 10 cards → scroll → 20; `?hashtag=Pioneer` → 10 → 12 then no more requests (count `loadMoreKudos` POSTs); thumbnail opens full-size (popup URL) |
| `e2e/kudos-board-guest-gating.spec.ts` | SC-002: heart, compose pill, Mở Secret Box, avatar, Xem chi tiết, spotlight node, gift row → `/login?next=%2Fkudos`; no like row written (service-role count) |
| `e2e/kudos-board-like-toggle.spec.ts` | SC-003: signed-in like → red + count+1 (both card instances if in both), DB row; unlike → gray, row gone; persists after reload |
| `e2e/kudos-board-persona.spec.ts` (serial) | SC-004 UI half (sender heart disabled), SC-011 (stats 25/25/25/25/25), SC-012 (Mở Secret Box + compose open placeholder dialogs) |
| `e2e/kudos-like-db-rules.spec.ts` (serial) | SC-004 forged self-like rejected, double like → one row, SC-005 special-day 2 + exact revoke, SC-013: anon read ok / anon write denied / authenticated direct insert into `kudos_likes` denied / anon RPC denied / `secret_boxes` invisible to non-owner |
| `e2e/kudos-board-spotlight-and-copy-link.spec.ts` | SC-009 (seeded name visible, hover tooltip, search highlight, 101st char rejected, empty no-op, pan/zoom toggle changes `viewBox`/`aria-pressed`, signed-in node click → `/kudos/<id>` stub), SC-010 (clipboard permission granted context → toast exact copy + clipboard value `http://localhost:3000/kudos/<id>`) |
| `e2e/kudos-login-return-to.spec.ts` | SC-015 (see Key Insights) |

Helpers: `e2e/helpers/kudos-seed-constants.ts` (mirrors seed ids/counts), `e2e/helpers/kudos-db-admin.ts` (service-role client: claim/release persona, special-day set/restore, count likes, cleanup likes by profile), `e2e/helpers/kudos-fixtures.ts` (extends `test` from `fixtures.ts` with `personaContext`; teardown deletes the test user's likes + orphan profile). `e2e/fixtures.ts` unchanged.

## Related Code Files (ownership)
- Create: the 10 spec files + 3 helpers above. Modify: none (README in 08).

## Implementation Steps
1. `db reset`; write constants + admin helper + fixtures; seed-sanity spec green.
2. Write specs in table order; run each file alone, then `npx playwright test e2e/kudos-*.spec.ts`.
3. Full run `npm run test:e2e` → 105 prior + new green; run twice back-to-back without reset to prove state restoration (no drift).
4. Report defects to lead with failing test + repro; do not edit `src/**`.

## Todo List
- [ ] helpers + seed sanity
- [ ] public render, filters/carousel, feed, gating
- [ ] like toggle, persona (serial), DB rules (serial)
- [ ] spotlight + copy link, return-to
- [ ] full suite twice green

## Success Criteria
All SC-001..015 mapped to a passing test or a recorded MANUAL/jsdom justification; full suite green twice in a row on one `db reset`.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Parallel like tests collide on a kudos | M | M | one like-target kudos per spec; relative counts |
| Persona claim leaks after crash | L | M | `on delete set null` + explicit release; seed-sanity checks `auth_user_id is null` at start |
| Special-day test near midnight +07 | L | L | compute date once per test; retry once in CI |
| Clipboard permission flaky in headless | M | L | `context.grantPermissions(["clipboard-read","clipboard-write"])` |
| Dev compile latency on first hit | M | L | existing 15 s expect timeout |

## Security Considerations
Service-role key read at runtime only, never written to files or logs; specs never print JWTs.

## Next Steps
08 gates + README TC map.
