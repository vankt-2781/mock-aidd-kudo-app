# Phase 07 — Verification gates + docs reconcile

## Context Links
- [plan.md](plan.md) "Done (observable)" · spec drafts `spec/kudos-send-dialog/**`, `spec/system/{architecture,permissions}.md` · `e2e/README.md` · `docs/system/*`, `docs/features/`, `docs/project-changelog.md`, `docs/development-roadmap.md`
- Precedent: `plans/261021-2221-kudos-live-board-implementation/phase-08-verification-and-docs-reconcile.md`

## Overview
Priority P1 · done (2026-10-23) · 1.5h · depends 06. Gate phase; no feature code. Verification ran inline with delivery rather than as a separate pass.

## Deviations
- **Verification ran inline** (not as a standalone phase): final gates `npx supabase db reset` ×2, `tsc` 0, lint 0, vitest 634/634, `next build` 0, Playwright 181/181 ×2 + seed-sanity 7/7.
- **Docs reconcile delegated**: `docs/features`, `docs/screens`, `docs/system`, `docs/generated` updated by doc-writer in parallel with this sync-back; roadmap + changelog updated by PM.
- **Gate scope**: full F006 45-e2e regression deferred (PR #6 open); 3 test-found defects fixed during 06 (send_kudos origin anchor, next/image storage hosts + dangerouslyAllowLocalIP dev-only, copy fixes) — see phase 06 Deviations.

## Key Insights
- Spec is a draft with "F### TBD"; promotion to `docs/features/F007_*` follows the F006 precedent (separate docs commit).
- Deviations must be listed once, in one place (spec Unresolved Questions) and referenced from e2e/README.

## Requirements
- Gates (record exit codes in `reports/`): `npx tsc --noEmit`, `npm run lint`, `npm test` (483 prior + new), `npm run build`, `npx supabase db reset` → `npm run test:e2e` (105 + 45 + new) run twice.
- `e2e/README.md`: new "Viết Kudo" section — run notes (two projects, `--no-deps`), TC ID-0..56 → spec/test or unit or MANUAL, SC-001..016 → evidence, deviations: Gửi never disabled (ID-48/49 reinterpreted), Danh hiệu optional despite asterisk, + Image hidden at 5, link dialog simplified, guidelines link inert, public `hearts_received` excludes anonymous, direct-RPC sanitize bypass accepted.
- Docs (via `doc-writer`): promote spec drafts to `docs/features/F007_KudosSendDialog/` + screen doc; update `docs/system/architecture.md` (Storage, sanitize pipeline, definer masked views) and `permissions.md` (sender column revoke, owner-only stats, storage rules, "kudos.content is untrusted HTML"); changelog + roadmap. `Docs impact: major`.
- `grep` checks from plan.md Done list.

## Architecture
N/A.

## Related Code Files
**FILE OWNERSHIP (exclusive):** `e2e/README.md`, `docs/**`, this plan's `plan.md` status + `reports/`. Modify only.

## Implementation Steps
1. Run gates; on red → back to the owning phase (no fixes here).
2. README TC/SC map + deviations.
3. Docs promotion + system docs; changelog/roadmap.
4. Plan status → completed; summary to lead with sign-off list (3 auth-sensitive surfaces).

## Todo List
- [x] gates green, exit codes recorded
- [x] README map + deviations
- [x] docs promoted, system docs updated (doc-writer, in flight this round)
- [x] plan status updated

## Success Criteria
Every SC-001..016 maps to a passing test or a recorded deviation; every TC ID-0..56 has a row; all gates 0.

## Risk Assessment
| Risk | L | I | Mitigation |
|---|---|---|---|
| Docs drift from code | M | M | doc-writer reads code before writing |
| PR #6 merged after this phase | L | M | 06 blocks on it; re-run e2e after any main merge |

## Security Considerations
Sign-off checklist for the user: column revoke + masked views, `send_kudos` + action, Storage bucket/policy. No secrets in docs/reports.

## Next Steps
PR via git-manager after sign-off.
