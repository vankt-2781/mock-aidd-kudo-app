# F007 Viết Kudo send dialog: a leak the tester missed, caught by the reviewer, and a `profiles` column that was public all along

**Date**: 2026-10-26 06:38
**Severity**: high
**Component**: F007 Viết Kudo send dialog (`/kudos` compose modal, `send_kudos` RPC, `kudos-images` Storage bucket, masked `kudos_feed` views; branch `feature/kudos-send-dialog`, commits 9adac29..dcb1a8f)
**Status**: ongoing

## What Happened

Track A built the compose modal presentationally while Track B clarified the spec on the main thread. Clarification ran 14 user-answered questions plus the orchestrator defaults recorded under it. The frame showed a required "Danh hiệu" field that the spec CSV never listed. We resolved it as optional and re-added `kudos.title`, which F006 had dropped as "a hashtag".

Phase 02 landed the migrations, phases 03–05 the editor, data layer and modal wiring, and phase 06 the e2e suite. Phase 06 is where the tester found three real defects: `send_kudos` never anchored the image-URL origin, `next/image` crashed the board on storage-hosted images, and copy did not match the allowed formats.

Then the inspection reviewer found the one that mattered. An anonymous kudo with images leaked its sender. Inspection returned REWORK, score 6, one critical.

## The Brutal Truth

This one stings. The tester was thorough and still missed the leak, because the tests asserted what the feature should do, not what a sender could infer from public data. The leak was an identity fingerprint in the storage path, `kudos-images/<auth uid>/<uuid>.jpg`, and the uid was also sitting in `profiles.auth_user_id`, readable by anon. Hiding the `sender_id` column did nothing against that. The whole anonymous feature is a promise, and we nearly shipped it broken.

The rework took most of a day. The tired truth is that the fix was not one change but a chain of them, and each one touched a surface the user had to sign off on by hand.

## Technical Details

- Leak: public image path `kudos-images/<auth uid>/<uuid>.<ext>`, where the folder equals `auth.uid()`. Anonymous kudos still exposed the sender through that folder.
- Also public: `profiles.auth_user_id`. Revoked by an explicit column re-grant, with the owner read moved to a `viewer_profile` definer view.
- Rework: `kudos_image_uploads` registry (no client grants), `reserve_kudos_image_path` RPC returning `<uuid>/<uuid>.<ext>`, storage INSERT policy via definer predicate `is_reserved_kudos_image_path`. A plain subquery failed under the caller's role.
- `secret_boxes` owner policy had to be rewritten onto `viewer_profile`, or it would have broken silently.
- Re-inspection: SEALED, score 8, 0 critical.
- Final gates: 634/634 unit, 181/181 e2e twice after `db reset` ×2, seed-sanity 7/7, `tsc`/lint/build 0.

## What We Tried

- Hiding `sender_id` with a column revoke alone. Not enough: the uid still rode along in the storage path.
- Keeping uid folders and adding a policy. Rejected, because the path itself is public.
- A plain subquery in the storage policy. It failed under the caller role, so the definer predicate replaced it.

## Root Cause Analysis

We designed "anonymous" as a view-level mask and forgot that every public artifact is a channel: the URL, the storage object key, and a column we only thought was private. The masking was applied to the table that renders the card, not to every surface an anonymous viewer can reach.

The tester tests behaviour. Nobody wrote an assertion that said "no auth uid appears in any public surface". The reviewer found it by reasoning about the attack, not by running a case.

## Lessons Learned

- For any anonymity feature, enumerate every public surface (rows, URLs, object keys, joined profile columns) before writing the mask.
- A revoked column is only as private as the other tables that carry the same value.
- Write the negative e2e first: anonymous image send, then assert no uid in any feed URL or row. We now have that test, and it should have been there from RED.
- Frame-vs-spec conflicts keep paying rent across features. F006 dropped `title` as "a hashtag", and F007 had to re-add it.

## Next Steps

- Rerun the full F006 45-e2e regression once PR #6 merges and main is re-merged. Owner: user. By: before the next release cut.
- Set `app_settings.storage_public_base` per environment. Owner: user. By: before the first deploy.
- PM copy review list (dev-draft vi/en). Owner: user with PM. By: before release.
- Deferred hardening: reserve race (count-then-insert allows over 25), `send_kudos` rate limit, orphan image sweep. Owner: next agent. By: next session.

**Status:** ongoing. Code, tests and docs are pushed. The PR #6 regression, the environment setting and the copy list are open.

**Summary:** F007 is built and pushed. Anonymous kudos no longer leak the sender through storage paths or `profiles.auth_user_id`, and the proof is an e2e that asserts no uid on any public surface.
