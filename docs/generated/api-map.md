# API Map

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19
**Sources**: route-list.md (ROUTE001, 3 pages, 2 server actions), behavior-logic.md (BL001-BL005, § Source Symbol)
**Auth values**: PERM### not yet allocated; using `public` / `authenticated`.

## API Map

### Auth (backend route handler)

| Method | Path | Handler BL### | Auth |
|--------|------|---------------|------|
| GET | /auth/callback | BL005_OAuthCallbackHandler (symbol `GET`); uses BL002_SupabaseServerClient | public (excluded from proxy matcher; reached via Google/Supabase redirect before a session exists) |

- Code: ROUTE001, owner F001. Redirects to `/todo` on success, `/login?error=oauth` on failure (fixed targets, no open redirect).
- BL001_SupabaseBrowserClient is the client-side initiator (`signInWithOAuth`, `redirectTo` = `/auth/callback`); not a handler of any route.

### Pages (frontend routes; request chain via proxy)

All matched paths pass through BL003_ProxyRequestChain (symbol `proxy`) -> BL004_ProxySessionRefresh (symbol `updateSessionInProxy`). Redirect decision (`decideRouteRedirect`) belongs to Permissions/GUARD-001, not BL.

| Method | Path | Handler BL### | Auth |
|--------|------|---------------|------|
| GET | / | BL003, BL004 (proxy pass-through only) | public (unguarded boilerplate) |
| GET | /login | BL003, BL004; BL001 (client-side OAuth start) | public (authenticated users redirected to /todo) |
| GET | /todo | BL003, BL004; BL002 (server `getUser`) | authenticated (unauthenticated redirected to /login; page re-checks `getUser()`) |

### Server Actions (no stable URL; POST to hosting page path with Next action-id)

| Action | Invoked from | Handler BL### | Auth |
|--------|--------------|---------------|------|
| signOutAction (src/app/todo/sign-out-action.ts) | /todo (Logout form) | BL002_SupabaseServerClient (`signOut`) as dependency; action itself is not a BL [UNMAPPED as BL] | authenticated |
| setLocaleAction (src/lib/i18n/set-locale-action.ts) | /login (language selector) | none [UNMAPPED] (persists locale cookie; see client-side BL-C01) | public |

## Unmapped

- setLocaleAction: no BL entry (behavior-logic.md note: user-initiated mutation, not a canonical BL type). BL-C01 is client-side only.
- signOutAction: no BL of its own; only consumes BL002.
- No backend route is without a BL entry (ROUTE001 -> BL005).

## Notes

- BL003/BL004 are cross-cutting; listed per page rather than as a route.
- BL001 and BL002 are factories (integration), listed as dependencies/initiators.

**Status:** DONE
**Summary:** Mapped 1 backend route (GET /auth/callback -> BL005), 3 pages (proxy BL003/BL004, plus BL001/BL002 where applicable), and 2 server actions (no dedicated BL; flagged [UNMAPPED]). Auth levels use public/authenticated pending PERM allocation.
