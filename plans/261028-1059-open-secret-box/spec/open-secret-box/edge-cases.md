---
status: draft
authored_by: takumi
created: 2026-10-28
lang: en
---

# Edge Cases — Open Secret Box

## Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Guest clicks "Mở Secret Box" on `/kudos` | Goes to login (existing gating); no modal | None |
| Unopened = 0 | Button disabled on both entries; modal never opens | None |
| Modal opened with a stale count above 0 but no box left on the server | RPC controlled error; count and phase unchanged; box retryable | TBD (draft) |
| Double click or key repeat on the box | Second click ignored while a call is in flight; one box opened | None |
| Two tabs open the last box at once | One succeeds, the other gets the controlled error; counts come from the backend | TBD (draft) |
| RPC network failure | Phase and count kept; inline error; box retryable | TBD (draft) |
| Session expired while the modal is open | RPC denied; inline error; next navigation goes to login | TBD (draft) |
| Last box opened (`remaining_unopened` = 0) | Success phase; instruction hidden; box disabled | None |
| Result badge key unknown, null or corrupt | Fallback badge image; no crash; open still counted | None |
| Badge image fails to load | Fallback image | None |
| Client forges badge, profile id or extra params | Function takes no input; nothing changes | None |
| Replay of an earlier request | A new draw on a new box only if one remains; never re-draws an opened box | None |
| Anon calls the function directly | Denied by grant | None |
| User B tries to open or update user A's box | Impossible: profile derived from `auth.uid()`; no write grant on table | None |
| Direct client `update` of `secret_boxes.badge` | Denied (no write grant or policy) | None |
| Box opened before this feature (`opened_at` set, `badge` null) | Counts as opened; unlocks no slot | None |
| Same badge received twice | Profile slot unlocked once | None |
| Modal closed mid-call | Call completes; page state refreshes from the backend on next render | None |
| Esc or backdrop click | Closes like X | None |
| Reduced motion | No reveal animation beyond a state swap | None |
| Locale `en` | English draft copy | draft strings |
| Other Sunner's Profile | No badge or Secret Box data in payload (default) | None |
| Persona with 25 opened and 25 unopened (seed) | Modal shows 25; 25 opens possible | None |

## TC Coverage (19 TC themes, MoMorph J3-4YFIpMM)

| TC theme | Spec ref | Deviation |
|----------|----------|-----------|
| ACCESSING (signed-in owner, unopened above 0) | FR-001, FR-002, SC-001 | Both entries open the modal (decision) |
| GUI idle layout and copy | FR-003, SC-002 | none |
| GUI success layout | FR-005, FR-006, SC-003 | Success phase comes from spec rows, no separate frame |
| FUNCTION open box, count, continue | FR-004 to FR-008, SC-003, SC-004 | none |
| FUNCTION count 0 disables | FR-006, SC-003 | none |
| FUNCTION invalid or corrupt badge | FR-009, SC-009 | none |
| Security client manipulation | FR-014, FR-015, SC-006 | Server-side draw via definer RPC |
| Security isolation between users | BR-003, SC-006 | none |
