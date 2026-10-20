# F001 "Login with Google" greenfield delivery: parallel MoMorph tracks, three tempering catches, one evidence-gate detour

**Date**: 2026-10-19 21:01
**Severity**: medium
**Component**: F001 Login with Google (Next.js 16 app, Supabase Google OAuth, `/login` screen SCR002)
**Status**: blocked

## What Happened

First greenfield delivery of F001 through `tkm:takumi` interactive with the MoMorph two-track protocol. Track A (`momorph-ui-implementer`) built the `/login` screen from Figma while Track B (spec authoring and planning) ran in the main thread. Integration then split `/login` into a server page plus a client wrapper. Tempering, inspection, and the evidence gate followed. Code landed on `main` as four commits: baseline `3191dcb` plus `3243f88`, `9bef6bd`, `f5bc764`. Nothing was pushed.

## The Brutal Truth

The two-track flow earned its keep, but the seams between tracks did the damage. The build broke at integration because neither track owned the Suspense boundary. The evidence gate refused to seal until a human signed off, and the reviewer was right to refuse a relayed sign-off. Several "done" claims only held after tempering proved them. Docker/Supabase is not running locally, so four e2e rows are unverified and one row waits on Google credentials.

## Technical Details

- Build failure at integration: Next 16 `cacheComponents` rejects `cookies()`/`searchParams` outside `<Suspense>`. Fixed by wrapping the content component in the `/login` server page.
- `npm run lint` red: the linter walked the `.claude/` kit. Fixed with `globalIgnores` in `eslint.config.mjs`.
- Test case 33a1dacf: footer was not `position: fixed`. Fixed.
- `src/proxy.ts`: `getClaims()` ran without try/catch, so an unreachable Supabase plus a stale `sb-*` cookie returned 500. Fixed, smoke-tested with a fake cookie.
- `src/lib/auth/get-display-user.ts`: accepted any http(s) avatar from user-editable metadata. Now https and `*.googleusercontent.com` only. Tests 39 to 40.
- Figma export failed: `get_figma_image` 500, `get_media_file` 401. `public/images/login/key-visual.jpg` is a crop of the reference screenshot with CSS masking, about 3px off at 1440px.
- Final: 40/40 tests; tsc, eslint, lint, build exit 0; smoke 10/10; inspection SEALED 9/10; evidence gate SEALED.

## What We Tried

- Relayed sign-off through the reviewer: refused. `riskGate.humanSignedOff` must come from the user directly. The user signed off via AskUserQuestion, and the gate sealed.
- Inspection-verdict findings with loose keys were rejected. Exact keys `{severity,category,location,summary,disposition}` were required.
- rebuild-spec Core and Flow bootstrap on an empty repo: blocked, because cursors are git SHAs. A baseline commit (`3191dcb`) was created mid-delivery with user approval.
- Hook conflict: one hook asked for `!.venv` in `.tkmignore`, another refused agent edits to guardrail files. Resolved by running the stdlib-only scripts with system `python3`.

## Root Cause Analysis

- The Suspense failure is a cross-phase seam. Phases 05 and 06 each passed their own checks, but nobody owned the boundary between the server page and the client content.
- Screen-code collision: takumi spec-promote allocated `SCR001_Login`, then rebuild-spec renumbered to `SCR001_Home`/`SCR002_Login`/`SCR003_Todo`. The two numbering authorities were never reconciled.
- The plan said Next 15; the scaffold delivered 16, and `middleware.ts` became `src/proxy.ts`. The planner caught it from web docs, but spec drafts carried stale wording until delivery.
- The avatar trust gap came from treating OAuth metadata as trusted input.

## Lessons Learned

- Before any integration, name the owner of every boundary between tracks, including Suspense and server/client splits.
- On greenfield, make the baseline git commit before running rebuild-spec, and allocate SCR codes only after the core rebuild.
- Pin the framework major in the plan and verify the scaffold against it on day one.
- Treat user-editable auth metadata as untrusted at render time.
- Wrap every auth-provider call in the proxy in try/catch.

## Next Steps

- Replace `key-visual.jpg` with a real Figma asset export once the image endpoints work. Owner: user. By: next design sync.
- Start local Docker/Supabase and run the 4 blocked e2e rows. Owner: user. By: before merge to any shared branch.
- Supply Google OAuth credentials and run the 1 credential row. Owner: user. By: same as above.
- Run the 3 interactive-browser rows. Owner: user, with `tkm:takumi`. By: same.
- Push `main` only after the rows above are green.
