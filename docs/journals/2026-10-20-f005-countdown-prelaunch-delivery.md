# F005 Countdown Prelaunch: a site-wide gate that hid behind a flaky awards deep-link, and an env rename that breaks old `.env.local` files

**Date**: 2026-10-20 22:06
**Severity**: medium
**Component**: F005 Countdown Prelaunch (`/countdown`, proxy launch gate, `GET /api/event-config`, `EVENT_START_AT`; branch `feature/countdown-prelaunch`)
**Status**: ongoing

## What Happened

Track A's UI agent built `/countdown` presentationally while clarification and planning ran on the main thread. The design font "Digital Numbers" is not on Google Fonts, so the agent drew the digits as 7-segment SVG. Track B resolved 11 clarified decisions. The big ones: a site-wide proxy launch gate, the target time read from server env through `GET /api/event-config`, and `NEXT_PUBLIC_EVENT_START_AT` dropped in favour of `EVENT_START_AT`. The gate fails open when the env is missing or invalid.

The e2e suite could not run pre-launch without fighting the clock. We pinned the Playwright `webServer` to a real past date, so the 98 existing specs stay ungated. Pre-launch behaviour is proven by a 15-path unit decision matrix, proxy wiring tests, and a scripted curl smoke against a dev server started with `EVENT_START_AT=2099-01-01T00:00:00+07:00`.

Five conventional commits were pushed, and the user signed off the auth-sensitive change directly.

## The Brutal Truth

The gate is the most dangerous thing we have shipped so far. It sits in front of every route, and a bad env read either locks everyone out or opens the door. Fail-open is the right call for ops, but it means a typo in the date silently turns the gate off, and nothing alerts on it yet.

The galling part is the flake. We spent real time on the awards `#mvp` deep-link, and our first theory, a layout shift, was wrong. The rename also breaks anyone who has not edited their `.env.local`. That is a deploy-day surprise waiting to happen.

## Technical Details

- Flake probe timeline on `/awards#mvp`: `scrollHeight` 720 → 7234 about 1 s after load, while `scrollY` stayed at 0. The one-shot hash scroll fired while Suspense-streamed content was still hidden.
- Fix: a one-shot `ResizeObserver` re-scroll in `src/components/awards/use-active-category.ts`, hardened after review to cancel on user input, stale hash, or a 2 s timeout.
- Also fixed: scroll-spy visible-wait in the awards spec, and the homepage clock margin raised from 1 s to 30 s.
- Stress run: 420/420 green.
- Gates: `tsc` 0, eslint 0, `build` 0, vitest 312/312 (35 files), Playwright 105/105.
- Inspection SEALED, score 8, 0 critical. Three Accept findings fixed in-session. Three Defer findings logged.
- Smoke: `/`, `/awards`, `/todo` → 307 to `/countdown`. `/countdown` → 200 with `no-store`. `/login` → 200.

## What We Tried

- Layout shift as the cause of the flake. The probe timeline disproved it.
- A second dev server for pre-launch e2e. Rejected: one `.next` directory, doubled compile time, and flaky.
- `page.clock` to fake pre-launch time. It cannot fake server-side time, so it was dropped.
- The evidence gate. It rejected `inspection-verdict` because `acceptanceCovered` did not echo each study-context criterion verbatim. A `signoffNote` key then blocked `riskGate`, which allows no extra keys.

## Root Cause Analysis

The flake's root cause was a timing assumption. We treated a one-shot browser hash scroll as if the target would already be laid out. Streamed Suspense content breaks that assumption.

The gate's risk came from its scope. A site-wide, auth-aware redirect is a sensitive change, and we designed it as a single decision function with an env input. That is clean, but its failure mode depends on an env var nobody watches.

The evidence failures came from schema strictness we had not read before the run.

## Lessons Learned

- Before blaming layout, probe the DOM timeline. Log `scrollHeight` and `scrollY` at load.
- Pinning a past date in e2e is a valid pattern, but it means pre-launch behaviour needs its own unit matrix. Do not count it as tested by e2e.
- Any env that changes gate behaviour needs a boot-time warning, not just a fail-open default. That warning is still deferred.
- Read the evidence schema before writing the verdict. `riskGate` allows no extra keys.

## Next Steps

- Confirm EN copy and both metadata titles with PM. Owner: user. By: before release.
- Run the manual pre-launch checks: admin with a real session reaches `/` pre-launch, and the countdown ticks and leaves at zero in a real browser. Owner: user. By: before the event.
- Tell everyone with a local `.env.local` to drop `NEXT_PUBLIC_EVENT_START_AT`, set `EVENT_START_AT`, and restart the dev server. Owner: user. By: next deploy.
- Admin users must sign out and back in after a role grant. The role lives in the JWT. Owner: user.
- Rebuild the route list and API map, which are stale. Re-baseline `/tkm:rebuild-spec`; four features have drifted. Owner: next agent. By: next session.
- Log the three Defer findings as tickets: invalid-env warning, redirect retry cap, env-rename deploy note.

**Status:** ongoing. Code, tests, and docs are pushed. Copy, the manual checks, and the re-baseline are open.

**Summary:** F005 Countdown Prelaunch is built and pushed as five commits on `feature/countdown-prelaunch`. The site-wide launch gate with admin bypass, the server-env target time, and the `EVENT_START_AT` rename are in. The flaky awards deep-link was fixed at root cause, not by a retry. Pre-launch e2e was replaced by a unit matrix and a scripted smoke, and the manual checks remain open.
