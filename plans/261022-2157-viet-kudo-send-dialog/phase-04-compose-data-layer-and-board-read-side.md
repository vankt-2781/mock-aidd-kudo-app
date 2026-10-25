# Phase 04 — Compose data layer (actions, validation, sanitize, uploads) + board read side (title, anonymous)

## Context Links
- [plan.md](plan.md) contracts "DB", "Actions", "Board types" · technical-spec FR-004/005/010/011/016..023/027/028/031, ALG-001..003, INT-001/003, SC-011/012/016
- Patterns: `src/lib/kudos/kudos-actions.ts` (+ `.test.ts` Supabase mock), `kudos-row-mappers.ts`, `kudos-board-queries.ts`, `kudos-viewer.ts`, `src/lib/supabase/supabase-browser-client.ts`, `supabase-env.ts`
- MoMorph refs: Viết Kudo https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 · Live board https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/MaZUn5xHXZ (title line style) · Clarifications: plans/261022-2157-viet-kudo-send-dialog/clarifications.md

## Overview
Priority P1 · done (2026-10-23) · 5h · depends 01; coded against the 02 contract. AUTH-SENSITIVE (sendKudos, upload helper) — inspected (SEALED after rework). Shipped: compose data layer + board read side (anonymous display, title line, viewer stats); rework added sanitizer class strip and upload-in-progress feedback.

## Key Insights
- Seed tag "IDOL GIỚI TRẺ" has spaces → charset rule `^[\p{L}\p{N}_]+$`u applies to NEW names only; a name equal (case-insensitive) to an existing tag is reused as-is.
- Mapper must stop computing `viewerIsSender` from `sender_id` (null for anonymous) → read `viewer_is_sender`.
- Default alias stays out of lib: mapper sets `senderAnonymous`, `sender.name = sender_display_name ?? ""`; the card renders `name || messages.card.anonymousAlias`.
- Image URLs, not blobs, go through the action → Next server-action body limit irrelevant.

## Requirements
- `kudos-compose-limits.ts`: MAX_HASHTAGS 5, MAX_IMAGES 5, MAX_IMAGE_BYTES 5 MiB, IMAGE_MIME [jpeg, png], TITLE 60, ANON_NAME 30, HASHTAG 30, CONTENT_TEXT 5000, RAW_HTML 50 000, SEARCH_LIMIT 10.
- `normalizeHashtag` / `mergeHashtag(selected, raw, existing)` (ALG-001): trim, strip `#`, collapse spaces, case-insensitive dedupe, reuse existing casing, refuse 6th (`max`), invalid chars/too long (`invalid`).
- `validateComposeForm(values, editorState)` (client, DEC-002): `recipient` (null even if query typed), `content` (isEmpty), `hashtags` (0) → `required`; title/anon optional.
- `sanitizeKudosHtml(html)` → `{ html, text }` (ALG-002, sanitize-html allow-list: p, br, strong, b, em, i, s, ol, li, blockquote, a[href http/https/mailto, rel forced, target], span[data-type=mention, data-id, data-label, class]); text = tags stripped, entities decoded, whitespace collapsed. Server-only (`import "server-only"`).
- `parseSendKudosInput(raw, ctx{authUserId, viewerProfileId, existingHashtags, storagePublicBase})` → typed input | field errors: uuid recipient ≠ self, html ≤ RAW_HTML, text non-blank ≤5000, hashtags 1..5 valid, images ≤5 each `^<base>/kudos-images/<authUserId>/[\w-]+\.(jpg|png)$`, title/anon trimmed + bounded, anon name dropped unless anonymous.
- `kudos-compose-actions.ts` (`"use server"`): `searchSunners(query)` — trim, 1..50 chars, escape `%_\`, `.ilike("display_name", %q%)`, `.neq("id", viewerProfileId)` when signed in, order name, limit 10, map to `ComposeSunner` (avatar fallback); visitors → `[]`. `sendKudos(input)` — `getUser()` (verified) else `unauthenticated` → parse → sanitize → `rpc("send_kudos")` → map errcodes (contract) → `{status}`; never logs content. No notification/event writes (FR-027).
- `kudos-image-upload.ts` (client): `validateKudosImageFile(file)` (`type`|`size`), `uploadKudosImage(file)` → browser client `getClaims()` sub → path `<sub>/<crypto.randomUUID()>.<jpg|png>` → `upload(..., { contentType, upsert: false })` → `getPublicUrl` → `{ok,url}` | `{ok:false, reason}`.
- Board read side: `KudosFeedRow` + `title, is_anonymous, viewer_is_sender`, nullable sender fields; `KudosBoardPost.title: string | null`, `senderAnonymous`; `getViewerStats` reads `viewer_kudos_stats` (no `eq` by id needed, still `maybeSingle`). Cards: title line when non-empty (style from Live board frame); anonymous sender → default avatar, alias, no link, no stars/department/hero badge.

## Architecture
New module dir `src/lib/kudos-compose/` (pure + server + client helpers, one concern per file). Board-side edits stay in existing `src/lib/kudos/*` and card components.

## Related Code Files
**FILE OWNERSHIP (exclusive).** Create: `src/lib/kudos-compose/kudos-compose-limits.ts`, `kudos-hashtag-normalize.ts` (+`.test.ts`), `kudos-compose-form-validation.ts` (+`.test.ts`), `kudos-html-sanitize.ts` (+`.test.ts`), `kudos-send-input-parse.ts` (+`.test.ts`), `kudos-image-url.ts` (+`.test.ts`), `kudos-image-upload.ts` (+`.test.ts`), `kudos-compose-actions.ts` (+`.test.ts`), `kudos-compose-types.ts` (SendKudosInput/Result).
Modify: `src/lib/kudos/kudos-row-mappers.ts` (+test), `kudos-board-types.ts`, `kudos-board-queries.ts` (+test), `src/components/kudos/kudos-user-info.tsx`, `kudos-card-parts.tsx`, `kudos-post-card.tsx`, `kudos-highlight-card.tsx`, `kudos-test-fixtures.ts`, related `*.test.tsx` under `src/components/kudos/`.
Not owned: `kudos-action-bar.tsx`, `kudos-page-content.tsx`, `kudos-all-section.tsx`, `kudos-feed-list.tsx` (05).

## Implementation Steps
1. RED per module: hashtag matrix (trim, `#`, case dupe, existing reuse incl. spaced seed tag, 6th, 31 chars, `a-b`); form validation (ID-7/11/14/56 combos, query-without-pick); sanitizer (script/onerror/style/iframe stripped, `javascript:` href dropped, rel forced, mention span kept, round-trip of a real editor fixture unchanged, text derivation of `<p>a</p><p>b</p>` → `a b`, `<p></p>` → blank); parse (every SC-011 forged case); image URL (own folder ok; other uid, other bucket, external host, `.gif`, traversal `..` rejected); actions (unauth, invalid, RPC error mapping, payload shape, searchSunners escape + self exclusion + cap); mappers (anonymous masked row, title null/non-null, `viewer_is_sender`); card tests (anonymous no link, title line).
2. Implement modules to green; keep files < 200 lines.
3. Board types/mappers/queries/cards; update fixtures; existing 483 stay green.
4. Gates: `npx tsc --noEmit`, lint, vitest. No test-only routes; the live smoke against 02 happens through the 05 UI.

## Todo List
- [x] limits, normalize, validation, sanitize, parse, image url/upload (RED→green)
- [x] actions (RED→green)
- [x] row type/mapper/queries/viewer stats
- [x] cards: title + anonymous sender
- [x] gates green

## Success Criteria
All new units green; 483 prior green; no component imports `sanitize-html`; `rg "sender_id" src/lib/kudos/kudos-row-mappers.ts` only in the row type.

## Risk Assessment
| Risk | L | I | Mitigation |
|---|---|---|---|
| Sanitizer strips TipTap output (ol>li>p, mention attrs) | M | H | real-editor fixture round-trip test |
| `getClaims` unavailable in browser client version | L | M | fallback `getUser()` |
| ilike pattern injection / PostgREST `or()` parsing | M | M | use `.ilike()` only, escape wildcards, length cap |
| Contract drift vs 02 | M | M | contract frozen in plan.md; 05 smoke + 06 e2e catch |

## Security Considerations
Sender identity only from `getUser()`/`auth.uid()`; client never sends sender id. URL allow-check bound to the verified auth user id. Errors generic to client; no HTML in logs.

## Next Steps
05 wires actions/helpers into the modal; 06 proves rules.
