# Phase 05 — Compose modal integration (state, uploads, submit, board trigger)

## Context Links
- [plan.md](plan.md) · technical-spec FR-001..015, FR-026, FR-028..030, DEC-001/002, SM-001 · edge-cases.md
- Track A: `src/components/kudos-compose/*` (props-driven modal) · board: `kudos-action-bar.tsx`, `kudos-page-content.tsx`, `kudos-all-section.tsx`, `kudos-feed-list.tsx`, toast pattern in `kudos-copy-link-button.tsx`
- MoMorph refs: Viết Kudo https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 (states: error 5c7PkAibyD, Ẩn danh p9vFVBE_tc, recipient dropdown QIMJNgFb8K, hashtag dropdown p9zO-c4a4x) · Clarifications: plans/261022-2157-viet-kudo-send-dialog/clarifications.md

## Overview
Priority P1 · done (2026-10-23) · 4.5h · depends 03, 04 (02 applied for the live smoke). Shipped: modal integration (controller/reducer, launcher, feed refresh-key fix, Track A gap closures).

## Key Insights
- Track A gaps to close (edit in place, no "enhanced" copies): overlay mousedown closes the modal → must do nothing (FR-003); first Esc must close an open dropdown/mention list/link dialog, not the modal; hashtag field has no typed-create input nor "Tối đa 5 hashtag" error; image field has no file input, upload status or format/size error; footer has no loading state; guidelines is a bare button; all copy is hard-coded `COMPOSE_COPY`.
- `KudosFeedList` keeps `useState(initialPosts)` keyed by filters → `router.refresh()` would NOT show the new kudos. Key must also include `feed.posts[0]?.id`.
- Hashtag options already loaded by the board (`getFilterOptions`) → pass names down; no new query.

## Requirements
- Launcher: signed-in pill opens modal (empty form each open); guest keeps `<Link href={KUDOS_LOGIN_HREF}>`; reuse `KudosGatedDialogButton` shape or replace for the compose pill only (stats box keeps it).
- Controller (`useReducer`): values, errors, upload items `{id,url?,status: uploading|done|failed, error?}`, editor state, dropdown flags, submitting. Recipient query → debounced `searchSunners` (250ms, stale-response guard); pick fills + closes; typing after pick clears recipient.
- Gửi: always enabled except while submitting (ignore clicks); invalid → per-field `required`; blocks submit while any image `uploading`; valid → loading → `sendKudos` → ok: close, reset, `router.refresh()`, success toast (role=status) · invalid: map field errors · unauthenticated: redirect `KUDOS_LOGIN_HREF` · error: keep values, error toast.
- Hashtags: dropdown toggle existing + text input (Enter/confirm) → `mergeHashtag` → errors `max`/`invalid` inline; chip remove. Images: hidden `<input type=file accept="image/jpeg,image/png" multiple>`; per-file validate → upload at pick; failed thumb retry/remove; add hidden at 5 (count includes uploading).
- Anonymous checkbox reveals name input (maxLength 30); title input maxLength 60; guidelines = inert link (`href="#"`, preventDefault).
- Dialog a11y: focus first field on open, restore focus on close.

## Architecture
`KudosComposeLauncher` (client, in kudos/) → `KudosComposeController` (client, kudos-compose/) → `KudosComposeModal` (presentational, gains `messages`, `submitting`, hashtag input + image props) with `editor={<KudosEditor/>}`. Server page already passes `messages`, `signedIn`, filter options into `KudosPageContent` → `KudosActionBar`.

## Related Code Files
**FILE OWNERSHIP (exclusive).** Create: `src/components/kudos-compose/kudos-compose-controller.tsx`, `kudos-compose-reducer.ts` (+`.test.ts`), `kudos-compose-controller.test.tsx`, `use-compose-recipient-search.ts`, `use-compose-image-uploads.ts` (if split), `src/components/kudos/kudos-compose-launcher.tsx`.
Modify: `src/components/kudos-compose/` → `kudos-compose-modal.tsx`, `-types.ts` (re-export lib limits, new props), `-footer.tsx`, `-hashtag-field.tsx`, `-image-field.tsx`, `-recipient-field.tsx`, `-title-field.tsx`, `-anonymous-field.tsx`, `-editor-shell.tsx`, `-field-label.tsx`, `index.ts`; delete `kudos-compose-copy.ts` and `kudos-compose-mock-data.ts` once unused. `src/components/kudos/kudos-action-bar.tsx`, `kudos-page-content.tsx`, `kudos-all-section.tsx` (feed key).
Not owned: `editor/**` (03), lib + card files (04).

## Implementation Steps
1. RED: reducer tests (open/reset, pick/clear recipient, hashtag add/max/remove, upload status transitions, submit guard); controller test with mocked actions/upload/editor stub (ID-7/11/14/56 errors, no `sendKudos` call when invalid, success → onClose + refresh + toast, error keeps values, Esc closes dropdown first, overlay click no-op).
2. Track A edits: copy via `messages` prop; overlay no-op; footer `submitting`; hashtag input + error; image input/status/error; inert guidelines link.
3. Reducer + controller; mount `KudosEditor`.
4. Launcher + action bar + page-content props (`compose` messages, hashtag names); feed key fix.
5. Live smoke after `db reset` (02 applied): send plain, with images, anonymous; card shows title/alias; sidebar sent +1.
6. Gates: tsc, lint, vitest, `next build`.

## Todo List
- [x] RED reducer/controller tests
- [x] Track A modal gaps closed
- [x] controller + editor mounted
- [x] launcher + board wiring + feed key
- [x] live smoke + gates

## Success Criteria
All units green; manual smoke passes the 5 flows; `rg "MOCK_SUNNERS|COMPOSE_COPY" src` returns nothing; each file < 200 lines (controller hooks split out as needed).

## Risk Assessment
| Risk | L | I | Mitigation |
|---|---|---|---|
| Controller > 200 lines | H | L | extract hooks listed above |
| Refresh shows stale feed | M | H | feed key includes first post id; e2e asserts first card |
| Double submit on slow network | M | M | reducer guard + disabled while submitting |
| Esc layering bugs | M | M | single keydown owner in controller, layered close order |

## Security Considerations
Client validation is UX only; server re-validates (04). Upload path built from verified claims, never from props.

## Next Steps
06 e2e.
