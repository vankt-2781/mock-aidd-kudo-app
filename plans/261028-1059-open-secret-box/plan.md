---
title: "Open Secret Box (F009)"
description: "Server-drawn Secret Box opening via definer RPC, wired into /kudos sidebar + own Profile, badges unlock self-face slots."
status: complete
priority: P1
effort: 12h
branch: feature/open-secret-box
tags: [secret-box, supabase, rpc, kudos, profile, momorph]
created: 2026-10-28
---

# Open Secret Box — blueprint

Spec: `docs/features/F009_OpenSecretBox/` (promoted at implement-start). Decisions: `clarifications.md` (authoritative, closed). Permissions diff: `spec/system/permissions-secret-box.md`.

MoMorph two-track: **Track A (UI) DONE** in working tree — `src/components/secret-box/secret-box-modal.tsx` + copy + 7 tests + media. Phases below are Track B + integration.

## Phases

| # | Phase | Owner files (no overlap) | blockedBy | Effort | Status |
|---|-------|--------------------------|-----------|--------|--------|
| 01 | [DB: badge column + open_secret_box RPC](phase-01-db-badge-column-and-open-rpc.md) | `supabase/migrations/20261028000001_*`, `supabase/seed.sql` (invariant only) | — | 2h | complete |
| 02 | [Server layer: catalog, action, badge query](phase-02-server-badge-catalog-action-query.md) | `src/lib/secret-box/*` | — (codes to the RPC contract fixed in 01) | 2h | complete |
| 03 | [Integration UI: both entries + badges + assets](phase-03-integration-ui-entries-and-badges.md) | `src/components/secret-box/*`, `kudos-stats-box.tsx`, `profile-stats.tsx`, `profile-badge-collection.tsx`, `profile-page-loaders.ts`, i18n kudos dictionaries, `public/images/secret-box/badges/*` | 01, 02 | 3h | complete |
| 04 | [Temper: unit + e2e + isolation](phase-04-tests-unit-e2e-isolation.md) | `e2e/secret-box-*`, `e2e/helpers/secret-box-db.ts`, persona/seed-sanity spec edits, `playwright.config.ts`, `e2e/README.md` | 01, 02, 03 | 4h | complete |
| 05 | [Docs sync (F009 promotion)](phase-05-docs-sync-f009.md) | `docs/**` | 04 | 1h | complete |

Gates (2026-10-28): vitest 826/826; playwright 281/281 twice on one `db reset`; tsc/eslint/build clean. Review: approve 9/10, 0 critical/major. Risk gate human-signed.

01 and 02 run in parallel (disjoint files; RPC contract frozen below). 03 needs both. 04 needs the app working end to end.

## Frozen contract (01 ⇄ 02 ⇄ 03)

- `public.open_secret_box()` → `jsonb {"badge": text, "remaining_unopened": int}`; errors: `unauthenticated` (28000), `no_profile` (P0002), `no_unopened_box` (P0001).
- Badge keys (slot order = weight order): `stay_gold, flow_to_horizon, beyond_the_boundary, root_further, touch_of_light, revival`.
- `openSecretBoxAction()` → `{status:"ok", badgeKey, remaining} | {status:"empty"} | {status:"unauthenticated"} | {status:"error"}`.

## Data flow

```
button (KudosStatsBox | ProfileStats) -> SecretBoxOpener (client state) -> SecretBoxModal
  click box -> openSecretBoxAction (server, session client, getUser) -> rpc open_secret_box
  -> secret_boxes UPDATE (definer, SKIP LOCKED, weighted draw) -> {badge, remaining}
  -> catalog badgeFor(key) -> modal "opened" phase; close -> router.refresh()
/profile self -> getOwnBadgeKeys (owner-only RLS select) -> toBadgeSlots -> ProfileBadgeCollection
/profile other -> badges [] (F008 boundary unchanged)
```

## Critical constraints

- Full e2e suite passes **twice on one `npx supabase db reset`**: box-opening specs use fresh test users with service-role-inserted boxes (cascade-deleted with the trigger profile); persona/Sunner 1 boxes never opened.
- F008 other-face payload never carries badge or box data.
- No client write path to `secret_boxes`; outcome decided only in SQL.
- No secrets in code; `.claude/` never committed.

## Follow-ups (deferred minors from review — optional)

- Duplicate `SecretBoxBadge` type (dedupe to one source).
- `SecretBoxCopy` layering: `lib/i18n` → components import direction.
- Map `no_profile` → `unauthenticated` explicitly in the action.
- Stale count cosmetic on modal reopen.
- `aria-label` of box button in opened phase.

## Rollback

Per phase (see files). DB: new migration with `drop function` + `drop column`; app phases are plain reverts.

## Success (observable)

SC-001..SC-010 of the spec mapped in phase-04; `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npx playwright test` x2 after one reset — all green.
