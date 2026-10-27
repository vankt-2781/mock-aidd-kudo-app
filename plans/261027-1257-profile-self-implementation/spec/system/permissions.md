---
status: draft
authored_by: takumi
created: 2026-10-27
lang: en
---

# Permissions

**Project**: kudo-scaffold (Next.js 16 App Router + Supabase auth)
**Generated**: 2026-10-27
**Analysis Scope**: forward draft for the Profile page (self and other face); adds a private `/profile` area, a caller-scoped "own sent kudos" database view, and the other-profile anonymity boundary on top of the existing visitor / signed-in user / admin model, the pre-launch gate, and the Kudos board rules

> **Curated, plain-language view.** Derived from the permissions matrix once code exists; no codes are assigned yet (PERM### TBD (draft)).

## Authorization System Type

**System Type**: rbac (two ordinary groups plus one admin role), with a time-based launch gate and ownership rules (a person's Sent list belongs only to them; a colleague's profile exposes received kudos only and no counts; the sender of an anonymous kudos is hidden everywhere except their own Sent list)

**Identified Roles**:
- Visitor (not signed in)
- Signed-in user (verified Google account via Supabase)
- Admin (signed-in user whose Supabase account metadata marks the role as admin)

## Curated View

- **Visitor** cannot open `/profile` in any form (own, other, or sub-path): the route guard sends them to `/login?next=%2Fprofile`. After sign-in they return to their own profile; any `?id` they carried is dropped.
- **Signed-in user** can open `/profile`.
  - Own profile (no `id`, empty `id`, or their own id in any letter case): hero, locked badges, five personal counters (including anonymous sends, and Secret Box counts from their own boxes), and a KUDOS section where they choose Received or Sent. Sent includes their own anonymous kudos, shown with their real name and an "Ẩn danh" chip.
  - Another person's profile (`?id` of someone else): hero, locked badges, a bar to open the Viết Kudo dialog with that person chosen, and a Received-only list under a plain "Đã nhận" label. No counts of any kind are shown, and no Sent view exists for others, so nobody can compare totals to deduce who sent anonymously.
- **Admin** has the same profile access as a signed-in user; no admin-specific profile view.
- All groups: language switch changes wording only.

## Access Boundaries

The line between visitor and signed-in user decides whether any profile can be opened at all. The line between "me" and "someone else" decides what the page shows: only the owner sees counters, Sent, and Secret Box numbers. A colleague's page is read-only and shows received kudos only.

Sent-list rule, enforced twice: (1) the page action returns an empty result unless the requested profile is the caller's own (compared case-insensitively); (2) the database view `own_sent_kudos` is definer-executed but filters to the caller's own profile derived from the verified session, so a forged id, a second session, or a direct query can never return someone else's sent kudos. The view is readable by signed-in users only, not visitors. Its columns mirror the board feed so the same pagination and card mapping apply; real sender fields are returned only because every row is the caller's own.

Other-profile anonymity rule: received lists on any profile use the existing masked feed, so anonymous kudos show the alias and default avatar with no sender link. The lookup for another person reads public profile columns and stars only; it never reads their kudos-sent, kudos-received or hearts totals, and the page output carries no email and no sign-in account id.

Route guard rule: `/profile` and everything beneath it need a signed-in user at the route level, and the page re-checks the session itself (defense in depth).

## Special Conditions

- The sign-in return step accepts a return-to path only when it is an exact member of the internal allow-list. `/profile` joins `/kudos` as an exact entry. A value such as `/profile?id=...`, `/profile/x`, an external URL or a malformed value is not an exact match and is ignored (user lands on Todo), so there is no open redirect and a carried `id` is never replayed.
- The launch gate is checked first, unchanged: before launch, non-admins outside the excluded pages go to the Countdown page before any profile rule applies.
- An unknown, malformed, repeated, whitespace or unloadable `id` shows one identical not-found page with no cause, so profile existence cannot be probed by the shape of the error. The shape of an `id` is validated before any database query.
- The identity used for Sent, hearts and the write-Kudo dialog comes from the verified session on the server, never from the browser. The preselected recipient in the dialog is only a convenience: the send action re-validates the recipient as before (exists, not the sender).
- A signed-in user may not heart their own kudos, including their own anonymous kudos shown in Sent.
- If the sign-in service cannot be reached, the user is treated as a visitor: `/profile` redirects to login.
- The Secret Box counters on the own profile read only the owner's own boxes; nothing about boxes is shown on another person's page. The "Mở Secret Box" button is disabled and sends no request.
- The profile page performs no writes of its own; sending a Kudo and hearting reuse the existing guarded actions.
- Detail rationale (why a definer view plus action check rather than a column grant, why no counts on other profiles) belongs in a decision record, not here.

No feature flags or experiments identified.
