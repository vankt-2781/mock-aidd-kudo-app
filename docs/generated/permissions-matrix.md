# Permissions Matrix

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19
**Analysis Scope**: screen-list.md (SCR001-003), behavior-logic.md (BL001-005), source: `src/proxy.ts`, `src/lib/auth/*`, `src/app/todo/*`, `src/app/auth/callback/route.ts`, `src/lib/i18n/*`

> **Raw PERM### matrix.** The plain-language curated view lives at [permissions.md](permissions.md). This file was written first; the curated view derives from it.

**Code Format**: `PERM###_NameSlug`

**Roles** (no RBAC): `Visitor` = no verified Supabase session; `Signed-in user` = verified session (`getClaims()` in proxy, `getUser()` on server page). No admin/owner/other roles exist.

**Permission Types**: route-guard, screen-permission, action-permission, data-permission, role-based, resource-ownership, field-permission, api-scope, feature-flag, experiment, env-gate, locale-gate

**Note**: Feature mapping is managed in FeatureList.md.

## Permissions Index

| Code | Name | Type | Enforced At |
|------|------|------|-------------|
| PERM001_GuardTodoArea | GuardTodoArea | route-guard | `src/lib/auth/decide-route-redirect.ts:12-13` via proxy (BL003) |
| PERM002_BounceSignedInFromLogin | BounceSignedInFromLogin | route-guard | `src/lib/auth/decide-route-redirect.ts:9-11` via proxy (BL003) |
| PERM003_TodoServerUserCheck | TodoServerUserCheck | screen-permission | `src/app/todo/page.tsx:11-13` |
| PERM004_OwnProfileOnly | OwnProfileOnly | data-permission | `src/app/todo/page.tsx:10-11` (`getDisplayUser`) |
| PERM005_StartGoogleSignIn | StartGoogleSignIn | action-permission | `src/app/login/login-page-client.tsx:43` (client; reachable only by Visitor via PERM002) |
| PERM006_SignOut | SignOut | action-permission | `src/app/todo/sign-out-action.ts:7` (server action) |
| PERM007_OAuthCallbackPublic | OAuthCallbackPublic | route-guard | `src/proxy.ts:16` (matcher exclusion), `src/app/auth/callback/route.ts` |
| PERM008_HomePublic | HomePublic | route-guard | `src/lib/auth/decide-route-redirect.ts:14` (default pass-through) |
| PERM009_LocaleSwitchPublic | LocaleSwitchPublic | action-permission | `src/lib/i18n/set-locale-action.ts:7` |
| PERM010_LoginCopyByLocale | LoginCopyByLocale | locale-gate | `src/app/login/login-page-client.tsx:56` |
| PERM011_SupabaseEnvRequired | SupabaseEnvRequired | env-gate | `src/lib/supabase/supabase-env.ts:8-13` |

---

## PERM001_GuardTodoArea: GuardTodoArea

**Type**: route-guard
**Enforced At**: Proxy (BL003) -> `decideRouteRedirect` (DEC-001)

### Description

`/todo` and any `/todo/*` path redirect to `/login` when the proxy finds no verified session. Supabase failure degrades to unauthenticated (BL004), so the guard fails closed.

### Related Routes

- (GET) /todo, /todo/*

### Related Screens

- SCR003_Todo - Todo

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✗ | Redirect to `/login` |
| Signed-in user | ✓ | Verified JWT claims |

### Related Modules

- src/proxy.ts
- src/lib/supabase/update-session-in-proxy.ts
- src/lib/auth/decide-route-redirect.ts

---

## PERM002_BounceSignedInFromLogin: BounceSignedInFromLogin

**Type**: route-guard
**Enforced At**: Proxy (BL003) -> `decideRouteRedirect` (DEC-001)

### Description

Exact path `/login` redirects to `/todo` when a verified session exists. Only exact `/login` is matched. `/login?error=oauth` is the same pathname, so signed-in users are also bounced.

### Related Routes

- (GET) /login

### Related Screens

- SCR002_Login - Login

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✓ | - |
| Signed-in user | ✗ | Redirect to `/todo` |

### Related Modules

- src/lib/auth/decide-route-redirect.ts

---

## PERM003_TodoServerUserCheck: TodoServerUserCheck

**Type**: screen-permission
**Enforced At**: Server component `TodoContent`

### Description

Second, independent check: `supabase.auth.getUser()` (server-verified with Supabase Auth) must return a user, else redirect to `/login`. Covers proxy bypass or stale/revoked sessions that still carry valid JWT claims.

### Related Routes

- (GET) /todo

### Related Screens

- SCR003_Todo - Todo

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✗ | `error` or no user -> redirect `/login` |
| Signed-in user | ✓ | `getUser()` returns user |

### Related Modules

- src/app/todo/page.tsx
- src/lib/supabase/supabase-server-client.ts

---

## PERM004_OwnProfileOnly: OwnProfileOnly

**Type**: data-permission
**Enforced At**: `TodoContent` data source

### Description

Todo shows only the session owner's avatar, name and email. The user comes from the session cookie; no request parameter selects another user.

### Related Screens

- SCR003_Todo - Todo

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✗ | No data (redirected) |
| Signed-in user | ✓ | Own profile only |

### Related Modules

- src/app/todo/page.tsx

---

## PERM005_StartGoogleSignIn: StartGoogleSignIn

**Type**: action-permission
**Enforced At**: Client handler; no explicit role check (access governed by PERM002)

### Description

"Login with Google" starts `signInWithOAuth` with `redirectTo` fixed to `<origin>/auth/callback`. Google/Supabase perform the real authentication.

### Related Routes

- (GET) /auth/callback

### Related Screens

- SCR002_Login - Login

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✓ | Button disabled while loading |
| Signed-in user | ✗ | Cannot reach screen (PERM002) |

### Related Modules

- src/app/login/login-page-client.tsx
- src/lib/supabase/supabase-browser-client.ts

---

## PERM006_SignOut: SignOut

**Type**: action-permission
**Enforced At**: Server action `signOutAction` (no explicit role check)

### Description

Logout form posts to `signOutAction` -> `supabase.auth.signOut()` -> redirect `/login`. Button is rendered only inside the guarded Todo screen. The action itself performs no auth check (signing out with no session is harmless).

### Related Screens

- SCR003_Todo - Todo

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✓ | Reachable only by direct action POST; no-op, then redirect `/login` |
| Signed-in user | ✓ | Clears session |

### Related Modules

- src/app/todo/sign-out-action.ts

---

## PERM007_OAuthCallbackPublic: OAuthCallbackPublic

**Type**: route-guard
**Enforced At**: Proxy matcher exclusion + `resolveCallbackRedirect` (DEC-002)

### Description

`/auth/callback` is public and skips the proxy (visitor has no session yet). Authorization is the one-time `code` exchange. Redirect targets are fixed (`/todo` or `/login?error=oauth`), never user-supplied, so no open redirect.

### Related Routes

- (GET) /auth/callback

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✓ | Valid `code`, no provider error, exchange succeeds -> `/todo`; else `/login?error=oauth` |
| Signed-in user | ✓ | Same; not redirected away by proxy |

### Related Modules

- src/app/auth/callback/route.ts
- src/lib/auth/resolve-callback-redirect.ts

---

## PERM008_HomePublic: HomePublic

**Type**: route-guard
**Enforced At**: Proxy default pass-through

### Description

`/` is unguarded starter boilerplate; both roles may view it. No redirect by auth state (unresolved whether this is intended).

### Related Routes

- (GET) /

### Related Screens

- SCR001_Home - Home

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✓ | - |
| Signed-in user | ✓ | - |

---

## PERM009_LocaleSwitchPublic: LocaleSwitchPublic

**Type**: action-permission
**Enforced At**: Server action `setLocaleAction`

### Description

Anyone can set the language cookie. Input is whitelisted (`resolveLocale`), unknown values fall back to the default; raw input is never stored.

### Related Screens

- SCR002_Login - Login

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✓ | Whitelisted locale only |
| Signed-in user | ✓ | Same (action unauthenticated; screen unreachable via PERM002) |

### Related Modules

- src/lib/i18n/set-locale-action.ts
- src/lib/i18n/locale.ts

---

## PERM010_LoginCopyByLocale: LoginCopyByLocale

**Type**: locale-gate
**Enforced At**: Client state
**source:** `src/app/login/login-page-client.tsx:56` (`locale` state -> `getLoginMessages(locale)`)
**trigger:** page render / language selector change
**effect:** VN or EN login copy, including error text; no change in access

### Description

Locale selects copy only. It grants or removes no permission.

### Related Screens

- SCR002_Login - Login

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✓ | Cookie locale, default vi |
| Signed-in user | ✓ | - |

---

## PERM011_SupabaseEnvRequired: SupabaseEnvRequired

**Type**: env-gate
**Enforced At**: `getSupabaseEnv()`
**source:** `src/lib/supabase/supabase-env.ts:8-13` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
**trigger:** any Supabase client creation
**effect:** throws if either var missing; sign-in and session checks cannot run. In proxy a throw degrades to unauthenticated (BL004); in browser the login error alert shows (BL001).

### Description

Deploy-time config gate. Without it no one can authenticate.

### Permission Rules

| Role | Allow | Conditions |
|------|-------|------------|
| Visitor | ✗ | Env missing -> login fails |
| Signed-in user | ✗ | Env missing -> session check fails closed |

---

## Summary

- **Total Permission Items**: 11
- **By Type**: route-guard: 4, screen-permission: 1, action-permission: 3, data-permission: 1, role-based: 0, resource-ownership: 0, field-permission: 0, api-scope: 0, feature-flag: 0, experiment: 0, env-gate: 1, locale-gate: 1

---

## Cross-Reference Validation

- [x] All PERM### codes are unique
- [x] All PERM### codes are referenced in FeatureList.md (pending W5)
- [x] All related route references are valid (ROUTE001 /auth/callback; others from route-list.md)
- [x] All related screen references are valid (SCR001-003)
- [x] All related module references are valid
- [x] No orphaned permission references
