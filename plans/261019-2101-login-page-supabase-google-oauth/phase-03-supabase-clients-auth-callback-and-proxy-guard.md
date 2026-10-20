---
phase: 03
title: "Supabase clients, auth callback, proxy route guard"
status: completed
priority: P1
effort: 2h
feature: F001
track: B
blockedBy: [phase-02]
---

# Phase 03 — Supabase clients, auth callback, proxy guard

## Context Links
- Spec: FR-001, FR-004, FR-005, FR-007, FR-011, BR-001, BR-002, BR-004, DEC-001, DEC-002, INT-002 ([technical-spec.md](spec/login-with-google/technical-spec.md)); [permissions.md](spec/system/permissions.md); [edge-cases.md](spec/login-with-google/edge-cases.md)
- Next.js 16 docs: `node_modules/next/dist/docs` (proxy file convention). Supabase SSR guide for Next.js (current `@supabase/ssr` API — verify, do not rely on memory).

## Overview
P1 · completed. Cookie-based Supabase clients, `/auth/callback` code exchange, `src/proxy.ts` guard.

## Key Insights
- Next 16 renamed `middleware.ts` → `proxy.ts`, exported fn `proxy`. With `src/` layout the file is `src/proxy.ts`.
- `createServerClient` cookies adapter: `getAll`/`setAll` only (old get/set/remove deprecated).
- Guard must use `getClaims()` (or `getUser()` if unavailable) — never `getSession()` (unverified).
- Redirect responses from proxy must carry the refreshed cookies set on the pass-through response (classic pitfall → logout loops).
- BR-001: no email/domain check anywhere.

## Requirements
- DEC-001: `/login`+user → `/todo`; `/todo`+no user → `/login`; else pass.
- DEC-002: provider `error` param or missing `code` or exchange error → `/login?error=oauth`; success → `/todo`.
- Matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `images/`, image extensions, `auth/callback`.

## Architecture
```
request → proxy() → updateSession(req): createServerClient(req/res cookies) → getClaims()
        → decideRouteRedirect(pathname, isAuthed) → null ? res : redirect(+copy cookies)
/auth/callback GET → resolveCallbackRedirect({code, providerError}) → exchangeCodeForSession(code)
        → resolveCallbackRedirect(..., exchangeFailed) → NextResponse.redirect(origin + target)
```

## Related Code Files (ownership)
Create:
- `src/lib/supabase/supabase-browser-client.ts` — `createBrowserClient(url, anonKey)`
- `src/lib/supabase/supabase-server-client.ts` — async `createServerClient` over `await cookies()`; `setAll` in try/catch (RSC can't write)
- `src/lib/supabase/supabase-env.ts` — reads + asserts `NEXT_PUBLIC_SUPABASE_URL/ANON_KEY` (DRY for both clients)
- `src/lib/supabase/update-session-in-proxy.ts` — request-scoped client, returns `{ response, isAuthenticated }`
- `src/lib/auth/decide-route-redirect.ts` (+ `.test.ts`) — pure DEC-001
- `src/lib/auth/resolve-callback-redirect.ts` (+ `.test.ts`) — pure DEC-002; exports `LOGIN_ERROR_PARAM = "error"`, value `"oauth"`
- `src/app/auth/callback/route.ts`
- `src/proxy.ts` — `proxy()` + `config.matcher`

## Implementation Steps
1. Write failing tests for both pure fns (all 4 DEC-001 rows; DEC-002: provider error, no code, exchange fail, success; also `/` and unknown paths → null).
2. Implement pure fns; `vitest run` green.
3. Env helper + browser/server clients per current `@supabase/ssr` docs.
4. `update-session-in-proxy.ts` following official Next.js proxy example; helper to copy cookies onto redirect.
5. `src/proxy.ts` wiring + matcher regex.
6. Callback route: read `code`, `error`; call exchange in try/catch; redirect via `new URL(target, request.url)`.
7. `npx tsc --noEmit`, `npm run lint`.

## Todo List
- [x] tests for pure decision fns
- [x] pure fns
- [x] env + clients
- [x] update-session helper
- [x] proxy.ts + matcher
- [x] callback route

## Success Criteria
- Unit tests green (DEC-001, DEC-002 tables fully covered).
- `curl -I localhost:3000/todo` (no cookie) → 307 `Location: /login`.
- `curl -I "localhost:3000/auth/callback"` → 307 `/login?error=oauth`; `?error=access_denied` same.
- Each file < 200 lines.

## Risk Assessment
| Risk | L/I | Mitigation |
|------|-----|------------|
| Proxy API differs from memory (Next 16 / ssr version) | M/H | Read local Next docs + Supabase docs first; build must pass |
| Cookies dropped on redirect → loop | M/H | Copy cookies helper; manual test login→/login redirect |
| `getClaims` absent in installed ssr/supabase-js | L/M | Fallback `getUser()` |
| Matcher accidentally guards callback | L/H | Explicit exclusion + curl check |

## Security Considerations
Server-side enforcement (BR-004). No open redirect: target is fixed constant. Anon key only. Code replay rejected by Supabase → error path.

## Next Steps
Unblocks 05, 06 (with 04).
