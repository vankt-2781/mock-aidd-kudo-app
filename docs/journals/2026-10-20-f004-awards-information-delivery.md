# F004 Awards Information delivery: a third stale task title, two real conflicts with shipped routes, and a clobbered plan row

**Date**: 2026-10-20 15:30
**Severity**: medium
**Component**: F004 Awards Information (SCR005, `/awards`, MoMorph screen for "Hệ thống giải"; branch `feature/awards-information`)
**Status**: ongoing

## What Happened

The task arrived titled "implement the login page" again, the third run in a row with that mismatch. The screenId pointed at Awards Information. We fetched the frame first, the screen named itself, and we built the awards screen. The fetch-before-acting habit from F003 paid off a third time.

Two tracks ran. Track A's UI agent built 7 components in about 4 minutes while clarifications were still running. Track B ran clarifications, then Phases 02 (award dictionary) and 03 (scroll-spy) in parallel against a props contract written into `plan.md`. Work landed as four commits pushed to `origin/feature/awards-information`: `133495f` feat, `7b3a0fe` test, `110ca96` docs, `74a6351` chore(plans).

Two test cases conflicted with the shipped app. The TC demanded auth-only access at `/he-thong-giai`. The F003 homepage already deep-links to `/awards`, and the e2e suite assumed public access. We resolved it with the user: the page is PUBLIC at `/awards`. Both deviations are recorded in the coverage map and changelog, pending PM sign-off.

## The Brutal Truth

The stale title is now a pattern, not an accident. Three runs in a row, the task text has named the wrong screen. Trusting it would have sent us building the wrong thing.

The galling part is the plan-file race. The Phase 02 agent ran a `sed` over `plan.md` and reset the Phase 03 row while the Phase 03 agent was also writing to that file. We only caught it because the orchestrator re-read the file to verify. Nothing in the process kept parallel agents off the shared file.

Copy conflicts between frame and CSV came back again: the Top Talent unit reads "Cá nhân" in the frame and "Đơn vị" in the CSV, and the caption casing differs. We followed the frame, as we did in F003. This is a precedent now, not a judgment call each time, and it still stings that the CSV is wrong so often.

## Technical Details

- Copy check: task title "implement the login page" vs. frame name for screenId of "Hệ thống giải".
- Route conflict: TC "auth-only at /he-thong-giai" vs. shipped `/awards` (public, F003 deep-link target).
- Copy conflicts: Top Talent unit `Cá nhân` (frame) vs `Đơn vị` (CSV); caption casing.
- Scroll-spy: pure `selectActiveSection` with `SPY_LINE_RATIO = 0.34` (upper-third line, later section wins). IntersectionObserver is trigger-only, since entries carry no positions. Click-lock released on `scrollend` with a 1 s fallback. Hash is written on click only.
- Focus a11y: section `h2` with `tabIndex={-1}` and `focus({ preventScroll: true })`.
- Post-inspection fix: the default Vietnamese `ariaLabel` was made a required prop. `tsc` immediately flagged the 2 test call-sites, which is the outcome we wanted.
- Gates: unit 186/186 (run twice), e2e 98/98 (run twice, 19 new), tsc/eslint/lint/build all 0. TC mapping 15/15, one manual (ID-14).
- Inspection SEALED 9/10, one Accept finding, fixed.

## What We Tried

- Reading the title as the source of truth. Rejected by the frame fetch.
- Scroll-spy as an IntersectionObserver-only design. Rejected in favour of a pure `selectActiveSection` function with IO as a trigger only, because IO entries carry no section positions to decide on.
- Having the doc-writer update status from the plan-directory draft. It reported F004/SCR005 frontmatter as still `draft`. It had read the plan copy, not the promoted docs copy. We checked before reacting, so no churn was made.
- Committing via git-manager. It needed 3 attempts: zsh word-splitting, then an alias clash. No partial commits were left behind.

## Root Cause Analysis

The stale title is an upstream data-entry problem: the task is created from a template, and nothing compares it to the screen. The TC conflicts are a spec-authoring gap. The TC assumed auth-only access, and the TCs were not reconciled with the public `/awards` route that F003 already links to. The plan-row clobber is a concurrency gap. We let two agents write the same shared file with no ownership rule.

## Lessons Learned

- Compare the task title to the fetched screen name before any work. Make it the first gate, every time.
- When TCs and shipped routes disagree, check the shipped routes and the other features' deep-links before accepting the TC.
- Parallel agents write only their own file or their own row. Plan-level status is the orchestrator's job. The orchestrator verifies after each parallel phase.
- Required props beat defaults for user-facing strings. The compiler then finds every call-site that forgot them.
- Doc-writer reports need verifying against the promoted file before anyone changes code or status.

## Next Steps

- PM sign-off on the two TC deviations (PUBLIC `/awards`), the EN copy, and the scroll-spy threshold wording. Owner: user. By: before the next design sync.
- ID-14 remains manual. Owner: user. By: before release.
- Re-baseline `/tkm:rebuild-spec`. The advisory is still outstanding, and three features have now drifted from baseline. Owner: next agent. By: before F005.
- Open a PR from `feature/awards-information` once PM confirms the deviations. Owner: user.

**Status:** ongoing. Code, tests, and docs are sealed and pushed. Two TC deviations, EN copy, the threshold wording, ID-14, and the re-baseline remain open.

**Summary:** F004 Awards Information is built, tested, and pushed as four commits on `feature/awards-information`. Gates are green: 186 unit, 98 e2e (19 new), 15/15 TCs mapped with one manual. The wrong task title was caught by the frame fetch. Two TC conflicts with shipped routes were resolved as deviations pending PM. The plan-row clobber was caught by verification, not by the process.
