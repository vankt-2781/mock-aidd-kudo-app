---
title: F001 full unit + E2E test coverage
status: completed
work_type: feature
spec: docs/features/F001_LoginWithGoogle/
discipline: fast
created: 2026-10-20
---

# F001 Full Unit + E2E Test Coverage

Implement full automated verification for F001 Login with Google, per
`docs/features/F001_LoginWithGoogle/test-cases.md` (TC001–TC041: 16 UT, 17 IT, 8 UAT).
Existing: 40 vitest unit tests (pure logic). Missing: component-level unit tests (jsdom),
and all browser E2E (Playwright).

| Phase | File | Scope | Depends | Status |
|-------|------|-------|---------|--------|
| 01 | phase-01-unit-test-gaps.md | Component/unit test gaps (vitest + jsdom) | — | completed |
| 02 | phase-02-playwright-e2e.md | Playwright E2E for IT/UAT rows | — | completed |
| 03 | phase-03-verification.md | Full gate run + coverage report vs test-cases.md | 01, 02 | completed |

Out of scope: real Google consent UI automation (manual; covered by stubbed/intercepted flows),
CI pipeline setup.

Deps preinstalled by orchestrator: jsdom, @testing-library/react, @testing-library/user-event,
@testing-library/jest-dom, @playwright/test (+ chromium). Scripts: `test:e2e`.
