---
status: draft
authored_by: takumi
created: 2026-10-27
lang: en
---

# Edge Cases — Profile

## Edge Cases

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Guest opens `/profile` or `/profile?id=X` | Guard redirects to `/login?next=%2Fprofile`; after login own profile (id dropped) | None |
| Session expires while on the page, then a feed page loads | Action returns error; page re-check sends to login on next navigation | TBD (draft) |
| `?id=` empty string | Self face | None |
| `?id=` own id in UPPER or mixed case | Self face in place, no redirect, URL unchanged | None |
| `?id` unknown but valid uuid | Not-found UI | "Không tìm thấy hồ sơ" + "Về trang chủ" |
| `?id=banana`, `42`, truncated uuid, SQLi text | Shape check fails before any query; same not-found | same |
| `?id=a&id=b` (repeated) | Not-found | same |
| `?id=%20` or id with surrounding spaces | Not-found (whitespace is not empty) | same |
| Profile lookup throws | Same not-found; no detail | same |
| HTTP status of not-found | 200 under cacheComponents streaming; tests assert text | n/a |
| `?dir=banana` | Received | None |
| `?dir=sent` on other face | Received; nothing about Sent shown | None |
| `?dir=sent` self face | Sent list, dropdown trigger shows "Đã gửi" | None |
| Forged `getProfileKudosPage(otherId, "sent", null)` | Empty page (no error); view would scope to caller anyway | None |
| Forged malformed `profileId` or `cursor` | Rejected before query | Error result |
| Direct `select` on `own_sent_kudos` as anon | Denied (grant authenticated only) | None |
| Direct `select` on `own_sent_kudos` as user B | Only B's own sent rows | None |
| Anonymous kudos in own Sent | Real self name plus "Ẩn danh" chip; heart refused | chip "Ẩn danh" |
| Anonymous kudos on any Received list | Masked alias and default avatar; no sender link | alias |
| Anonymous kudos count difference on other face | No counts rendered, so nothing to diff | None |
| Self has 0 received, 0 sent | Per-direction empty copy | "Hiện tại chưa có Kudos nào." / "Bạn chưa gửi Kudos nào." |
| Exactly 10 items | One page; next fetch returns empty and stops silently | None |
| 11+ items | Second page via sentinel; no end message | None |
| `window.scrollTo(bottom)` | Does not trigger load; the sentinel must enter the viewport (test note) | None |
| Direction switch while a page is in flight | Old request result discarded; label updates only for the latest load | None |
| Pick the active direction again | No-op, no request | None |
| Stats query fails on self | Inline error plus retry in the stats block; rest renders | developer-draft vi |
| Secret Box counters with no rows | Zeros | None |
| "Mở Secret Box" clicked | Disabled; nothing happens | None |
| Sparse profile (null avatar, null department, 0 kudos) | Placeholder avatar, no department line, no badge and no stars, empty feed | empty copy |
| Hero tier at 0 stars | No badge, no stars | None |
| Other face write bar, then Hủy in compose | Modal closes; page unchanged | None |
| Recipient preselected then removed in compose | Behaves as a normal empty recipient | None |
| Board and homepage compose | Still open with no preselected recipient (`initialRecipient` default null) | None |
| Self view bar | No write bar rendered | None |
| Card on `/kudos` with anonymous sender | No profile link (unchanged) | None |
| Heart on own kudos (incl. own anonymous in Sent) | Refused by action | board copy |
| Hashtag click | `/kudos?hashtag=...` | None |
| Locale `en` | English developer draft with `{name}` and `{count}` substituted | draft strings |
| RSC payload or network response | No email, no auth ids; other face carries no kudos counts | None |
| Two persona specs in parallel | Persona claim race; run in a separate serial Playwright project (test note) | None |
| Assert bare "Đã gửi" in tests | Collides with compose toast; assert within the dropdown trigger | None |

## TC Coverage (30 TC themes, TC_WEB_PROFILE_*)

| TC | Theme | Spec ref | Deviation |
|----|-------|----------|-----------|
| ACC_001 | `/profile` private, guest to login | FR-001, SC-001 | Adds `next=%2Fprofile`; guard in `decideRouteRedirect`, not `PUBLIC_ROUTES`; page re-check kept |
| ACC_002 | Self view renders all sections | FR-005 to FR-007, SC-002 | none |
| FUN_001 | `?id` valid other profile | FR-002, SC-003 | none |
| FUN_002 | `?id` own id canonical self | FR-002, SC-003 | Rendered in place, no redirect (decision) |
| FUN_003 | unknown valid uuid not-found | FR-002, FR-003, SC-003 | HTTP 200 (streaming); text asserted |
| FUN_004 | malformed id not-found, shape check before query | FR-002, ALG-001, SC-003 | none |
| FUN_005 | empty id self, repeated id not-found | FR-002, SC-003 | Whitespace also not-found |
| GUI_001 | Hero layout, tier badge + stars row | FR-005, SC-002 | **Tier by F006 stars rule, not distinct senders (TC denominator)** |
| GUI_002 | 6 badge slots fixed order locked | FR-006, SC-002 | none |
| GUI_003 | Badge heading self/other | FR-006, SC-002, SC-004 | none |
| GUI_004 | 5 counters, board wording | FR-007, SC-002 | Secret Box counts real from `secret_boxes` |
| GUI_005 | "Mở Secret Box" disabled | FR-008, SC-002 | none |
| FUN_006 | Other-face write bar copy | FR-010, SC-004 | none |
| FUN_007 | Bar opens compose with recipient | FR-010, FR-011, SC-004 | `initialRecipient` optional prop |
| FUN_008 | No bar on self | FR-010, SC-004 | none |
| FUN_009 | Dropdown self both labels with counts, active shown | FR-012, SC-005 | State in `?dir` URL |
| SEC_001 | Other face Received only, no Sent label or count | FR-014, BR-001, SC-005 | Static "Đã nhận", no count even for received |
| SEC_002 | Own Sent includes anonymous, shows self | FR-022, FR-023, SC-006 | New definer view; "Ẩn danh" chip via Sent-only flag |
| SEC_003 | Caller-scoped, sessions isolated | FR-021, FR-023, BR-002, SC-006 | Two layers (action + view) |
| GUI_006 | Cards identical to board | FR-018, SC-008 | none |
| FUN_010 | Direction switch loads page 1, label after load | FR-015, SC-007 | none |
| FUN_011 | Re-pick active no-op | FR-015, SC-007 | none |
| FUN_012 | Per-direction empty copy | FR-017, SC-007 | none |
| FUN_013 | Infinite scroll 10/page | FR-016, SC-007 | **End-of-feed message dropped (board parity)** |
| FUN_014 | Heart reuse, self refusal incl. own anonymous | FR-020, SC-008 | none |
| FUN_015 | Hashtag link, copy link toast | FR-020, SC-008 | none |
| GUI_007 | No Spam chip | FR-018, SC-008 | Deferred; typed `status` kept |
| GUI_008 | vi/en parity, substitution | FR-025, SC-009 | New `profile-dictionary`, not kudos dictionary; en is draft |
| GUI_009 | Sparse profile | FR-005, SC-010 | none |
| SEC_004 | Read-only, no email/auth ids in payload | FR-004, FR-026, SC-011 | none |

**Recorded deviations (for PM):** tier rule (F006 stars); end-of-feed message dropped; guard + `next` allow-list instead of `PUBLIC_ROUTES`; i18n via dictionary-lite not `locales/*.json`; own-id rendered in place; HTTP 200 for not-found; whitespace id not-found; Spam chip deferred.
