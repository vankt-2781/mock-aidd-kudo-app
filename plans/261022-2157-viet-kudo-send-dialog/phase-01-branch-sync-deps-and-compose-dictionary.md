# Phase 01 — Branch sync, new dependencies, compose dictionary

## Context Links
- [plan.md](plan.md) · [technical-spec.md](spec/kudos-send-dialog/technical-spec.md) FR-026, INT-002 · [clarifications.md](clarifications.md)
- Copy source: `src/components/kudos-compose/kudos-compose-copy.ts` (Track A, verbatim Figma) · dictionary pattern `src/lib/i18n/kudos-dictionary*.ts`

## Overview
Priority P1 · Status done (2026-10-23) · 1h. Shipped: TipTap 3.32.0 + sanitize-html 2.18.1, compose dictionary. Prerequisite for 03/04/05: everything else installs nothing and edits no dictionary.

## Key Insights
- PR #6 (`fix/kudos-spotlight-and-e2e`, 45 kudos e2e + helpers `e2e/helpers/kudos-*.ts`) is NOT in main. Phase 06 needs it. Merging main early keeps later conflicts small.
- `KudosMessages` is prop-drilled (no client context); lib/ never imports components/.
- TipTap v3 packaging moved Placeholder/CharacterCount into `@tiptap/extensions`; confirm current package names with `tkm:search-docs` before installing — do not guess.

## Requirements
- Functional: `KudosMessages.compose` holds every modal string (labels, placeholders, hints, `required`, `maxHashtags` "Tối đa 5 hashtag", `maxFive`, image format/size/upload-failed errors, link-dialog labels, empty recipient list, submitting label, success/error toasts, guidelines link); `card.anonymousAlias` = "Ẩn danh". `vi` verbatim from `COMPOSE_COPY` + `COMPOSE_FORMAT_LABELS`; `en` developer draft.
- Non-functional: no runtime behavior change in this phase; `npm ls` clean.

## Architecture
Dictionary type extension only + package.json/lockfile. `COMPOSE_COPY` stays until phase 05 swaps consumers (then 05 deletes it).

## Related Code Files
**FILE OWNERSHIP (exclusive):** `package.json`, `package-lock.json`, `src/lib/i18n/kudos-dictionary.ts`, `src/lib/i18n/kudos-dictionary-vi.ts`, `src/lib/i18n/kudos-dictionary-en.ts`, `src/lib/i18n/kudos-dictionary.test.ts`.
- Modify: all of the above. Create/Delete: none.

## Implementation Steps
1. `git fetch origin && git merge origin/main` (if PR #6 landed, its e2e come in now). If not landed, record it; phase 06 re-checks.
2. Confirm package names/versions (search-docs): `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-mention`, `@tiptap/suggestion`, Placeholder + CharacterCount (`@tiptap/extensions` on v3), Link (in StarterKit v3 or `@tiptap/extension-link`); `sanitize-html` + `@types/sanitize-html` (dev). `npm i` exact set; no others.
3. RED: extend `kudos-dictionary.test.ts` — vi/en key parity for `compose` + `card.anonymousAlias`; vi values equal Track A copy strings (exact).
4. Add `compose` type to `KudosMessages`; fill vi (verbatim) and en (draft, comment `// PM review`).
5. `npx tsc --noEmit`, `npm test`, `npm run lint`.

## Todo List
- [x] merge origin/main, note PR #6 status (PR #6 still open — phase 06 handled it)
- [x] deps confirmed + installed (TipTap 3.32.0, sanitize-html 2.18.1)
- [x] dictionary test RED → green
- [x] gates green

## Success Criteria
483 + new unit green; `npm ls @tiptap/react sanitize-html` resolves; dictionary parity test passes.

## Risk Assessment
| Risk | L | I | Mitigation |
|---|---|---|---|
| TipTap peer mismatch with React 19.3 | M | M | check peer ranges first; pin the major that declares React 19 |
| Merge conflict from main | L | L | merge before any feature edit |

## Security Considerations
`sanitize-html` is server-only (imported only from a `"use server"`/server module in 04). No secrets touched.

## Next Steps
Unblocks 03, 04, 05.
