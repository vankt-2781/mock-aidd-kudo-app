---
status: draft
authored_by: takumi
created: 2026-10-28
lang: en
---

# Permissions — Open Secret Box (surgical diff for docs/system/permissions.md)

> Forward draft. Three insertions into the existing `docs/system/permissions.md`; nothing else changes. No codes assigned (PERM### TBD (draft)). Rationale belongs in an ADR, not here.

## 1. Header "Analysis Scope" — append

`; extended 2026-10-28 with Open Secret Box (signed-in-only open function with server-side badge draw, owner-only badge column)`

## 2. "Curated View" — in the **Signed-in user** bullet, replace `use "Mở quà" (placeholder dialog for now)` context and append

A signed-in user with at least one unopened Secret Box can open it from the "Mở Secret Box" button in the Kudos board sidebar or on their own Profile. Each open reveals one badge, chosen by the server, and unlocks the matching slot in their own Profile badge collection. A visitor clicking that button on the Kudos board is sent to login (no change made). Other users' boxes and badges are never readable or openable.

## 3. "Access Boundaries" — new paragraph after the Profile rules paragraph

Secret Box rules, enforced in the database as well as in the interface: opening a box is possible only through the `open_secret_box` function, which takes no input and works on the caller only: the profile is derived from the verified session, never from anything the browser sends. The function claims exactly one of the caller's own unopened boxes (concurrent calls cannot claim the same box), picks the badge by a server-side weighted random draw (Stay Gold 30%, Flow to Horizon 25%, Beyond the Boundary 10%, Root Further 5%, Touch of Light 20%, Revival 10%), records the open time and the badge, and returns the badge and the caller's remaining unopened count. It is executable by signed-in users only (visitors are refused); when the caller has no unopened box it refuses with a controlled error and changes nothing. The `badge` column on `secret_boxes` is empty for unopened boxes (and for boxes opened before this feature), accepts only the six known badge keys, and is readable only by the box owner through the existing owner-only select; no client has any insert, update or delete right on `secret_boxes`, so a badge cannot be set, changed, rerolled or read for someone else from the browser. A Sunner's badge collection unlocks from their own opened boxes only; another Sunner's Profile carries no badge or Secret Box data (default; open question whether colleagues may see badges).

## Special Conditions — add one bullet

- The badge outcome of a Secret Box open is decided and stored by the database function in one step; the client only displays the returned result and any displayed count always comes from the backend, so repeating, racing or forging requests cannot change odds or add opens.

## Matrix intent (for the reconcile pass; no codes)

| Surface | Visitor | Signed-in owner | Other signed-in user |
|---------|---------|-----------------|----------------------|
| `open_secret_box()` execute | refused | allowed (own boxes only) | n/a (acts only as self) |
| `secret_boxes` select (incl. `badge`) | refused | own rows | refused (RLS owner-only) |
| `secret_boxes` insert, update, delete | refused | refused (only via the function) | refused |
