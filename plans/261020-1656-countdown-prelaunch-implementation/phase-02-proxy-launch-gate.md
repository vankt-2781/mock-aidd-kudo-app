# Phase 02 — Proxy launch gate (DEC-001) with admin bypass

## Context Links
- Spec: [technical-spec.md](spec/countdown-prelaunch/technical-spec.md) — FR-005/006/007, BR-001/002/003, DEC-001, SC-002/003/004
- Draft: [spec/system/permissions.md](spec/system/permissions.md)
- Existing: `src/proxy.ts`, `src/lib/supabase/update-session-in-proxy.ts`, `src/lib/auth/decide-route-redirect.ts` (+test pattern), `src/lib/auth/is-admin-user.ts`
- Depends: phase-01 (`readEventStart`)

## Overview
Priority P1 · Status done · Effort 2h · Parallel with 03, 04.
Pure gate decision + wire into proxy before the existing route guard; session helper also reports `isAdmin`.

## Key Insights
- Matcher already skips `_next/static`, `_next/image`, `favicon.ico`, `images/`, `auth/callback`, image extensions → those never reach the gate. The decision fn still excludes BR-001 paths (defense in depth, testable).
- `getClaims()` returns verified JWT claims; Supabase access tokens carry `app_metadata` → `isAdminUser({ app_metadata: claims.app_metadata })`. No extra network call. Throw/error → `isAdmin: false` (deny by default, BR-002).
- Gate runs FIRST (clarified). Known 2-hop pre-launch: signed-in non-admin on `/login` → route guard `/todo` → next request gated → `/countdown`. Acceptable; document in test.
- Path matching: exact `/countdown`, `/login`; prefix `/auth/`, `/api/` (not `startsWith("/login")` — avoids `/loginx`).
- Redirect target has no query/hash (edge-cases: dropped).

## Requirements
- `decideLaunchGateRedirect({ pathname, now, start, isAdmin }): string | null`
  - `start === null || now >= start` (launched/fail-open): `/countdown` → `/`; else null.
  - pre-launch: excluded → null; isAdmin → null; else `/countdown`.
- Export `COUNTDOWN_PATH = "/countdown"`; reuse `HOME_PATH` from `src/lib/site/site-routes.ts` (exists, `"/"`).
- `ProxySession` gains `isAdmin: boolean`; try/catch degrade unchanged.
- `proxy()`: `gate ?? decideRouteRedirect(...)`; redirect via `redirectWithCookies`.

## Architecture
```
proxy(request)
  {response,isAuthenticated,isAdmin} = updateSessionInProxy(request)
  start = readEventStart()?.start ?? null
  target = decideLaunchGateRedirect({pathname, now:new Date(), start, isAdmin})
        ?? decideRouteRedirect(pathname, isAuthenticated)
  target ? redirectWithCookies(request,target,response) : response
```

## Related Code Files (ownership)
- Create: `src/lib/launch-gate/decide-launch-gate-redirect.ts`, `src/lib/launch-gate/decide-launch-gate-redirect.test.ts`, `src/proxy.test.ts`
- Modify: `src/lib/supabase/update-session-in-proxy.ts`, `src/proxy.ts`

## Implementation Steps
1. Test matrix first (`decide-launch-gate-redirect.test.ts`, node env), `it.each`:
   - pre-launch × {guest/user (isAdmin false), admin} × paths {`/`, `/awards`, `/todo`, `/countdown`, `/login`, `/auth/callback`, `/api/event-config`, `/loginx`, `/apix`} → expected.
   - post-launch (now == start, now > start) × paths → only `/countdown` → `/`.
   - start null → same as post-launch (BR-003).
2. Implement decision fn (< 50 lines).
3. `update-session-in-proxy.ts`: compute `isAdmin = !error && !!data?.claims && isAdminUser({ app_metadata: data.claims.app_metadata })`; catch branch `isAdmin: false`.
4. `proxy.ts`: wire as above.
5. `src/proxy.test.ts`: `vi.mock("@/lib/supabase/update-session-in-proxy", importOriginal)` keeping real `redirectWithCookies`, stub `updateSessionInProxy` → `{ response: NextResponse.next() with a set cookie, isAuthenticated, isAdmin }`; `vi.stubEnv("EVENT_START_AT", future|past|"")`. Assert: pre-launch guest `/todo` → 307 `/countdown` (gate before guard); pre-launch admin `/` → pass; pre-launch admin `/todo` unauthenticated impossible — skip; post-launch `/countdown` → `/`; post-launch guest `/todo` → `/login` (old rule intact); refreshed cookie present on redirect; session helper reporting unauthenticated (simulated Supabase down) pre-launch → `/countdown`.
6. `npx vitest run src/proxy.test.ts src/lib` + tsc.

## Todo List
- [x] decision matrix test → impl
- [x] session helper isAdmin
- [x] proxy wiring + proxy.test.ts
- [x] existing decide-route-redirect tests untouched & green

## Success Criteria
- SC-002/003/004 proven at unit level (matrix + proxy wiring). Proxy never throws on Supabase failure.

## Risk Assessment
| Risk | L | I | Mitigation |
|------|---|---|-----------|
| Gate locks whole site by misconfig | M | H | fail-open on null; past-date kill-switch |
| Admin claim missing in stale JWT (role set after token minted) | M | M | user re-signs in; noted in manual smoke (05) |
| Excluded-path typo gates `/login` → admin cannot sign in | L | H | explicit matrix rows for `/login`, `/auth/*` |
| Next RSC/prefetch requests to gated routes get redirected | L | L | intended; same proxy semantics as existing guards |

## Security Considerations
- Only `app_metadata.role` (server-controlled) — never `user_metadata`. Claims verified by `getClaims`, not `getSession`.
- Deny by default on any auth failure. Gate is UX lock, not data protection — pages still own their own authz.

## Next Steps
05 runs post-launch e2e + manual pre-launch smoke.
