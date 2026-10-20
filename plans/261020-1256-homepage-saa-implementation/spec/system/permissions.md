---
status: draft
authored_by: takumi
created: 2026-10-20
lang: en
---

# Permissions

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-20
**Analysis Scope**: forward draft for the Homepage SAA feature; extends the existing signed-in versus not-signed-in model with an admin role

> **Curated, plain-language view.** Derived from the permissions matrix once code exists; no codes are assigned yet.

## Authorization System Type

**System Type**: rbac (two ordinary groups plus one admin role; no ownership rules)

**Identified Roles**:
- Visitor (not signed in)
- Signed-in user (verified Google account via Supabase)
- Admin (signed-in user whose Supabase account metadata marks the role as admin)

## Curated View

- **Visitor** can open the homepage, the Awards and Kudos placeholder pages and the login page, and switch the language. Visitor sees no notification bell and no account menu. Visitor cannot open the Todo page.
- **Signed-in user** can do everything a visitor can, plus see the notification bell (empty, no badge for now), open the account menu (Profile, Sign out) and open the Todo page. A signed-in user who opens the login page is sent to Todo.
- **Admin** can do everything a signed-in user can, and also sees Admin Dashboard in the account menu.
- All groups can switch the language. It changes wording only.

## Access Boundaries

The homepage is public: no sign-in is needed, and being signed in does not redirect away from it. The line between visitor and signed-in user decides whether the bell and account menu appear. The line between signed-in user and admin decides whether Admin Dashboard appears.

The admin marker lives in the Supabase account metadata that users cannot edit themselves; it is set by the team (Supabase Studio or admin API). Hiding the menu item only guides the interface; the Admin Dashboard page itself must also refuse non-admins on the server (route details TBD). Profile and Admin Dashboard are placeholder pages for now.

Everything under Todo still needs a signed-in user. Login is for visitors only. If the sign-in service cannot be reached, the user is treated as a visitor, so access is denied rather than granted. Sign out is now available from the homepage account menu as well as the Todo page, using the same existing action.

## Special Conditions

- The sign-in return step (after Google) is open to everyone and always sends the user to one of two fixed pages; successful sign-in still goes to Todo, not the homepage.
- The countdown target is a deploy-time setting; an invalid value shows zeros and has no access impact.
- Language choice is a cookie preference and does not affect access.
- A user whose admin marker is missing or has any other value is treated as a regular signed-in user.

No feature flags or experiments identified.
