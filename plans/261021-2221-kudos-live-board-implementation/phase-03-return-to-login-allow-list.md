# Phase 03 — Return-to login via exact allow-list (`?next=`)

## Context Links
- Spec: FR-030, DEC-002, SC-015; edge-cases rows "After sign-in…", "`next` missing, external…", "`next=/kudos` with extra query"
- Clarifications: return-to allow-list; signed-in user on `/login?next=<valid>` follows next (orchestrator default)
- Existing: `src/lib/auth/resolve-callback-redirect.ts` (+test), `src/lib/auth/decide-route-redirect.ts` (+test), `src/proxy.ts` (+`src/proxy.test.ts`), `src/app/auth/callback/route.ts`, `src/app/login/page.tsx`, `src/app/login/login-page-client.tsx` (+test), `supabase/config.toml` (`additional_redirect_urls`)
- Existing e2e that must stay green: `e2e/login-oauth-start.spec.ts:39` asserts `redirect_to` === `http://localhost:3000/auth/callback` exactly (no `next`) — unchanged by design.

## Overview
Priority P1 · Status pending · Effort 2h · Parallel with 01, 04. Auth surface → **user sign-off at inspection**.

## Key Insights
- One pure resolver used by 3 call sites (proxy, login page, callback) — DRY, single matrix test.
- Exact-match `Set` lookup on the raw string: no URL parsing, so `//evil.com`, `/\evil`, `https://…`, `/kudos?x=1`, `/kudos/`, `/KUDOS`, `%2Fkudos` (after one decode by URLSearchParams it is `/kudos` → allowed; double-encoded → rejected) all fall out naturally.
- `next` travels: gated link `/login?next=%2Fkudos` → login page (server) resolves → client builds `redirectTo = origin + "/auth/callback" + (next ? "?next=" + encodeURIComponent(next) : "")` → Supabase → `/auth/callback?code&next` → resolver → redirect.
- Supabase validates `redirect_to`; local GoTrue accepts same-host URLs of `site_url`, but add the glob `http://localhost:3000/auth/callback**` to `additional_redirect_urls` to be explicit (needs `npx supabase stop && npx supabase start`; production dashboard needs the same entry → docs in 08).
- Pre-launch: gate runs first; signed-in non-admin on `/login?next=/kudos` → `/kudos` → gated → `/countdown` (2 hops, acceptable, same as today's `/todo` path).

## Requirements
- `src/lib/auth/return-to.ts`: `RETURN_TO_PARAM = "next"`, `RETURN_TO_ALLOW_LIST: ReadonlySet<string> = new Set(["/kudos"])`, `resolveReturnTo(raw: string | null | undefined): string | null`, `buildLoginHref(next: string): string` (returns `/login` if next not allowed), `KUDOS_LOGIN_HREF`.
- `resolveCallbackRedirect(outcome & { next?: string | null })`: error paths unchanged (`/login?error=oauth`, `next` dropped); success → `resolveReturnTo(next) ?? TODO_PATH`.
- `decideRouteRedirect(pathname, isAuthenticated, next?: string | null)`: `/login` + authenticated → `resolveReturnTo(next) ?? TODO_PATH`; all other rows unchanged (existing tests untouched).
- `proxy.ts`: pass `request.nextUrl.searchParams.get(RETURN_TO_PARAM)`.
- Callback route: read `next` param, pass through.
- Login page: resolve `next` server-side → `LoginPageClient` prop `returnTo: string | null`; client appends to `redirectTo` only when non-null.

## Architecture
```
gated click → /login?next=/kudos
  proxy: signed-in? decideRouteRedirect('/login', true, '/kudos') → /kudos
  page:  returnTo = resolveReturnTo(params.next) → LoginPageClient(returnTo)
         signInWithOAuth({redirectTo: origin/auth/callback?next=%2Fkudos})
Google → Supabase → /auth/callback?code=…&next=/kudos
  route: exchange → resolveCallbackRedirect({code, providerError, exchangeFailed, next}) → /kudos | /todo
```

## Related Code Files (ownership)
- Create: `src/lib/auth/return-to.ts`, `src/lib/auth/return-to.test.ts`
- Modify: `src/lib/auth/resolve-callback-redirect.ts` (+`.test.ts`), `src/lib/auth/decide-route-redirect.ts` (+`.test.ts`), `src/proxy.ts`, `src/proxy.test.ts`, `src/app/auth/callback/route.ts`, `src/app/login/page.tsx`, `src/app/login/login-page-client.tsx` (+`.test.tsx`), `supabase/config.toml`

## Implementation Steps
1. `return-to.test.ts` `it.each` matrix: `/kudos` → `/kudos`; null/""/undefined, `/todo`, `/kudos/`, `/kudos?x=1`, `/kudos#a`, `/KUDOS`, ` /kudos`, `//evil.com`, `/\\evil.com`, `https://evil.com`, `javascript:alert(1)`, `%2Fkudos`, `/kudos/../todo` → null. `buildLoginHref("/kudos")` = `/login?next=%2Fkudos`; disallowed → `/login`.
2. Extend `resolve-callback-redirect.test.ts`: success+valid next → `/kudos`; success+invalid → `/todo`; error+valid next → `/login?error=oauth`.
3. Extend `decide-route-redirect.test.ts`: `/login` auth + `/kudos` → `/kudos`; + evil → `/todo`; unauth + next → null (login renders).
4. Extend `src/proxy.test.ts`: post-launch signed-in `/login?next=%2Fkudos` → 307 `/kudos`; `?next=https://evil.com` → `/todo`.
5. Extend `login-page-client.test.tsx`: `returnTo="/kudos"` → `redirectTo` ends `/auth/callback?next=%2Fkudos`; null → exact old value (TC014 assertion unchanged).
6. Implement; wire callback, page, proxy; add glob to `config.toml`; restart Supabase.
7. `npx vitest run src/lib/auth src/proxy.test.ts src/app/login` + tsc; `npx playwright test e2e/login-*.spec.ts e2e/authenticated.spec.ts` green.

## Todo List
- [ ] return-to resolver + matrix (TDD)
- [ ] callback + route-guard + proxy wiring (TDD)
- [ ] login page/client `returnTo` (TDD)
- [ ] config.toml glob + Supabase restart
- [ ] existing login/auth e2e green

## Success Criteria
- SC-015 proven at unit level; e2e return-to (07) passes; default `/todo` unchanged when `next` absent; no open redirect for any matrix input.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Open redirect via parsing quirk | L | High | exact `Set` membership, no URL parsing, matrix test |
| Supabase rejects `redirect_to` with query → silently lands on site_url `/` | M | M | config glob; manual smoke in 08; prod dashboard note |
| Breaking existing TC014 `redirectTo` assertion | L | M | append only when `returnTo` non-null |

## Security Considerations
Allow-list is code-owned, exact, internal paths only; error paths never forward `next`; `next` never reflected into HTML unescaped (React props only). Off-switch: empty Set. **User sign-off required.**

## Next Steps
05 consumes `KUDOS_LOGIN_HREF`; 07 e2e return-to + guest-gating redirects; 08 docs (permissions, F001 note, prod redirect URL).
