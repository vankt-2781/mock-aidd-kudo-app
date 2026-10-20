**Project**: kudo-scaffold (mock-aidd-kudo-app)
**Generated**: 2026-10-19
**Architecture Type**: Single-app server-rendered monolith (Next.js App Router) using Supabase Auth as a BaaS identity provider; no custom backend service, no application database tables

## Executive Summary

kudo-scaffold is a Next.js 16 (App Router, React 19, TypeScript, Tailwind 4) application whose only implemented capability is "Login with Google" (F001). An unauthenticated visitor sees the `/login` screen (vi/en, default vi), clicks the Google button, is sent through Supabase Auth to Google, returns via `/auth/callback` where the authorization code is exchanged for a session cookie, and lands on `/todo`, a placeholder page showing the user's name, email, avatar and a Logout button. A request proxy (`src/proxy.ts`) refreshes the session on every page request and enforces two guard rules: `/login` with session redirects to `/todo`; `/todo` (and subpaths) without session redirects to `/login`.

Identity is delegated entirely to Supabase Auth (local stack via Supabase CLI, `supabase/config.toml`) with Google as the sole provider. The app owns no tables; user records live in Supabase's `auth` schema. Login-screen text is localized by a small in-repo dictionary (no i18n library) with the choice persisted in an httpOnly `NEXT_LOCALE` cookie. `/` is still the unmodified create-next-app template page (not wired to the auth flow). Tests are Vitest unit tests (node env) for the pure decision/mapping modules only.

Source footprint: about 35 source files under `src/` (routes, 5 login components, `lib/auth`, `lib/i18n`, `lib/supabase`) plus Supabase config.

For architecture diagrams and tech stack details, see [architecture.md](architecture.md).

## Key Design Decisions

### Decision 1: Delegate authentication to Supabase Auth with Google OAuth (PKCE code flow)

**Context**: The product needs sign-in with a Google account only, with no password, registration or user-management UI in scope.

**Decision**: The browser client calls `signInWithOAuth({provider: "google", redirectTo: <origin>/auth/callback})`; the server route `GET /auth/callback` runs `exchangeCodeForSession(code)` through `@supabase/ssr`, which writes the session cookies. Google client id/secret are read by the Supabase CLI from env (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`); the app itself only holds `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. `additional_redirect_urls` allow-lists the callback.

**Rationale**: Removes custom credential handling and token storage; cookie-based sessions work in Server Components, route handlers and the proxy alike. (Source: `src/app/login/login-page-client.tsx`, `src/app/auth/callback/route.ts`, `supabase/config.toml`.)

### Decision 2: Route guard in the Next.js proxy, with JWT-verified identity and a defense-in-depth check

**Context**: Protected pages must not render for anonymous users, and an already signed-in user should skip `/login`.

**Decision**: `src/proxy.ts` (Next 16 `proxy` convention, successor to middleware) calls `updateSessionInProxy`, which uses `supabase.auth.getClaims()` (JWT verification, never `getSession()`) and treats any error or network throw as "unauthenticated". The pure function `decideRouteRedirect(pathname, isAuthenticated)` (DEC-001) picks the redirect; `redirectWithCookies` carries refreshed cookies onto redirects. The matcher excludes static assets, `images/` and `auth/callback`. `/todo` additionally calls `getUser()` server-side and redirects to `/login` if the session was revoked.

**Rationale**: Keeps guard logic unit-testable and free of Supabase types; degrading to "unauthenticated" avoids 500s when the local stack is down; the second check catches revoked sessions that a valid-signature JWT would still pass.

### Decision 3: Fixed-target callback redirects (no open redirect) with a single generic error signal

**Context**: The callback receives untrusted query params (`code`, `error`) and can fail in several ways (user cancel, provider error, missing code, exchange failure).

**Decision**: `resolveCallbackRedirect` (DEC-002) returns only `/todo` on success or `/login?error=oauth` on any failure; no user-supplied `next`/redirect parameter is honored. `hasLoginError` on the login page reads the flag and shows one localized error message.

**Rationale**: Eliminates open-redirect risk and avoids leaking provider error details; one error state keeps the UI simple (YAGNI).

### Decision 4: In-repo vi/en dictionary with cookie-persisted locale instead of an i18n library

**Context**: Only the login screen is localized; locale must survive reloads and render correctly on the server.

**Decision**: `LOCALES = ["vi","en"]`, default `vi`, cookie `NEXT_LOCALE` (httpOnly, sameSite lax, 1 year) written only by the `setLocaleAction` server action. `resolveLocale` (BR-003) whitelists values; the login page reads the cookie server-side (`getRequestLocale`) and passes `initialLocale` to the client component, which also updates `document.documentElement.lang` since the root layout is fixed at `lang="en"`.

**Rationale**: Avoids a dependency and routing changes for two languages on one screen; whitelist makes tampered cookies harmless.

### Decision 5: Next.js `cacheComponents` (Partial Prerendering style) with Suspense around dynamic access

**Context**: `next.config.ts` enables `cacheComponents: true` and `partialPrefetching: true`, which require cookie/`searchParams` access to be inside `<Suspense>`.

**Decision**: `/login/page.tsx` and `/todo/page.tsx` each wrap their dynamic content (`LoginPageContent`, `TodoContent`) in `<Suspense>`; static shell renders immediately.

**Rationale**: Follows the framework's required pattern for this config; also explains why the login shell is a thin server wrapper around a large client component.

## Security Overview

- **Authentication**: Supabase Auth, Google OAuth only (authorization-code exchange). Server trusts `getClaims()` / `getUser()`, not `getSession()`. Sessions are Supabase-managed cookies via `@supabase/ssr`; `jwt_expiry` is 3600s in local config.
- **Authorization**: Binary authenticated/anonymous route guard only (no roles, ownership, or RBAC). Rules: `/login` + session -> `/todo`; `/todo` and `/todo/*` + no session -> `/login`. See [permissions.md](permissions.md).
- **Data Encryption**: No app-level encryption. Transport/at-rest protection is delegated to Supabase and Google; the local stack runs over plain HTTP (`127.0.0.1:54321`, `localhost:3000`). Production TLS is not configured in this repo.
- **API Security**: Only one app endpoint (`GET /auth/callback`). Redirect targets are hard-coded (no open redirect). Server action `setLocaleAction` whitelists input. `signOutAction` clears the session, logs failures server-side and always redirects to `/login`. `next/image` remote hosts limited to `*.googleusercontent.com`, and `getDisplayUser` rejects avatar URLs outside that host (user-editable metadata could otherwise crash `/todo`). Secrets are env-only; `.env.example` holds placeholders (anon key is empty by default). No CSRF token beyond framework defaults for server actions, no rate limiting, no CSP (not implemented).

## Scalability

- **Current Capacity**: Not defined. Single Next.js instance against a local Supabase stack, intended for development; no deployment target, load test or capacity figure exists in the repo.
- **Scaling Strategy**: None implemented. The app is stateless (session in cookies, state in Supabase), so horizontal scaling of Next.js is possible in principle; Supabase scaling is outside this repo. Proxy runs one `getClaims()` call per page request (local JWT verification, plus network on key fetch/refresh).
- **Performance Targets**: None specified in code or config.

## Observations and Gaps (for downstream reviewers)

- Existing `docs/system/architecture.md` says "Next.js 15" and "middleware"; code is Next 16.4.2 with `src/proxy.ts`. Treat code as authoritative.
- `login-page-client.tsx` uses `font-[family-name:var(--font-montserrat)]`; the variable is defined in `src/app/login/layout.tsx` (next/font Montserrat scoped to /login), so the style resolves correctly.
- Root layout metadata is still "Create Next App"; `/` is the starter template and is not redirected to `/login` or `/todo`.
- No OAuth `state`/nonce handling is implemented by the app beyond Supabase defaults (`skip_nonce_check = false` in config).
