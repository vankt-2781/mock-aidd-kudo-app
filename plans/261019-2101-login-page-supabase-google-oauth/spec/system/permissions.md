---
status: draft
authored_by: takumi
created: 2026-10-19
lang: en
---

# Permissions

**Project**: SAA 2025 app (mock-aidd-kudo-app)
**Generated**: 2026-10-19
**Analysis Scope**: Login with Google feature (draft; greenfield)

> **Curated, plain-language view.** No permission codes are assigned yet (`TBD (draft)`); they are allocated when the raw matrix is generated from code.

## Authorization System Type

**System Type**: `other` — authentication-only route guard (signed in or not); there are no roles, ownership, or policies.

**Identified Roles**:
- Visitor (not signed in)
- Signed-in user (any Google account)

## Curated View

- **Visitor** can open the Login screen, change its language, and start Google sign-in. A visitor cannot open the Todo placeholder page; they are sent to the Login screen.
- **Signed-in user** can open the Todo placeholder page, see their own account details, and sign out. A signed-in user cannot stay on the Login screen; they are sent to the Todo placeholder page.

Route rules:
- Login screen (`/login`): public for visitors only; signed-in users are redirected to `/todo`.
- Todo placeholder (`/todo`): signed-in users only; visitors are redirected to `/login`.
- Auth callback (proposed `/auth/callback`, TBD (draft)): public entry that completes sign-in; outside the guard.
- Static assets: not guarded.

## Access Boundaries

The single boundary is "has a valid session". Any Google account that completes authentication gets a session; there is no allow-list, domain restriction, or approval step. The guard is enforced server-side in middleware on every page request, not only in the UI. Session cookies are refreshed there. After sign-out, the session is gone and guarded pages are unreachable. No return-to-original-page behavior: the landing target after sign-in is always `/todo`.

## Special Conditions

- Environment gate: sign-in only works once `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are filled in the environment; until then sign-in fails with the generic error message.
- Locale: the language cookie (`vi` | `en`) changes Login screen text only and never affects access.
- No other special conditions identified.
