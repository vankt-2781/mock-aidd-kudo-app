---
phase: 05
title: "/todo protected placeholder + logout"
status: completed
priority: P2
effort: 1h
feature: F001
track: B
blockedBy: [phase-03]
---

# Phase 05 — /todo placeholder + logout

## Context Links
- Spec: US004, FR-011, FR-012, FR-013, BR-004, SC-006 ([technical-spec.md](spec/login-with-google/technical-spec.md))
- Clarifications: show name + email + avatar + logout; single-language.

## Overview
P2 · completed. Minimal server-rendered landing page. Parallel with 06.

## Key Insights
- Proxy already guards; page also calls `getUser()` and `redirect("/login")` on null (defense in depth, also handles revoked sessions).
- Google metadata: `user_metadata.full_name` / `name`, `avatar_url` / `picture` — fall back to email / initials.
- Avatar host `lh3.googleusercontent.com` → `images.remotePatterns` in `next.config.ts`.

## Requirements
- FR-012 display; FR-013 logout = server action `signOut()` then `redirect("/login")`.
- No styling beyond simple readable layout (YAGNI).

## Related Code Files (ownership)
Create:
- `src/app/todo/page.tsx` — server component
- `src/app/todo/sign-out-action.ts` — `"use server"`
- `src/lib/auth/get-display-user.ts` (+ `.test.ts`) — pure mapper `User → { name, email, avatarUrl }`
Modify:
- `next.config.ts` — remotePatterns for Google avatars

## Implementation Steps
1. Test + implement `get-display-user.ts` (full_name → name → email; avatar_url → picture → null).
2. `sign-out-action.ts` using server client from phase 03.
3. `page.tsx`: `getUser()`, map, render avatar (`next/image`, or initials when null), name, email, `<form action={signOutAction}><button>Logout</button></form>`.
4. `next.config.ts` remotePatterns; `npm run build`.

## Todo List
- [x] display-user mapper + test
- [x] sign-out action
- [x] page
- [x] next.config remotePatterns

## Success Criteria
- Authenticated: name, email, avatar, Logout visible. Logout → `/login`; Back → `/login` (SC-006).
- Unauth direct access → `/login`.

## Risk Assessment
| Risk | L/I | Mitigation |
|------|-----|------------|
| Cached /todo shown after logout via bfcache | L/M | Page is dynamic (cookies); proxy re-checks on navigation; verify manually |
| Missing avatar metadata | M/L | Initials fallback |

## Security Considerations
No user data beyond own session. Sign-out is a POST server action (CSRF-protected by Next).

## Next Steps
Feeds 07.
