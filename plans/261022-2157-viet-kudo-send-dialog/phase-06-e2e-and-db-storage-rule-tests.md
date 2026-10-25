# Phase 06 — E2E (browser) + DB / Storage rule tests

## Context Links
- [plan.md](plan.md) key decision "E2E cleanup" · technical-spec SC-001..016 · digest TC buckets (57 rows)
- PR #6 helpers (must be in main first): `e2e/helpers/kudos-db-admin.ts` (`serviceDb/anonDb/userDb`, `releaseTestUserRows`), `kudos-seed-constants.ts`, `kudos-fixtures.ts`, `kudos-board-ui.ts`; `e2e/fixtures.ts` (`testUser`, `signedInContext`)
- MoMorph refs: Viết Kudo https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 · Clarifications: plans/261022-2157-viet-kudo-send-dialog/clarifications.md

## Overview
Priority P1 · done (2026-10-23) · 4.5h · depends 02, 05 and PR #6 merged into main (then `git merge origin/main`). If PR #6 is still open: BLOCKED → ask the user (fallback: merge `fix/kudos-spotlight-and-e2e` into this branch with their consent). Shipped: 68 new e2e with write isolation + seed sanity; final run 181/181 ×2 + seed-sanity 7/7.

## Deviations
- **PR #6 still open at completion** → the full F006 45-e2e regression is deferred until PR #6 merges and main is re-merged into this branch.
- **3 Playwright projects instead of the planned 2** — write-isolation design landed as three projects (read-parallel, writes, seed-sanity) rather than chromium + kudos-writes.
- **3 app defects found by these tests → fixed:** (1) `send_kudos` image-URL origin anchor via `app_settings.storage_public_base`; (2) `next/image` storage hosts config + `dangerouslyAllowLocalIP` restricted to dev-only; (3) copy fixes.
- **Inspection rework cycle:** round 1 REWORK (Critical: anonymous-image identity leak via uid in storage paths + public `profiles.auth_user_id`) → identity-free registry paths (`kudos_image_uploads` + `reserve_kudos_image_path` RPC + definer-predicate storage policy), `profiles.auth_user_id` revoked (`viewer_profile` definer view); re-inspection SEALED (score 8, 0 critical).

## Key Insights
- PR #6 read specs assert exact seed state under `fullyParallel` (388 kudos, 8 hashtags, top-5, first feed cards). Any transient compose row would break them → writes isolated in a dependent project + per-test cleanup.
- Test users get a trigger profile; deleting it cascades their kudos (`sender_id on delete cascade`) — cleanup still deletes explicitly first (clear failures), then hashtags `ilike 'e2e\_%'`, then Storage objects under `<auth uid>/` via service-role `storage.from('kudos-images').remove(...)`.
- Image files generated as buffers in a helper (minimal valid JPEG/PNG bytes, fake PDF/TXT/MP4, 5 MiB + 1 byte PNG) → `setInputFiles({ name, mimeType, buffer })`; no binaries committed.
- TipTap works in real Chromium: formats asserted via `.ProseMirror strong|em|s|ol|a|blockquote`, mention via `span[data-type=mention]`. jsdom-only: none of the editor behaviors (documented); reducer/sanitizer edge cases stay unit.
- `send_kudos` forged calls are proven at API level with real JWTs (`userDb(token).rpc`) — Next server-action ids are not callable from tests; action-level parse is unit-proven (04).

## Requirements
- `playwright.config.ts`: `chromium` gets `testIgnore: /kudos-compose-writes-.*\.spec\.ts/`; add project `kudos-writes` (`testMatch` same pattern, `dependencies: ["chromium"]`, `fullyParallel: false`); README notes `--no-deps` for local single-file runs.
- Parallel (`chromium`) specs, no kudos rows created:
  - `kudos-compose-open-and-layout.spec.ts`: ID-0/1/2 (guest → `/login?next=%2Fkudos`, no modal), ID-3 order, ID-4/5/6 placeholders + checkbox default, FR-007 helper line, FR-030 link, vi/en copy (SC-015), Hủy/Esc discard + reopen empty, overlay no-op (ID-45, SC-008).
  - `kudos-compose-validation.spec.ts`: ID-7..11, 14, 25, 26, 48/49 (reinterpreted), 50..53, 56; special chars ID-9; trim ID-10; self not listed; typed-not-picked recipient → error; 6th hashtag "Tối đa 5 hashtag" (ID-17/53); typed create + dropdown add + chip remove (ID-34..36).
  - `kudos-compose-images.spec.ts`: ID-18..24, 37..40, 54/55 + oversize; asserts thumbs, add-button hide/return, error text, and Storage object count for the user folder; cleanup removes objects.
  - `kudos-compose-editor.spec.ts`: ID-12/13/33 mention suggest + pick; ID-27..32 each format on selection + toggle off; link dialog rejects `javascript:`; first Esc closes mention list only.
  - `kudos-images-storage-rules.spec.ts` (SC-014): anon upload denied; own folder jpg ok + public URL 200; foreign folder denied; `text/plain` denied; > 5 MiB denied.
- Serial (`kudos-writes`) specs, `afterEach` cleanup:
  - `kudos-compose-writes-submit.spec.ts`: ID-15 (1 tag), ID-46 full (title, 2 images, mention, formats) → loading → closed → first feed card shows unique marker + title line + images, toast; ID-47 no images; DB row: `content` sanitized, `content_text` matches, new tag created once (case-insensitive reuse on a second send); failure path via `page.route` abort of the action POST → modal open, values kept, error toast (FR-015).
  - `kudos-compose-writes-anonymous.spec.ts`: SC-012/016 — anon send with and without name → card alias / "Ẩn danh" + default avatar, no profile link; guest view same; anon/authenticated `kudos_feed`, `kudos_highlights` rows have null sender fields; `select sender_id from kudos` denied (anon + authenticated); PostgREST sender embed denied; sender's own heart disabled; sender public `kudos_sent` unchanged while own sidebar "Số Kudos bạn đã gửi" +1.
  - `kudos-compose-writes-db-rules.spec.ts` (SC-011): `send_kudos` as anon denied; self, 0/6 hashtags, 6 images, foreign-folder/external URL, blank text, anon name without flag → expected codes, no row; valid call → row; HTML stored as given (documents the direct-RPC bypass; board shows `content_text` only).
- Helpers (new): `e2e/helpers/kudos-compose-ui.ts` (open, pickRecipient, typeContent, addHashtag, attach), `kudos-compose-cleanup.ts`, `kudos-compose-test-files.ts`.

## Architecture
Two Playwright projects over the same dev server + DB; write project runs strictly after read project. Every write test owns a fresh `testUser`, unique `e2e_<rand>` hashtag and content marker → independent and locatable.

## Related Code Files
**FILE OWNERSHIP (exclusive):** `playwright.config.ts`, all `e2e/kudos-compose-*.spec.ts`, `e2e/kudos-images-storage-rules.spec.ts`, `e2e/helpers/kudos-compose-*.ts`. Read-only: PR #6 helpers (extend only by new files), `src/**`, migrations. If a spec exposes an app bug → report to lead, do not patch `src/`.

## Implementation Steps
1. Sync main (PR #6), `npx supabase db reset`, run full suite as baseline (105 + 45).
2. Config projects + helpers; write specs RED against the running app; fix only test code.
3. Run `npm run test:e2e` twice consecutively without reset → both green (cleanup proof); then `kudos-seed-sanity` alone green.

## Todo List
- [x] PR #6 in branch, baseline green (PR #6 NOT merged — F006 45-e2e regression deferred, see Deviations)
- [x] config + helpers
- [x] 5 parallel specs
- [x] 3 write specs (landed as 5 write specs incl. anonymous/images/db-rules splits)
- [x] double-run green (181/181 ×2 + seed-sanity 7/7)

## Success Criteria
All new e2e green; 150 prior green; second consecutive run green; DB after run: 388 kudos, 8 hashtags, zero objects in `kudos-images` from e2e users.

## Risk Assessment
| Risk | L | I | Mitigation |
|---|---|---|---|
| A failed read test skips `kudos-writes` (dependency) | M | M | documented; CI shows skipped; run `--project=kudos-writes --no-deps` to debug |
| Cleanup misses after crash | L | H | cleanup in `afterEach` + `try/finally`; seed-sanity fails loudly → `db reset` |
| Debounce/upload timing flakes | M | M | web-first assertions, no sleeps; wait on network response |

## Security Considerations
Service-role key only in Node test helpers (resolved at runtime, never in browser/app). Tests prove deny paths, not just happy paths.

## Next Steps
07 maps every SC/TC.
