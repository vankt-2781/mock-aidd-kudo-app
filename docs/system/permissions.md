# Permissions

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-19
**Analysis Scope**: 3 screens, sign-in via Google, session handling

> **Curated, plain-language view.** Derived from [permissions-matrix.md](permissions-matrix.md).

## Authorization System Type

**System Type**: other (signed-in vs not signed-in only; no roles, no ownership rules)

**Identified Roles**:
- Visitor (not signed in)
- Signed-in user (verified Google account via Supabase)

## Curated View

- **Visitor** can open the home page and the login page, switch the login language (Vietnamese or English), and start "Login with Google". Visitor cannot open the Todo page; any attempt sends them to login.
- **Signed-in user** can open the home page and the Todo page, see their own name, email and avatar, and log out. A signed-in user who opens the login page is sent to Todo.
- Both groups can switch the language. It changes wording only.

## Access Boundaries

The only boundary is signed in or not. Everything under `/todo` needs a signed-in user; `/login` is for visitors only. The home page is open to all; it is unmodified starter content, and whether it should redirect is undecided.

Todo is checked twice: first on every request, then again when the page loads, by asking the sign-in service directly. If the sign-in service cannot be reached, the user is treated as signed out, so access is denied rather than granted.

A signed-in user only ever sees their own profile. There is no way to view anyone else's.

Logout is offered only on the Todo page. The logout action does not itself check who is calling, but logging out with no session does nothing harmful.

## Special Conditions

- The sign-in return step (after Google) is open to everyone because the visitor has no session yet. It only accepts a valid one-time code and always sends the user to one of two fixed pages (Todo on success, login with an error message otherwise). It cannot be pointed at an outside site.
- The app needs its two Supabase connection settings configured at deploy time. If they are missing, nobody can sign in.
- Language choice is a cookie preference and does not affect access.

No feature flags or experiments identified. Raw per-gate detail: [permissions-matrix.md](permissions-matrix.md).
