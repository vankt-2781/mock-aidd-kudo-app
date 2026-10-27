# Phase 04 — E2E tempering

## Context Links
- Contract: technical-spec SC-001..011; edge-cases.md (30-TC coverage); digest "Known test pitfalls"
- Existing: `playwright.config.ts` (projects chromium → kudos-writes → kudos-seed-sanity), `e2e/helpers/{kudos-fixtures,kudos-seed-constants,kudos-compose-cleanup}.ts`, `e2e/kudos-board-persona.spec.ts`, `e2e/kudos-compose-writes-anonymous.spec.ts`, `e2e/README.md`

## Overview
Priority P1 · Status completed · Gate · Depends: 03 (01 applied via `db reset`) · File ownership: `e2e/**`, `playwright.config.ts` ONLY (no src edits; defects go back to 02/03 owners).

## Key Insights / Test pitfalls (MUST follow)
- Infinite scroll: `window.scrollTo(0, scrollHeight)` does NOT fire the IntersectionObserver → `locator(sentinel).scrollIntoViewIfNeeded()` and wait for card count 10 → 20.
- Not-found under cacheComponents streaming returns HTTP 200 → assert "Không tìm thấy hồ sơ" + "Về trang chủ" TEXT, never status.
- Never assert bare "Đã gửi" (compose success toast contains it) → scope to the direction dropdown trigger/list by role/aria-label.
- Persona specs (claim `…010100` to the test user) race `kudos-board-persona` → put `profile-persona-*.spec.ts` in a SEPARATE serial project.
- Seed has no anonymous kudos → anonymous own-Sent proof only in a writes-project spec with service-role cleanup by id.
- Baseline: 642 unit / 227 e2e (incl. login-stale-session-loop).

## Requirements
1. `playwright.config.ts`: `PROFILE_PERSONA_SPECS = /profile-persona-.*\.spec\.ts/`; chromium `testIgnore` adds it; new project `profile-persona` (`testMatch`, `fullyParallel:false`, `workers:1`, `dependencies:["chromium"]`); `kudos-writes` depends on `profile-persona` too so writes still run after all reads; seed-sanity unchanged.
2. Read-only chromium specs:
   - `profile-guard-and-id-resolution.spec.ts`: guest `/profile` and `/profile?id=X` → `/login?next=%2Fprofile`; signed-in matrix: no id, `id=`, own id upper/lower → self (URL unchanged); unknown uuid, `banana`, `42`, truncated, SQLi, `%20`, `id=a&id=b` → not-found text + home link.
   - `profile-other-face.spec.ts` (viewer = test user, target `…010001`): hero name/department code, "Bộ sưu tập icon", write-bar copy with name; click → compose opens with recipient preselected → Hủy → modal closed, page unchanged; static "Đã nhận", no dropdown, no sent option, `?dir=sent` still received; anonymous received cards masked, no sender link; sparse profile `…020001` (placeholder avatar, no department line, no badge/stars, empty copy); payload leak scan: collect RSC/HTML/network bodies → no `@` email of target, no auth user id, no count strings of target.
   - Card link: board card sender/receiver `href="/profile?id=…"`; action bar + sidebar `href="/profile"`.
3. `profile-persona-self.spec.ts` (serial project, `personaContext`): 5 counters equal board sidebar (25/25/25); dropdown "Đã nhận (25)"/"Đã gửi (25)"; switch to sent → URL `dir=sent`, trigger label, page 1 = 10 cards; sentinel scroll → 20 → 25 then stops (no end message); switch back; "Mở Secret Box" disabled; heart refused on own Sent card; hashtag → `/kudos?hashtag=`; en locale substitution.
4. `kudos-compose-writes-profile-anonymous-sent.spec.ts` (kudos-writes project): user A opens other-face of B via write bar, sends ANONYMOUS kudos → A's `/profile?dir=sent` first card shows A's real name + "Ẩn danh" chip; B's received view shows alias, no link; third user C: `/profile?id=A` shows no such card in received/sent and no counts; `afterEach` service-role delete by kudos id (+hashtags) so seed-sanity stays 388.
5. Compose regression: existing `kudos-compose-*` specs untouched and green (board/homepage open empty).
6. `e2e/README.md`: SC-001..011 → spec mapping + new project note.

## Related Code Files
- Modify: `playwright.config.ts`, `e2e/README.md`, (helpers only if a new constant is needed: `e2e/helpers/kudos-seed-constants.ts`)
- Create: the 4 specs above

## Implementation Steps
1. Config project + ignore; `npx playwright test --list` shows the new project and unchanged counts for old ones.
2. Write specs one at a time; run `--project=chromium <file>` / `--project=profile-persona --no-deps`.
3. `npx supabase db reset` once → full `npx playwright test` → green; run full suite AGAIN without reset → green (cleanup proven).
4. Full `npx vitest run`, `npx tsc --noEmit`, `npx eslint .`, `npx next build`.

## Todo List
- [x] profile-persona project + writes dependency
- [x] guard + resolution 404 matrix spec
- [x] other-face spec (write bar cancel, sparse …020001, payload leak scan)
- [x] persona self spec (serial)
- [x] writes anonymous-sent spec with cleanup
- [x] README mapping; full suite ×2 on one reset; unit/tsc/lint/build

**Completed:** 37 new e2e; FULL suite 264/264 TWICE on one `db reset` — zero flakes and zero red runs at the gate. New `profile-persona` serial project added; anonymous-sent writes spec with service-role cleanup. `npx next build` succeeded afterwards. Reviewer inspection: SEALED 9/10, 0 critical.

## Success Criteria
Playwright 227 + new all green twice on one `db reset`; seed-sanity green after writes; unit ≥ 642 + new green; no flaky retries locally.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Persona claim race | H | M | separate serial project |
| Observer not firing | H | L | sentinel scrollIntoView |
| Writes leak into seed counts | M | H | cleanup by id in afterEach; seed-sanity last |
| Leak scan false positive (own email in header menu) | M | L | scan for TARGET's identifiers only |

## Rollback
Delete new specs + revert config; no product code changes.

## Next Steps
Reviewer inspection (auth-sensitive surfaces need user sign-off), docs reconcile (feature-list, permissions, changelog).
