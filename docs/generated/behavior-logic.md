# Behavior Logic

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19
**Analysis Scope**: scout-report.md § Background Logic Source Inventory (5 entries, all [SIGNAL_INFERRED]); sentinel categories skipped (custom-command, event-listener, mail, notification, observer, queue-worker, scheduled-job)

**Code Format**: All codes MUST follow `BL###_NameSlug` format (e.g., BL001_ScheduledReport, BL002_EventListener)

**Behavior Logic Types** (canonical 10 — language-neutral):
- `scheduled-job` | `queue-worker` | `event-listener` | `observer` | `mail` | `notification` | `middleware` | `custom-command` | `integration` | `webhook`

**Note**: Auth/permission middleware is NOT included — see Permissions.md. The proxy's route-guard decision is documented in permissions / screen-flow GUARD-001; only its session-cookie refresh is BL here.

**Note**: Feature and UserStory mapping is managed in FeatureList.md and UserStories.md.

**Note**: Server actions `signOutAction` (`src/app/todo/sign-out-action.ts`) and `setLocaleAction` (`src/lib/i18n/set-locale-action.ts`) are user-initiated mutations matching no canonical type; they are NOT in the scout inventory and are not BL (see screen-list.md SCR002/SCR003 service calls).

**Cardinality**: inventory 5 = BL 5 (1 per entry, Rule C1). Every entry carries `[SIGNAL_INFERRED]` (stack has no bl-source-patterns row); the tag is carried honestly with the scout's justification.

---

## Behavior Logic Index

| Code | Name | Type | Trigger |
|------|------|------|---------|
| BL001_SupabaseBrowserClient | SupabaseBrowserClient | integration | Login button click (`signInWithOAuth`) |
| BL002_SupabaseServerClient | SupabaseServerClient | integration | Server render of `/todo`, `GET /auth/callback`, sign-out action |
| BL003_ProxyRequestChain | ProxyRequestChain | middleware | Every request matching `config.matcher` |
| BL004_ProxySessionRefresh | ProxySessionRefresh | middleware | Called by BL003 on each matched request |
| BL005_OAuthCallbackHandler | OAuthCallbackHandler | webhook | Incoming `GET /auth/callback` redirect from Google/Supabase |

---

## BL001_SupabaseBrowserClient: SupabaseBrowserClient

**Type**: integration
**Trigger**: User clicks "Login with Google" on `/login` (client-side factory invoked per click)
**File Schema**: N/A — not a file-exchange type
**Source File**: src/lib/supabase/supabase-browser-client.ts
**Source Symbol**: createSupabaseBrowserClient
**Confidence**: [SIGNAL_INFERRED] — Intent: integration (external service client, Supabase Auth). No-row reason: stack=Next.js/TS, no bl-source-patterns row. Observed: `createBrowserClient(url, anonKey)` factory used for `auth.signInWithOAuth`.

### Description

Factory building a Supabase browser client from `getSupabaseEnv()` (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY). Its only consumer, `LoginPageClient.handleLogin` (`src/app/login/login-page-client.tsx:43`), calls `auth.signInWithOAuth({provider:"google", options:{redirectTo: origin + "/auth/callback"}})`. On success the browser navigates to Google; on error or throw, loading resets and the localized error alert shows.

### Related Modules

- src/lib/supabase/supabase-env.ts
- src/app/login/login-page-client.tsx
- @supabase/ssr (`createBrowserClient`)

### Related Routes

- (GET) /auth/callback (ROUTE001, OAuth `redirectTo` target)

### Related Data Models

- MODEL001_User

---

## BL002_SupabaseServerClient: SupabaseServerClient

**Type**: integration
**Trigger**: Server-side calls: `/todo` `TodoContent` (`getUser`), `GET /auth/callback` (`exchangeCodeForSession`), `signOutAction` (`signOut`)
**File Schema**: N/A — not a file-exchange type
**Source File**: src/lib/supabase/supabase-server-client.ts
**Source Symbol**: createSupabaseServerClient
**Confidence**: [SIGNAL_INFERRED] — Intent: integration (external service client). No-row reason: stack=Next.js/TS; only NestJS row exists, no decorators present. Observed: `createServerClient` bound to `cookies()` with `getAll`/`setAll`.

### Description

Async factory returning a Supabase server client whose cookie adapter reads `cookieStore.getAll()` and writes via `cookieStore.set`. Writes are wrapped in try/catch because Server Components cannot set cookies; the proxy (BL004) refreshes the session in that case. Consumers: `src/app/todo/page.tsx:10`, `src/app/auth/callback/route.ts:13`, `src/app/todo/sign-out-action.ts:8`.

### Related Modules

- src/lib/supabase/supabase-env.ts
- src/app/todo/page.tsx
- src/app/todo/sign-out-action.ts
- src/app/auth/callback/route.ts

### Related Routes

- (GET) /auth/callback (ROUTE001)

### Related Data Models

- MODEL001_User

---

## BL003_ProxyRequestChain: ProxyRequestChain

**Type**: middleware
**Trigger**: Every request matching `config.matcher` (all paths except `_next/static`, `_next/image`, `favicon.ico`, `images/`, `auth/callback`, and image extensions)
**File Schema**: N/A — not a file-exchange type
**Source File**: src/proxy.ts
**Source Symbol**: proxy
**Confidence**: [SIGNAL_INFERRED] — Intent: middleware (request chain; Next 16 `proxy` replaces `middleware`). No-row reason: stack=Next.js, no row; NestMiddleware n/a. Observed: `export async function proxy(request)` + `config.matcher`.

### Description

Request-chain entry: awaits `updateSessionInProxy` (BL004) to refresh session cookies and obtain `isAuthenticated`, then `decideRouteRedirect(pathname, isAuthenticated)`. If a target exists, returns `redirectWithCookies` (cookies preserved), otherwise passes the refreshed response through. The auth-gating decision (DEC-001) belongs to Permissions / screen-flow GUARD-001; this BL covers the request-chain/cookie-propagation behavior only.

### Related Modules

- src/lib/supabase/update-session-in-proxy.ts
- src/lib/auth/decide-route-redirect.ts

### Related Routes

- (ALL) matcher paths, incl. `/`, `/login`, `/todo`

### Related Data Models

- MODEL005_ProxySession

---

## BL004_ProxySessionRefresh: ProxySessionRefresh

**Type**: middleware
**Trigger**: Invoked by BL003 for each matched request
**File Schema**: N/A — not a file-exchange type
**Source File**: src/lib/supabase/update-session-in-proxy.ts
**Source Symbol**: updateSessionInProxy
**Confidence**: [SIGNAL_INFERRED] — Intent: middleware (cookie refresh in request chain). No-row reason: stack=Next.js, no row. Observed: `createServerClient` with request-cookie `getAll`/`setAll` and `getClaims()`.

### Description

Builds a request-scoped Supabase server client, syncs refreshed cookies onto both the request and a new `NextResponse.next({request})`, and calls `auth.getClaims()` (JWT verification, never `getSession()`). Returns `{response, isAuthenticated: !error && !!claims}`. A thrown error (Supabase unreachable) is logged and degraded to unauthenticated rather than a 500. Companion `redirectWithCookies` copies the refreshed cookies onto redirect responses (same file; helper of this BL, not a separate inventory entry).

### Related Modules

- src/proxy.ts
- src/lib/supabase/supabase-env.ts
- @supabase/ssr (`createServerClient`)

### Related Routes

- (ALL) matcher paths (see BL003)

### Related Data Models

- MODEL005_ProxySession
- MODEL001_User

---

## BL005_OAuthCallbackHandler: OAuthCallbackHandler

**Type**: webhook
**Trigger**: Incoming `GET /auth/callback?code=...` or `?error=...` redirect from Google via Supabase (excluded from proxy matcher)
**Payload**: query params `code` (authorization code) and `error` (provider error) -> redirect target
**File Schema**: N/A — not a file-exchange type
**Source File**: src/app/auth/callback/route.ts
**Source Symbol**: GET
**Confidence**: [SIGNAL_INFERRED] — Intent: webhook (incoming callback handler; an OAuth redirect, not a true webhook). No-row reason: stack=Next.js route handler, no row. Observed: `export async function GET` exchanging `code` via `exchangeCodeForSession` then redirecting.

### Description

Reads `code` and `error`; when `code` exists and no provider error, calls `createSupabaseServerClient().auth.exchangeCodeForSession(code)` in try/catch (throw -> failed). `resolveCallbackRedirect({code, providerError, exchangeFailed})` (DEC-002) yields a fixed target (`/todo` on success, `/login?error=oauth` otherwise), returned as `NextResponse.redirect`. Targets are never user-supplied (no open redirect).

### Related Modules

- src/lib/auth/resolve-callback-redirect.ts
- src/lib/supabase/supabase-server-client.ts (BL002)

### Related Routes

- (GET) /auth/callback (ROUTE001)

### Related Data Models

- MODEL006_CallbackOutcome
- MODEL001_User

---

## Summary

- **Total Behavior Logic Items**: 5
- **By Type**: custom-command: 0, event-listener: 0, integration: 2, mail: 0, middleware: 2, notification: 0, observer: 0, queue-worker: 0, scheduled-job: 0, webhook: 1

---

## Cross-Reference Validation

- [x] All BL### codes are unique
- [x] All BL### codes are referenced in UserStories.md (type=system)  <!-- pending W4/W5 -->
- [x] All BL### codes are referenced in FeatureList.md  <!-- pending W5 -->
- [x] All related route references are valid (ROUTE001 in route-list.md)
- [x] All related data model references are valid (MODEL001, 005, 006 in data-model.md)
- [x] No orphaned behavior logic references
- [x] All BL items have Source File + Source Symbol fields (Rule C2)
- [x] All Source File paths match scout Background Logic Source Inventory entries (Rule C2/C3)

---

## Client-Side Logic

### Debounce / Throttle

N/A — no debounce or throttle patterns detected.

### Optimistic UI

BL-C01 — Locale switch optimistic update
```
pattern: optimistic-ui
source: src/app/login/login-page-client.tsx:56
trigger: user picks VN/EN in LanguageSelector
optimistic-action: setLocale(next) updates messages immediately; setLocaleAction persists cookie in startTransition
rollback: none — on failure only console.error; UI stays on new locale, cookie unsaved
```

### Polling

N/A — no polling patterns detected.

### Upload Progress

N/A — no upload progress patterns detected.

### Realtime (WebSocket / SSE / EventSource)

N/A — no realtime patterns detected.

### Other (non-canonical client patterns)

```
BL-C02 — bfcache loading reset
source: src/app/login/login-page-client.tsx:30
trigger: window `pageshow` with event.persisted
action: setLoading(false) so the Login button is not stuck after Back from Google; listener removed on unmount

BL-C03 — html lang sync
source: src/app/login/login-page-client.tsx:25
trigger: locale state change
action: document.documentElement.lang = locale
```
