---
phase: 04
title: Current viewer + admin role helper
feature: F003
status: completed
depends: []
---

# Phase 04 — Viewer and Admin Role

## Context Links
- Spec: DEC-001, INT-001, BR-001, BR-003, FR-022..024; TCs ID-0, 1, 5, 6, 36..38
- Permissions draft: [spec/system/permissions.md](spec/system/permissions.md)
- Reuse: `src/lib/supabase/supabase-server-client.ts`, pattern in `src/app/todo/page.tsx` (`await connection()` before `getUser()`)

## Overview
Priority P1 · Track B · parallel with 02, 03. Server-side read of session → `{ signedIn, isAdmin }`; pure role + menu helpers.

## Key Insights
- Role source = `user.app_metadata.role === "admin"` (not user-editable). `user_metadata` must never be consulted.
- Session read failure (network, missing env, revoked token) → visitor; never throw from the header path.
- `getUser()` (server-verified) not `getSession()` (cookie-trusting).

## Requirements
- `isAdminUser(user: { app_metadata?: unknown } | null | undefined): boolean` — strict string equality; non-object metadata, missing, `"Admin"`, `["admin"]` → false.
- `getCurrentViewer(): Promise<Viewer>` where `Viewer = { signedIn: false } | { signedIn: true; isAdmin: boolean }`; `await connection()`, create server client, `getUser()`, try/catch → `{ signedIn: false }`.
- `buildAccountMenu(isAdmin: boolean): AccountMenuKey[]` → `["profile","signOut"]` + `"adminDashboard"` iff admin (order per TC ID-5/36).

## Architecture
cookies → Supabase server client → `getUser()` → `isAdminUser` → `Viewer` → (phase 05) header props / (phase 06) admin guard.

## Related Code Files
Create: `src/lib/auth/is-admin-user.ts` (+ `.test.ts`), `src/lib/auth/get-current-viewer.ts` (+ `.test.ts`, mocks `next/server` connection and `@/lib/supabase/supabase-server-client`), `src/lib/auth/build-account-menu.ts` (+ `.test.ts`).
Do NOT touch: `decide-route-redirect.ts`, `src/proxy.ts`, `src/app/**`, package.json.

## Implementation Steps
1. Tests first for `isAdminUser` (table of inputs), `buildAccountMenu` (2 vs 3 items, order).
2. Tests for `getCurrentViewer`: user admin / user regular / `error` returned / client throws / `data.user` null.
3. Implement.

## Todo
- [x] is-admin-user red → green
- [x] build-account-menu red → green
- [x] get-current-viewer red → green
- [x] vitest + tsc green

## Success Criteria
All helpers unit-tested incl. failure paths; no `user_metadata` reads.

## Risk Assessment
| Risk | L | I | Countermove |
|------|---|---|-------------|
| Role read from editable metadata | L | H | Only `app_metadata`; test that `user_metadata.role="admin"` → false |
| Header crashes when Supabase down | M | M | try/catch → visitor; tested |

## Security Considerations
Hiding Admin Dashboard is UX only; real boundary is the `/admin` server guard (phase 06) using the same `isAdminUser`.

## Next Steps
Phases 05, 06 consume `getCurrentViewer`, `isAdminUser`, `buildAccountMenu`.
