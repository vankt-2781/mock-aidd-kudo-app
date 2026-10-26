# Phase 03 — TipTap KudosEditor (fills the Track A editor slot)

## Context Links
- [plan.md](plan.md) · technical-spec FR-006..009, INT-002, ALG-002 (allow-list must match) · Track A slot: `src/components/kudos-compose/kudos-compose-editor-shell.tsx` (`children`, `activeFormats`, `onFormatToggle`)
- MoMorph refs: Viết Kudo https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/ihQ26W78P2 · Clarifications: plans/261022-2157-viet-kudo-send-dialog/clarifications.md

## Overview
Priority P1 · done (2026-10-23) · 3h · depends 01 (deps). Parallel with 04. Shipped: KudosEditor (TipTap, mention suggestion, link dialog).

## Key Insights
- Toolbar stays Track A's; the editor exposes state up (`activeFormats`) and a command API down (`toggle(format)`), so the shell is untouched.
- Next SSR: `useEditor({ immediatelyRender: false })`; file is `"use client"`.
- StarterKit brings heading, code, codeBlock, bulletList, horizontalRule, underline (v3) — disable everything outside the sanitizer allow-list so editor output == stored output.
- jsdom has no layout; TipTap behavior is proven in Playwright (06). Units cover pure helpers only.

## Requirements
- Formats: bold, italic, strike, orderedList, link, blockquote — each toggles on selection or for new content; active state reported.
- Link: small URL dialog (http/https/mailto only, else inline error); default `target=_blank rel="noopener noreferrer nofollow"`; empty URL removes link.
- Mention: `@` triggers suggestion list fed by an injected `searchSunners` (debounced 250ms, ≤10); pick inserts `span[data-type=mention][data-id][data-label]` rendering `@Name`; Esc closes list without closing modal.
- Placeholder (dictionary), CharacterCount limit 5000.
- Emits `onChange({ html, text, isEmpty })`; exposes `reset()`; `aria-invalid` + label for a11y.

## Architecture
`KudosEditor` (client) props: `messages`, `searchSunners`, `onChange`, `onActiveFormatsChange`, `editorRef` (imperative `toggle`, `reset`, `focus`), `invalid`. Extensions configured in one module; format→command map in a pure module.

## Related Code Files
**FILE OWNERSHIP (exclusive, create):** `src/components/kudos-compose/editor/kudos-editor.tsx`, `.../editor/kudos-editor-extensions.ts`, `.../editor/kudos-editor-format-commands.ts`, `.../editor/kudos-editor-format-commands.test.ts`, `.../editor/kudos-mention-suggestion-list.tsx`, `.../editor/kudos-mention-suggestion-list.test.tsx`, `.../editor/kudos-link-dialog.tsx`, `.../editor/kudos-link-dialog.test.tsx`, `.../editor/kudos-editor-url-check.ts`.
Do NOT edit any other `src/components/kudos-compose/*` file (05 owns them).

## Implementation Steps
1. RED: `format-commands.test` (format → command name / isActive key map, all 6), `url-check` cases inside link-dialog test (http/https/mailto ok; `javascript:`, `data:`, relative rejected), mention list (renders items, keyboard up/down/enter, empty text).
2. Extensions module (StarterKit trimmed + Link + Placeholder + CharacterCount + Mention with suggestion render via `ReactRenderer`).
3. Editor component; derive `isEmpty` from `editor.getText().trim() === ""` (empty paragraph = empty, BR-003).
4. Link dialog + mention list components (dictionary copy only).
5. Throwaway render in dev to sanity check; gates `tsc`, `lint`, `vitest`.

## Todo List
- [x] RED tests for pure helpers + list/dialog
- [x] extensions + editor
- [x] link dialog, mention list
- [x] gates green

## Success Criteria
Unit green; editor HTML for all 6 formats + mention uses only allow-listed tags/attrs (asserted later by 04's sanitizer round-trip test using a fixture copied from a real editor output); every file < 200 lines.

## Risk Assessment
| Risk | L | I | Mitigation |
|---|---|---|---|
| Suggestion popup positioning without a positioning lib | M | L | render list inline under editor (absolute); no floating-ui dep (YAGNI) |
| Mention Esc bubbles to modal close | M | M | stopPropagation in suggestion keydown; 06 tests first Esc |
| TipTap v3 API drift | M | M | search-docs at implementation time |

## Security Considerations
Editor output is untrusted; sanitization happens server-side (04). URL check is UX only.

## Next Steps
05 mounts it in the modal.
