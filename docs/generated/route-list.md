# Route List

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19

## Backend Routes

> **Completeness Contract:** one row per leaf route (HTTP method + concrete path). Tier2 static parse (no probe manifest): derived from `src/app/**/route.ts` and `src/proxy.ts`. Only one route handler exists in the repo.

> **Code Column Contract:** `ROUTE###` contiguous, global in this file. `Owner F###` = bare feature code.

### File: src/app/auth/callback/route.ts

| Method | Path | Code | Owner F### | Handler | Middleware |
|--------|------|------|------------|---------|------------|
| GET | /auth/callback | ROUTE001 | F001 | GET (route.ts; exchangeCodeForSession then resolveCallbackRedirect -> 307 to /todo or /login?error=oauth) | none (excluded from proxy matcher) |

### Non-route server entry points (Server Actions; not addressable HTTP routes)

Server Actions are invoked via POST to the hosting page path with a Next action-id header; they have no stable URL and are not counted as routes.

| Action | Defined in | Invoked from | Owner F### |
|--------|-----------|--------------|------------|
| signOutAction | src/app/todo/sign-out-action.ts | /todo (Logout form) | F001 |
| setLocaleAction | src/lib/i18n/set-locale-action.ts | /login (language selector) | F001 |

### Proxy (src/proxy.ts, Next 16 middleware replacement)

- Matcher: `/((?!_next/static|_next/image|favicon.ico|images/|auth/callback|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)`
- Runs on every path except static assets, `/auth/callback`, and image extensions.
- Behavior: refresh Supabase session cookies (`getClaims`), then `decideRouteRedirect`: `/login` + authenticated -> `/todo`; `/todo` or `/todo/*` + unauthenticated -> `/login`; else pass through. Supabase failure degrades to unauthenticated.

## Frontend Routes/Pages

### File: src/app/**/page.tsx

| Path | Component | Route Name | Guard |
|------|-----------|------------|-------|
| / | Home (src/app/page.tsx) | home | none (create-next-app boilerplate, unguarded) |
| /login | LoginPage (src/app/login/page.tsx) | login | proxy: authenticated -> /todo; reads `?error=oauth` |
| /todo | TodoPage (src/app/todo/page.tsx) | todo | proxy: unauthenticated -> /login; page re-checks `getUser()` |

## Summary

| Category | Count |
|----------|-------|
| Backend Routes | 1 |
| Frontend Pages | 3 |
| Total | 4 |

## Notes

- Owner F001 inferred from docs/features/F001_LoginWithGoogle and commit "F001"; feature-list.md did not exist at synthesis time.
- `/` has no feature owner (scaffold boilerplate).
