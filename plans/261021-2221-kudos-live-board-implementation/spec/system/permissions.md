---
status: draft
authored_by: takumi
created: 2026-10-21
lang: en
---

# Permissions

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-21
**Analysis Scope**: forward draft for the Kudos live board feature; adds public viewing with sign-in-gated interactions and ownership rules on top of the existing visitor / signed-in user / admin model and the pre-launch gate

> **Curated, plain-language view.** Derived from the permissions matrix once code exists; no codes are assigned yet (PERM### TBD (draft)).

## Authorization System Type

**System Type**: rbac (two ordinary groups plus one admin role), with a time-based launch gate and two ownership rules on the Kudos board (a sender cannot like their own kudos; personal stats belong to their owner)

**Identified Roles**:
- Visitor (not signed in)
- Signed-in user (verified Google account via Supabase)
- Admin (signed-in user whose Supabase account metadata marks the role as admin)

## Curated View

- **Before the launch time**
  - **Visitor** and **signed-in user** are sent to the Countdown page when they open any page other than the Countdown page, the login page, the sign-in return step, the API routes and static files. They can still open the login page, and the Countdown page itself.
  - **Admin** browses the whole site normally, exactly as after launch.
- **From the launch time on** the gate is gone. All groups get the access described below, and the Countdown page sends everyone to the homepage.
- **Visitor** can open the homepage, the Awards page, the Kudos board and the login page, and switch the language. On the Kudos board a visitor can read everything public: banner, highlight carousel, filters, spotlight (hover, pan, zoom, search), feed, thumbnails in full size, the gift list, and copy a kudos link. "Mở quà" is visible to visitors but goes to login. A visitor cannot like or unlike, use the input pill, press "Mở quà", or open a kudos detail or a person's profile: each of these sends the visitor to the login page (carrying a return-to path back to the board), with no change made. A visitor sees no personal stats, no notification bell and no account menu. Visitor cannot open the Todo page.
- **Signed-in user** can do everything a visitor can, plus see the notification bell (empty, no badge for now), open the account menu (Profile, Sign out), open the Todo page, and on the Kudos board: like and unlike other people's kudos, see their own personal stats (kudos received and sent, hearts received, Secret Boxes opened and unopened), use the input pill and "Mở quà" (placeholder dialogs for now), and open kudos details and profiles (placeholders). A signed-in user who opens the login page is sent to Todo.
- **Sender of a kudos** (a signed-in user looking at a kudos they wrote) cannot like it: the heart is disabled and the server refuses it.
- **Admin** can do everything a signed-in user can, also sees Admin Dashboard in the account menu, and is the group meant to configure special days (double hearts) once an admin screen exists; for now special days are seeded data.
- All groups can switch the language. It changes wording only.

## Access Boundaries

Before launch, the line between admin and everyone else decides whether the site is browsable at all: only admins pass the launch gate. After launch the homepage and the Kudos board are public: no sign-in is needed to read them, and being signed in does not redirect away from them. The line between visitor and signed-in user decides whether the bell, account menu, personal stats and every Kudos interaction are available. The line between signed-in user and admin decides whether Admin Dashboard appears.

Kudos data rules, enforced in the database as well as in the interface: everyone may read the kudos domain data (people, departments, hashtags, kudos, likes, gift events, special days); only a signed-in user may add or remove a like, only as themselves, only on a kudos they did not send, and at most one like per user per kudos. Nobody can write kudos, hashtags, events or special days from the app yet (those writers belong to later tasks; data is seeded). Personal stats are computed only for the signed-in viewer's own profile and never for anyone else; Secret Box counts are readable only by their owner.

The admin marker lives in the Supabase account metadata that users cannot edit themselves; it is set by the team (Supabase Studio or admin API). The launch gate reads it from the verified session, never from user-editable profile data. Hiding the menu item only guides the interface; the Admin Dashboard page itself must also refuse non-admins on the server (route details TBD). Profile and Admin Dashboard are placeholder pages for now.

Everything under Todo still needs a signed-in user. Login is for visitors only. If the sign-in service cannot be reached, the user is treated as a visitor, so access is denied rather than granted: on the Kudos board this means gated actions send the user to login, and before launch the user is held on the Countdown page. Sign out is available from the homepage account menu as well as the Todo page, using the same existing action.

The launch time is a deploy-time server setting, readable by anyone through a public configuration route that returns only the start time. It carries no secret and grants no access.

## Special Conditions

- The sign-in return step (after Google) is open to everyone, before and after launch. It sends the user to Todo by default, or to a return-to path when the login link carries one that is an exact member of a small internal allow-list (at least the Kudos board). Anything else (missing, external, malformed) is ignored and the user lands on Todo, so no open redirect is possible. A visitor redirected from a gated Kudos action therefore comes back to the board after signing in.
- The login page stays reachable before launch so admins can sign in and users with an expired session are not stuck.
- The launch gate is checked first. Before launch, a non-admin outside the excluded pages goes to the Countdown page before any other rule applies. After launch the existing login and Todo rules behave exactly as before; the Kudos board adds no route-level guard, only per-action gating.
- An invalid or missing launch time means "no gate" (treated as already launched), so a misconfiguration cannot lock the whole site out.
- A profile record is created automatically on a user's first sign-in, so a new user can like and see stats at once.
- The identity used for a like comes from the verified session on the server, never from anything the browser sends.
- Unliking revokes exactly the hearts that like awarded (1 or 2), whatever the special-day setting is later.
- Language choice is a cookie preference and does not affect access.
- A user whose admin marker is missing or has any other value is treated as a regular signed-in user.

No feature flags or experiments identified.
