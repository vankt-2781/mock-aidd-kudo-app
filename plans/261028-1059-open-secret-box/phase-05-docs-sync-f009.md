# Phase 05 — Docs sync (F009 promotion)

## Context Links
- Draft spec: `spec/open-secret-box/*`, `spec/system/permissions-secret-box.md`
- Targets: `docs/features/` (next id F009 — confirm against `docs/features/README.md`), `docs/system/permissions.md`, `docs/generated/{feature-list,api-map,entities,permissions-matrix,behavior-logic}.md`, `docs/development-roadmap.md`, `docs/project-changelog.md`, `docs/system/architecture.md`, `docs/features/F008_Profile/edge-cases.md` (Mở Secret Box no longer disabled)

## Overview
Priority P2 · Status complete (doc-writer running, 2026-10-28) · blockedBy 04 (complete). Owner: `doc-writer` agent (surgical edits only).

## Requirements
- Promote spec to `docs/features/F009_OpenSecretBox/` (status draft → approved; fill "TBD (draft)" with real file paths, call hierarchy, DB impact).
- Apply the three permissions insertions verbatim from `permissions-secret-box.md`; drop the "open question" note on other-face visibility (resolved: self only).
- Generated docs: add RPC row, `secret_boxes.badge` column, matrix row, DEC/SM refs.
- F008 docs: note button now opens F009 modal; self badges unlock.
- Roadmap row + changelog entry (2026-10-28 or ship date).

## Implementation Steps
1. Promote feature folder; 2. permissions + generated rows; 3. F008 cross-refs; 4. roadmap/changelog; 5. link check.

## Todo List
- [ ] F009 feature folder
- [ ] permissions.md insertions
- [ ] generated artifacts rows
- [ ] F008 cross-refs
- [ ] roadmap + changelog

## Success Criteria
- No "TBD (draft)" left in F009; docs reference only files that exist; `Docs impact: major` stated.

## Risk Assessment
Low. Over-editing generated docs → surgical row edits only.

## Next Steps
PR from `feature/open-secret-box` to `main`.
