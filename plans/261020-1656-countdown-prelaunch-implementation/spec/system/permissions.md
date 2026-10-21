---
status: draft
authored_by: takumi
created: 2026-10-20
lang: en
---

# Permissions

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-20
**Analysis Scope**: forward draft for the Countdown - Prelaunch feature; adds a pre-launch gate on top of the existing visitor / signed-in user / admin model

> **Curated, plain-language view.** Derived from the permissions matrix once code exists; no codes are assigned yet (PERM### TBD (draft)).

## Authorization System Type

**System Type**: rbac (two ordinary groups plus one admin role; no ownership rules), with a time-based launch gate

**Identified Roles**:
- Visitor (not signed in)
- Signed-in user (verified Google account via Supabase)
- Admin (signed-in user whose Supabase account metadata marks the role as admin)

## Curated View

- **Before the launch time**
  - **Visitor** and **signed-in user** are sent to the Countdown page when they open any page other than the Countdown page, the login page, the sign-in return step, the API routes and static files. They can still open the login page, and the Countdown page itself.
  - **Admin** browses the whole site normally, exactly as after launch.
- **From the launch time on** the gate is gone. All groups get the access described below, and the Countdown page sends everyone to the homepage.
- **Visitor** can open the homepage, the Awards and Kudos placeholder pages and the login page, and switch the language. Visitor sees no notification bell and no account menu. Visitor cannot open the Todo page.
- **Signed-in user** can do everything a visitor can, plus see the notification bell (empty, no badge for now), open the account menu (Profile, Sign out) and open the Todo page. A signed-in user who opens the login page is sent to Todo.
- **Admin** can do everything a signed-in user can, and also sees Admin Dashboard in the account menu.
- All groups can switch the language. It changes wording only.

## Access Boundaries

Before launch, the line between admin and everyone else decides whether the site is browsable at all: only admins pass the launch gate. After launch the homepage is public: no sign-in is needed, and being signed in does not redirect away from it. The line between visitor and signed-in user decides whether the bell and account menu appear. The line between signed-in user and admin decides whether Admin Dashboard appears.

The admin marker lives in the Supabase account metadata that users cannot edit themselves; it is set by the team (Supabase Studio or admin API). The launch gate reads it from the verified session, never from user-editable profile data. Hiding the menu item only guides the interface; the Admin Dashboard page itself must also refuse non-admins on the server (route details TBD). Profile and Admin Dashboard are placeholder pages for now.

Everything under Todo still needs a signed-in user. Login is for visitors only. If the sign-in service cannot be reached, the user is treated as a visitor, so access is denied rather than granted; before launch this also means the user is held on the Countdown page. Sign out is available from the homepage account menu as well as the Todo page, using the same existing action.

The launch time is a deploy-time server setting, readable by anyone through a public configuration route that returns only the start time. It carries no secret and grants no access.

## Special Conditions

- The sign-in return step (after Google) is open to everyone, before and after launch, and always sends the user to one of two fixed pages; successful sign-in still goes to Todo, not the homepage.
- The login page stays reachable before launch so admins can sign in and users with an expired session are not stuck.
- The launch gate is checked first. Before launch, a non-admin outside the excluded pages goes to the Countdown page before any other rule applies. After launch the existing login and Todo rules behave exactly as before.
- An invalid or missing launch time means "no gate" (treated as already launched), so a misconfiguration cannot lock the whole site out.
- Language choice is a cookie preference and does not affect access.
- A user whose admin marker is missing or has any other value is treated as a regular signed-in user.

No feature flags or experiments identified.
