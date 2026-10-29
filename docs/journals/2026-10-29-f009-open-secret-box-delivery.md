# F009 Open Secret Box delivered through takumi, after the evidence gate blocked the verdict twice

**Date**: 2026-10-29 07:45
**Severity**: medium
**Component**: F009 Open Secret Box (`open_secret_box()` RPC, `src/lib/secret-box/`, `src/components/secret-box/`, `/kudos` sidebar and own profile; branch `feature/open-secret-box`, commit 2b64662, plus da6d1eb and cc49734)
**Status**: resolved

## What Happened

F009 shipped end-to-end through the takumi pipeline in commit 2b64662. The migration `20261028000001_secret_box_badge_and_open_function.sql` adds `secret_boxes.badge` with CHECK constraints and the `open_secret_box()` SECURITY DEFINER RPC. The RPC does a server-side weighted draw (stay_gold 30, flow_to_horizon 25, touch_of_light 20, beyond_the_boundary 10, revival 10, root_further 5) and claims one box atomically with `FOR UPDATE SKIP LOCKED`. The modal has idle and success phases and opens from two entries. Opened badges unlock the profile badge collection on the self face only, so the F008 other-face boundary holds.

The same session also shipped sunner profile search on the board action bar (da6d1eb) and redrew the compose toolbar icons from Figma with the guidelines link centred (cc49734).

## The Brutal Truth

The evidence gate cost us more time than the feature. The inspection verdict was rejected twice, and both rejections were about form, not substance. The code was already right. The paperwork was not, and it took a while to see that the gate was checking the shape of the file rather than the work behind it.

## Technical Details

- Gates: vitest 826/826 (run twice, exit 0), playwright 281/281 run twice on one `db reset`, 0 flaky. Review 9/10, 0 critical. Verdict SEALED in `plans/261028-1059-open-secret-box/evidence/inspection-verdict.json`.
- Blocked #1: extra and missing keys against the required schema.
- Blocked #2: `acceptanceCovered` entries must repeat the criterion text from `study-context.json` verbatim before the proof.
- Badge art: the web sibling frames carry no style data ("Frame metadata does not contain node style information"). Two images came from design-done iOS frames (media node plus `sips` crop). Four SVG fallbacks ship until the designer delivers the assets.
- `next/image` rejects SVG without `dangerouslyAllowSVG`. We set `unoptimized` per image in `profile-badge-collection.tsx` and left `next.config` alone.

## What We Tried

- Fixing the verdict keys by hand, one field at a time. The second block came from the verbatim-text rule, which the first pass did not show.
- Copying the F008 sealed verdict as a template. This cleared both blocks.
- Widening `next.config` for SVG. Rejected: a global switch to fix one component.

## Root Cause Analysis

The gate's schema and its text-matching rule were not in front of us when we wrote the verdict. We read the gate's output and fixed the reported symptom, and each fix surfaced the next rule. The verdict format was not treated as a contract to read before writing.

## Lessons Learned

- Before writing a verdict, read the gate's schema and its matching rules. Copy a sealed verdict from a prior feature as the starting template, not from memory.
- `acceptanceCovered` text must be copied from `study-context.json` character for character.
- Isolate e2e data: the box-opening tests create fresh service-role users that cascade-delete, and seed personas are never opened. A seed-sanity guard asserts zero leftover badges and test users. That contract is what made the double run pass.

## Next Steps

- Replace the four SVG fallback badges with designer assets. Owner: user with designer. By: before release.
- Deferred follow-ups, recorded in `plans/261028-1059-open-secret-box/plan.md`. Owner: next agent. By: next session.
  - Dedupe the `SecretBoxBadge` type.
  - Fix the `SecretBoxCopy` layering, where `lib/i18n` imports from components.
  - Map `no_profile` to `unauthenticated` explicitly in the action.
  - Stale count on quick modal reopen.
  - `aria-label` on the box button in the opened phase.

**Status:** resolved. Code, tests and evidence are pushed. The badge assets and the deferred minors remain open.

**Summary:** F009 is delivered and the evidence gate is SEALED at score 9. The two blocks were format errors in the verdict, now understood and recorded.
