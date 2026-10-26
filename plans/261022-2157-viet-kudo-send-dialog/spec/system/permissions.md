---
status: draft
authored_by: takumi
created: 2026-10-22
lang: en
---

# Permissions

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-22
**Analysis Scope**: forward draft for the Kudos live board and the Viết Kudo send dialog; adds sending kudos (sign-in required, no self-kudos, anonymous identity protection, image storage rules) on top of public viewing with sign-in-gated interactions and the existing visitor / signed-in user / admin model and the pre-launch gate

> **Curated, plain-language view.** Derived from the permissions matrix once code exists; no codes are assigned yet (PERM### TBD (draft)).

## Authorization System Type

**System Type**: rbac (two ordinary groups plus one admin role), with a time-based launch gate and ownership rules on the Kudos board (a sender cannot like their own kudos; personal stats belong to their owner; a sender cannot send a kudos to themselves; the sender of an anonymous kudos is hidden from every public surface)

**Identified Roles**:
- Visitor (not signed in)
- Signed-in user (verified Google account via Supabase)
- Admin (signed-in user whose Supabase account metadata marks the role as admin)

## Curated View

- **Before the launch time**
  - **Visitor** and **signed-in user** are sent to the Countdown page when they open any page other than the Countdown page, the login page, the sign-in return step, the API routes and static files. They can still open the login page, and the Countdown page itself.
  - **Admin** browses the whole site normally, exactly as after launch.
- **From the launch time on** the gate is gone. All groups get the access described below, and the Countdown page sends everyone to the homepage.
- **Visitor** can open the homepage, the Awards page, the Kudos board and the login page, and switch the language. On the Kudos board a visitor can read everything public: banner, highlight carousel, filters, spotlight (hover, pan, zoom, search), feed, thumbnails in full size, the gift list, and copy a kudos link. "Mở quà" is visible to visitors but goes to login. A visitor cannot like or unlike, use the input pill to compose a kudos, press "Mở quà", or open a kudos detail or a person's profile: each of these sends the visitor to the login page (carrying a return-to path back to the board), with no change made. A visitor sees no personal stats, no notification bell and no account menu. Visitor cannot open the Todo page.
- **Signed-in user** can do everything a visitor can, plus see the notification bell (empty, no badge for now), open the account menu (Profile, Sign out), open the Todo page, and on the Kudos board: like and unlike other people's kudos, see their own personal stats (kudos received and sent, hearts received, Secret Boxes opened and unopened), use the input pill to open the Viết Kudo dialog and send a kudos (to anyone except themselves, optionally anonymously, with up to 5 jpg or png images of at most 5 MB each uploaded to their own storage folder), use "Mở quà" (placeholder dialog for now), and open kudos details and profiles (placeholders). A signed-in user who opens the login page is sent to Todo.
- **Sender of a kudos** (a signed-in user looking at a kudos they wrote) cannot like it: the heart is disabled and the server refuses it. This also holds for an anonymous kudos: the sender still sees a disabled heart, decided by a server-side flag computed from their own session, not by any public sender field.
- **Anonymous kudos**: any viewer, including the recipient and the sender's colleagues, sees only the alias (the name the sender typed, or "Ẩn danh") and the default avatar; no sender name, avatar, department, stars, profile link or id is returned by any public read path.
- **Admin** can do everything a signed-in user can, also sees Admin Dashboard in the account menu, and is the group meant to configure special days (double hearts) once an admin screen exists; for now special days are seeded data.
- All groups can switch the language. It changes wording only.

## Access Boundaries

Before launch, the line between admin and everyone else decides whether the site is browsable at all: only admins pass the launch gate. After launch the homepage and the Kudos board are public: no sign-in is needed to read them, and being signed in does not redirect away from them. The line between visitor and signed-in user decides whether the bell, account menu, personal stats and every Kudos interaction are available. The line between signed-in user and admin decides whether Admin Dashboard appears.

Kudos data rules, enforced in the database as well as in the interface: everyone may read the kudos domain data (people, departments, hashtags, kudos, likes, gift events, special days); only a signed-in user may add or remove a like, only as themselves, only on a kudos they did not send, and at most one like per user per kudos. A signed-in user can write a kudos only through the send function, and only as themselves: the sender is taken from the verified session on the server, the recipient must be an existing person other than the sender, 1 to 5 hashtags are required (new hashtags are created by that same function), and at most 5 images are accepted, each already stored in the user's own storage folder. Nobody can write hashtags, kudos links, events or special days any other way (gift events and special days stay seeded). Image storage: anyone can read uploaded images (public bucket); only a signed-in user can upload, only into a folder named after their own account, only jpg or png, at most 5 MB each; visitors cannot upload. For anonymous kudos the sender identity is withheld from visitors and signed-in users alike on every public surface (cards, highlights, spotlight, public stats, direct view or table queries); the database keeps the sender for accountability (direct select of the sender column is revoked from visitors and signed-in users; reads go through masked views) but exposes it only to database administrators, and no admin screen reads it yet. Personal stats are computed only for the signed-in viewer's own profile and never for anyone else; Secret Box counts are readable only by their owner.

The admin marker lives in the Supabase account metadata that users cannot edit themselves; it is set by the team (Supabase Studio or admin API). The launch gate reads it from the verified session, never from user-editable profile data. Hiding the menu item only guides the interface; the Admin Dashboard page itself must also refuse non-admins on the server (route details TBD). Profile and Admin Dashboard are placeholder pages for now.

Everything under Todo still needs a signed-in user. Login is for visitors only. If the sign-in service cannot be reached, the user is treated as a visitor, so access is denied rather than granted: on the Kudos board this means gated actions send the user to login, and before launch the user is held on the Countdown page. Sign out is available from the homepage account menu as well as the Todo page, using the same existing action.

The launch time is a deploy-time server setting, readable by anyone through a public configuration route that returns only the start time. It carries no secret and grants no access.

## Special Conditions

- The sign-in return step (after Google) is open to everyone, before and after launch. It sends the user to Todo by default, or to a return-to path when the login link carries one that is an exact member of a small internal allow-list (at least the Kudos board). Anything else (missing, external, malformed) is ignored and the user lands on Todo, so no open redirect is possible. A visitor redirected from a gated Kudos action therefore comes back to the board after signing in.
- The login page stays reachable before launch so admins can sign in and users with an expired session are not stuck.
- The launch gate is checked first. Before launch, a non-admin outside the excluded pages goes to the Countdown page before any other rule applies. After launch the existing login and Todo rules behave exactly as before; the Kudos board adds no route-level guard, only per-action gating.
- An invalid or missing launch time means "no gate" (treated as already launched), so a misconfiguration cannot lock the whole site out.
- A profile record is created automatically on a user's first sign-in, so a new user can like and see stats at once.
- The identity used for a like or a sent kudos comes from the verified session on the server, never from anything the browser sends.
- Content typed in the editor is untrusted: the server strips everything outside an allow-list (basic formatting, safe http, https and mailto links, mention spans) before it is stored.
- Image addresses submitted with a kudos are accepted only when they point into the project's own `kudos-images` bucket under the sender's own folder.
- Mentions are styled text only: they grant no access and send no notification.
- Hiding anonymity must not leak through side channels: the public per-person "kudos sent" total counts non-anonymous kudos only, while a signed-in user's own sidebar total counts everything they sent (owner-only query).
- A guest who clicks the compose pill is sent to the login page with a return-to path back to the board and no dialog opens.
- Unliking revokes exactly the hearts that like awarded (1 or 2), whatever the special-day setting is later.
- Language choice is a cookie preference and does not affect access.
- A user whose admin marker is missing or has any other value is treated as a regular signed-in user.

No feature flags or experiments identified.
