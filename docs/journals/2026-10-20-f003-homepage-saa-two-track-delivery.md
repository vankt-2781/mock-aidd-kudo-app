# F003 Homepage SAA two-track delivery: a stale task title, a sentinel we should have cleaned, and a frame that contradicted its spec

**Date**: 2026-10-20 14:02
**Severity**: medium
**Component**: F003 Homepage SAA (public homepage route group, SCR004, MoMorph screen `i87tDx10uM`)
**Status**: ongoing

## What Happened

The task arrived titled "implement the login page". The screenId attached to it, `i87tDx10uM`, was the Homepage SAA screen. We fetched the frame before acting and the screen data named itself as Homepage, so the login title was a stale copy-paste. Work went ahead on the homepage.

Two tracks ran at once. Track A (`momorph-ui-implementer`) built 14 components and 21 assets for a 46-spec screen in about 6.5 minutes. Track B ran 16 clarification decisions and wrote the spec. Phases 02/03/04 ran in parallel, then 05/06. Commits landed on `feature/homepage`: `5350b7b` feat, `4198a76` test, `0f7a25c` docs, `e484821` chore(plans). Nothing was pushed.

## The Brutal Truth

The stale title was harmless only because we checked. If we had trusted the task text, we would have built a login page onto a homepage screen id. That is the kind of error that passes review because every line of code is internally consistent.

The sentinel problem is ours. The F001-tests run left a promote sentinel behind because we skipped Step 6.b cleanup. The next session's Stage 0 gate then refused to proceed on it. We resolved it KEEP only because we knew first-hand that the promote had completed. A sentinel should not need a human memory to clear it, and the miss was ours.

The frame also contradicted the spec CSV on event info (date, venue, broadcast). `design_status` was still `in_progress`. We resolved it design-authoritative with the user, but the spec author had written the CSV values with confidence they had not earned.

## Technical Details

- Copy-check: task title "login page" vs. frame name Homepage SAA, screenId `i87tDx10uM`.
- Figma copy defects: footer `vè` (corrected, designer flagged). `Comming soon` used with the correct spelling `Coming soon`.
- Logo rendered at 52x48 in the frame; the spec said 64x60. Frame kept as authoritative.
- Award descriptions in the frame duplicated placeholder text.
- Event date in the frame is already past. Production shows `00s` in the countdown.
- E2E: 56 new tests (23 from F001 plus 56 = 79). The countdown is driven by `page.clock`, and it reads `data-target-date` from the DOM instead of a hardcoded env date. That makes it independent of the machine's date.
- Flake: scroll-into-viewport assertions raced the layout. Fixed by waiting for the awards heading first.
- Tailwind v4 hover lifts use the `translate` property. Asserting `transform` in the test found nothing.
- Gates: 164/164 unit (x2), 79/79 E2E (x3), tsc/eslint/lint/build exit 0. 62/62 MoMorph TCs mapped; the digest listed an ID-61 that does not exist in the raw CSV, which we confirmed by reading the CSV directly.
- Inspection SEALED 8/10. User signed off directly on the auth-sensitive `/admin` guard.

## What We Tried

- Reading the title as the source of truth. Rejected by the frame fetch.
- Clearing the stale sentinel by deleting it. Rejected: we kept it, on first-hand evidence that the promote had completed.
- Hardcoding the countdown target from env. Rejected: it made the E2E depend on the machine's clock.
- Asserting hover with `transform`. Rejected: Tailwind v4 uses `translate`, so the assertion passed for the wrong reason.

## Root Cause Analysis

The stale title came from task text that was not checked against the screen data. The sentinel came from skipping our own cleanup step, which is a process miss. The spec/frame conflict came from writing CSV event values before the design was final (`in_progress`).

The `/admin` reviewer finding is a real one. A redirect inside `<Suspense>` returns 200 with a client-side redirect, not a 307. The fallback renders null, so nothing leaks today. A broad try/catch around `connection()` was also flagged as against Next guidance.

## Lessons Learned

- Always let the fetched screen name itself. Compare it to the task title before any work starts.
- Clean up promote sentinels in the same session that creates them. Do not rely on the next session's gate to catch them.
- Do not write spec values from a frame still marked `in_progress`. Mark them provisional.
- Assert the property the design actually uses (`translate`), not the one you remember.
- Future `/admin` data must sit behind a per-request check. The Suspense redirect is not a security boundary.

## Next Steps

- Confirm the real event date with the PM. Owner: user. By: before any prod content sign-off.
- Decide the "Tiêu chuẩn chung" link target. Owner: user. By: next design sync.
- Supply EN copy and the widget menu items (TBD). Owner: user. By: before EN locale work.
- Re-baseline `/tkm:rebuild-spec` (advisory: 85+ files since the core baseline). Owner: next agent, by: before F004.
- Push `feature/homepage` after review of the four commits. Owner: user.

**Status:** ongoing. Code, tests, and docs are sealed locally. Event date, link target, EN copy, and re-baseline remain open.

**Summary:** F003 Homepage SAA is built and sealed locally across four commits. Gates are green: 164 unit, 79 E2E, and 62/62 TCs mapped. The stale task title and the stale sentinel were both caught. The event data is past-dated and awaits the PM.
