# Phase 02 — Server layer: badge catalog, open action, own-badge query

## Context Links
- Spec: FR-008, FR-009, FR-010, FR-017, BR-004; Data and API section
- Decisions: server action wraps `supabase.rpc` under user session; self face only; names developer-draft (PM-review)
- Precedent: `src/lib/kudos/kudos-actions.ts` (`toggleKudosLike`: getUser gate, `mapRpcError`, payload shape check), `src/lib/kudos/kudos-board-queries.ts` (`getViewerStats`), `src/lib/profile/profile-queries.ts`
- Slot type: `src/components/profile/profile-types.ts` `ProfileBadgeSlot {id,label,unlocked,imageSrc}`

## Overview
Priority P1 · Status complete · Outcome: `src/lib/secret-box/` catalog + action + query landed with 26 unit tests green.

## Key Insights
- `lib → components` type imports already exist (`kudos-board-types.ts`), so the catalog may return `ProfileBadgeSlot`.
- Pages are dynamic (cookies); no `revalidatePath` exists yet. Per clarification add `revalidatePath("/kudos")` + `revalidatePath("/profile")` in the action (cheap, harmless) — confirm signature against Next 16 web docs (`node_modules/next/dist/docs` is blocked by `.tkmignore`).
- Badge display names are the English design names in both locales (proper nouns) → one `name` per key, no dictionary entry.

## Requirements
- Catalog (pure, client-safe): ordered `SECRET_BOX_BADGE_KEYS`, `isBadgeKey(x)`, `badgeFor(key) → {key,name,imageUrl}` (unknown/null → fallback `{key:"unknown", name:"Secret Box badge", imageUrl: FALLBACK}`), `toBadgeSlots(keys: string[]) → ProfileBadgeSlot[6]` in fixed order (`unlocked` iff key present; duplicates/unknown ignored).
- Action `openSecretBoxAction()` (`"use server"`, no args): getUser → none ⇒ `unauthenticated`; rpc; map errors (`no_unopened_box` ⇒ `empty`; 28000/`no_profile` ⇒ `unauthenticated`; else log + `error`); validate payload (`isBadgeKey` not required — unknown key passes through, UI falls back; `remaining_unopened` must be a non-negative int else `error`); revalidate; return `{status:"ok", badgeKey, remaining}`. try/catch → `error`.
- Query `getOwnBadgeKeys(viewer)`: null profile ⇒ `[]`; `from("secret_boxes").select("badge").eq("profile_id", viewer.profileId).not("badge","is",null)`; distinct in JS; error ⇒ log + `[]` (page never fails on badges).

## Architecture
```
src/lib/secret-box/secret-box-badge-catalog.ts   keys, names, images, badgeFor, toBadgeSlots
src/lib/secret-box/secret-box-actions.ts         openSecretBoxAction + OpenSecretBoxResult type
src/lib/secret-box/secret-box-queries.ts         getOwnBadgeKeys(viewer)
```
Image paths: `/images/secret-box/badges/{key}.(png|svg)` (files land in phase 03); fallback `/images/secret-box/badges/badge-fallback.svg`.

## Related Code Files
- Create: the 3 modules above + `secret-box-badge-catalog.test.ts`, `secret-box-actions.test.ts`, `secret-box-queries.test.ts`
- Modify: none
- Delete: none

## Implementation Steps
1. Tests first (vitest, node env): catalog order/fallback/dedupe; action with mocked `createSupabaseServerClient` + `next/cache` (ok, empty, unauthenticated x2, malformed payload, thrown error, no-arg rpc call asserted); query (null profile, distinct, error ⇒ []).
2. Implement modules; each < 200 lines.
3. `npm test`, `npx tsc --noEmit`, `npm run lint`.

## Todo List
- [x] catalog + tests
- [x] action + tests (rpc called with name only, no params)
- [x] query + tests
- [x] typecheck/lint green

## Success Criteria
- All new unit tests green; action never forwards client input; unknown key maps to fallback; 6 slots always returned in fixed order.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| `revalidatePath` API differs in Next 16 | M | L | check web docs; router.refresh on close is the primary refresh |
| Error string matching drifts from SQL | L | M | match on message token AND errcode; contract frozen in plan.md |

## Security Considerations
Session-scoped client only (never service role). Query relies on owner-only RLS plus explicit `eq(profile_id, viewer)`; only called on self face (enforced in phase 03, tested in phase 04).

## Next Steps
Phase 03 wires these into UI and the profile loader.
