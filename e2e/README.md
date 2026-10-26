# F001 Login with Google: E2E coverage

Run: `npm run test:e2e` (needs local Supabase running; reuses a dev server on :3000).
Supabase URL and keys are read at runtime from `npx supabase status -o env`
(or `E2E_SUPABASE_URL` / `E2E_SUPABASE_ANON_KEY` / `E2E_SUPABASE_SERVICE_ROLE_KEY`); nothing is hardcoded.

Authenticated specs create an email-confirmed user through the admin API, sign in from Node and
inject the `sb-127-auth-token` cookie (`base64-` + base64url session, chunked like `@supabase/ssr`).
Users are deleted in fixture teardown. Google itself is never contacted: Supabase's real
`/auth/v1/authorize` hop runs, its Google redirect is captured and the browser gets a stub page.

## Mapping TC### to coverage

| TC | Coverage |
|----|----------|
| TC001-TC004 | unit (decide-route-redirect) + e2e `authenticated.spec.ts`, `login-unauthenticated.spec.ts` |
| TC005-TC008 | unit (resolve-callback-redirect); TC005/6/7 also e2e (callback error redirects) |
| TC009, TC041 | e2e `authenticated.spec.ts` (arbitrary-domain user admitted; real Google account variant MANUAL) |
| TC010-TC013 | unit (locale, dictionary); TC012 also e2e |
| TC014 | unit (component) + e2e `login-oauth-start.spec.ts` |
| TC015, TC018, TC024, TC036 | e2e `login-oauth-start.spec.ts` |
| TC016, TC031, TC038 (UI half) | unit + e2e `login-unauthenticated.spec.ts` |
| TC017 | unit (login-page-client) |
| TC019 | unit; e2e not feasible: the SDK only assigns `location`, so no SDK error surfaces in a real browser. MANUAL: blank Google credentials |
| TC020 | MANUAL (needs a real authorization code); invalid-code path covered under TC028 e2e |
| TC021, TC023 | e2e `login-unauthenticated.spec.ts` |
| TC022, TC039 | e2e `authenticated.spec.ts` |
| TC025, TC026, TC027, TC040 | e2e `authenticated.spec.ts` |
| TC028 | e2e (invalid code); replay of a genuinely used code MANUAL |
| TC029 | MANUAL (requires restarting Supabase with blank Google credentials) |
| TC030 | MANUAL (browser with cookies blocked) |
| TC032, TC034, TC035 | e2e `login-unauthenticated.spec.ts` |
| TC033, TC037 (post-login half) | e2e `authenticated.spec.ts` |

## MANUAL (real Google consent / environment)

TC020 (valid code exchange), TC028 (true replay), TC029, TC030, TC037 and TC041 via a real Google
account, TC038 via a real consent cancel.

## Known findings

- Hover cursor: RESOLVED 2026-10-20 — `cursor-pointer` added to the login button and language
  selector; the TC034 test in `login-unauthenticated.spec.ts` is active and passing.
- Revoked session with a still-valid JWT: `/todo` returns 200 with the "Loading..." fallback and a
  `meta refresh` to `/login` (redirect inside Suspense) rather than a 307. The TC025 revoked test
  asserts that actual behavior; headless Chromium did not follow the meta refresh within 4 s.
- Playwright output goes to `node_modules/.playwright-results`: Tailwind scans the repo, and an
  in-repo `test-results/` holding HTML-escaped class names broke the dev CSS build.

# F003 Homepage SAA: E2E coverage

Specs: `homepage-public-render`, `homepage-navigation`, `homepage-i18n`, `homepage-countdown`,
`homepage-auth-header`, `homepage-menus-and-guards` (test titles cite the MoMorph `ID-xx` rows).
Admin tests use the `adminUser` / `adminContext` fixtures (`app_metadata.role = "admin"` via the admin API).
The countdown specs drive time with `page.clock` and read the event start from the rendered
`data-target-date` attribute, so they follow `EVENT_START_AT` instead of hardcoding it.

| TC IDs | Coverage |
|--------|----------|
| ID-0, 1, 7-17, 59 | e2e `homepage-public-render` (grid columns checked at 1440 / 768 / 375) |
| ID-2-4, 18-23, 44-53, 55, 62 | e2e `homepage-navigation` (card hash: URL + section in viewport; hover via computed style) |
| ID-24-26, 58 | e2e `homepage-i18n` (VN/EN only, reload persistence, `<html lang>`, tampered cookie) |
| ID-39-43, 56, 57 | e2e `homepage-countdown`; ID-60 (invalid env date) unit only (compute-countdown / live-hero-countdown tests) |
| ID-5, 6, 27-29, 36-38 | e2e `homepage-auth-header` (guest login link, bell empty panel, regular vs admin menu, sign out) |
| ID-30-35, 54, `/admin` + `/profile` guards | e2e `homepage-menus-and-guards` |

## MANUAL / not automatable

- Unread notification badge (ID-11, ID-27, ID-29 badge-present variant): no notification backend exists; e2e asserts the
  badge is never shown and the empty panel opens. Re-test when notifications ship.
- Exact pixel sizes of logo (spec 64x60; built 52x48 per Figma frame) and visual polish (glow, blur): visual review.
- ID-60 invalid-env fallback at the browser level (env fixed for the dev server): unit-covered only.
- Any TC row in the CSV beyond the 62 digested IDs is not represented in the digest; verify in Phase 08.

# F004 Awards Information: E2E coverage

Spec: `awards-information` (19 tests; titles cite the MoMorph `ID-xx` rows). Public page, no auth needed
(one test repeats ID-0/1 with the `signedInContext` fixture). Click tests use the default smooth scroll and poll on
`aria-current` / viewport / focus; no fixed sleeps.

| TC IDs | Coverage |
|--------|----------|
| ID-0, 1 | e2e guest + authenticated open `/awards`: 200, no redirect. DEVIATION: the TC expects auth-only `/he-thong-giai`; clarifications make it public at `/awards` |
| ID-2 | e2e `homepage-navigation` ID-21 (header Awards Information to `/awards`, selected item) plus deep-link tests; not duplicated |
| ID-3-8 | e2e `awards-information` (layout order at 1440 and 375, caption + gold h1, 6 nav items in order, exact quantity/prize per card incl. Signature "Hoặc", 336x336 loaded images, Kudos block) |
| ID-9-11 | e2e click each item: card in viewport, one `aria-current`, `#slug`, focus on card h2; gold/underline swap; hover background |
| ID-12 | e2e Kudos "Chi tiết" opens `/kudos` |
| ID-13 | e2e `/awards#khong-ton-tai`: no page/console error, page at top, first item active |
| extra | scroll-spy (active follows scroll, hash unchanged), `/awards#mvp` on load, reduced-motion click, VN/EN copy + tab title + reload persistence, header nav selected state |

## MANUAL / not automatable

- ID-14 (Kudos navigation network failure to friendly error): `/kudos` is a placeholder page that renders, so a normal
  navigation succeeds. Verify by hand: DevTools offline, click "Chi tiết", expect the browser/Next error handling, not a blank page.
- EN copy and the EN tab title are dev drafts pending PM review; e2e asserts the current draft strings.
- Visual polish (glow, text-shadow, pixel match of the keyvisual crop): visual review.

# F005 Countdown Prelaunch: E2E coverage

The default suite runs post-launch: `playwright.config.ts` pins `EVENT_START_AT=2025-12-26T18:30:00+07:00`
(gate inert) so every spec runs ungated. Session cookies are bound to the active `baseURL` (`buildSessionCookies`).

`GET /api/event-config` is asserted against the post-launch pin; the homepage hero's `data-target-date` must equal the
API `startAt`.

Pre-launch gate behaviour (redirects, admin bypass, page render) has NO browser e2e by decision (a dedicated
pre-launch suite was built and then removed as not needed). It is covered by the unit decision matrix
(`src/lib/launch-gate/decide-launch-gate-redirect.test.ts`, 15 paths × admin/non-admin), the proxy wiring tests
(`src/proxy.test.ts`), and the scripted curl smoke recorded in
`plans/261020-1656-countdown-prelaunch-implementation/reports/tester-261020-prelaunch-smoke.md`.

| Spec ID | Coverage |
|---------|----------|
| SC-004 | e2e `countdown-prelaunch`: guest, signed-in user and admin opening `/countdown` all end at `/` (post-launch) |
| FR-007 | e2e `countdown-prelaunch`: guest `/` and `/awards` return 200 without redirect (post-launch) |
| SC-001 / FR-004 | e2e `countdown-prelaunch`: `/api/event-config` returns the pinned `startAt`, `Cache-Control: no-store`, equals homepage `data-target-date` |
| SC-002 / FR-005 | unit gate matrix + proxy wiring tests + curl smoke (guest/user gated to `/countdown`, `/login` stays 200) |
| SC-003 / FR-006 | unit `src/lib/launch-gate/decide-launch-gate-redirect.test.ts`, `src/proxy.test.ts` (admin bypass) + curl smoke |
| SC-005 / FR-002 / FR-003 | unit `src/lib/countdown/compute-countdown.test.ts` + live countdown component tests (render, cap, tick) |
| FR-009 | unit: `src/lib/i18n/prelaunch-dictionary.test.ts` |

## MANUAL / not automatable

- Pre-launch gate in a real browser (SC-002/003): run `EVENT_START_AT=2099-01-01T00:00:00+07:00 npm run dev` and check by hand, or rely on the unit matrix + curl smoke above.
- 1.5 s client redirect to `/` at zero (FR-003): unit-covered by `use-launch-redirect.test.tsx` and the live countdown tests. Not driven end to end: the server gate reads the server clock, which the browser clock cannot move.
- Expired (not garbage) session JWT: the test suite cannot mint a JWT without the project secret; the invalid-cookie path is covered instead.

# F007 Viết Kudo (send dialog): E2E and DB/Storage rules

Screen: MoMorph `ihQ26W78P2`. Specs: `kudos-compose-open-and-layout`, `kudos-compose-validation`,
`kudos-compose-editor`, `kudos-images-storage-rules` (read-only, parallel `chromium` project);
`kudos-compose-writes-{submit,anonymous,images,db-rules}` (write project); `kudos-compose-seed-sanity` (last).
Helpers: `kudos-compose-ui.ts` (locators, pick/type/submit, send interception), `kudos-compose-cleanup.ts`
(service/anon/user clients, ordered teardown, kudos lookup), `kudos-compose-test-files.ts` (in-memory images).

## Projects and write isolation

| Project | Specs | Runs |
|---------|-------|------|
| `chromium` | everything except the two patterns below (F001-F005 + read-only F007) | parallel |
| `kudos-writes` | `kudos-compose-writes-*.spec.ts` | after `chromium`, `workers: 1`, creates kudos rows and uploads |
| `kudos-seed-sanity` | `kudos-compose-seed-sanity.spec.ts` | after `kudos-writes`; asserts the F006 seed invariants |

- Rule: a spec that inserts a kudos row or uploads to Storage lives in `kudos-compose-writes-*`. Read-only
  specs guard against it: `blockKudosSends(page)` aborts any server-action POST that carries `contentHtml`,
  and the tests assert zero attempts.
- Each write test: fresh sender (`testUser` fixture), fresh recipient (`createTestUser`), unique `e2e_<8hex>`
  hashtags and a unique content token. `afterEach` runs `cleanupComposeRun`: kudos of the run's profiles
  (explicit delete), `hashtags ilike 'e2e\_%'`, Storage objects at the paths the user reserved (registry `kudos_image_uploads`; paths carry no uid), then the users. Failures
  are collected and rethrown together.
- Seed-sanity checks 388 kudos (table and `kudos_feed`), 8 hashtags, no e2e hashtags, top-5 like counts
  `[1000,980,960,940,920]`, persona stats 25/25/25, no e2e auth users, no orphan Storage folder.
- Run one write file on its own with `npx playwright test e2e/kudos-compose-writes-submit.spec.ts --project=kudos-writes --no-deps`.
- The F006 read suite (PR #6) is not on this branch. Its seed invariants are enforced by the seed-sanity spec.

## TC map (digest buckets; ID-xx = MoMorph TC row)

| TC | Coverage |
|----|----------|
| ID-0 | e2e `open-and-layout` (signed-in pill opens modal) |
| ID-1 | e2e `open-and-layout` (guest pill is a link to `/login?next=%2Fkudos`, no modal) |
| ID-2, ID-3, ID-4, ID-5, ID-6 | e2e `open-and-layout` (fields, order by y-position, placeholders, checkbox unchecked) |
| ID-7/50, ID-11/51, ID-14/52, ID-56 | e2e `validation` (red field, required text, no submit, all three at once) |
| ID-48/49 | DEVIATION (clarifications): Gửi stays enabled and validates on click; asserted in `validation` ID-56 |
| ID-8/25, ID-9, ID-10, ID-26 | e2e `validation` (filter, special chars, trim, pick fills and closes) |
| typed-not-picked recipient, self never offered | e2e `validation` |
| ID-12/13/33 | e2e `editor` (@ suggestion, pick inserts mention, Esc closes the list only) |
| ID-27 (bold), ID-30 (ordered list) | e2e `editor` (browser spot-check, see deferred) |
| ID-28, ID-29, ID-32 (italic, strike, quote) | unit only: `kudos-editor-format-commands.test.ts` (see deferred) |
| ID-31 (link) | e2e `editor` (`javascript:` URL refused, no anchor inserted) |
| ID-15 | e2e `writes-submit` (one tag, card at feed top, DB row) |
| ID-16, ID-17/53 | e2e `validation` (five accepted; sixth refused with "Tối đa 5 hashtag") |
| ID-34/35, ID-36 | e2e `validation` (typed and dropdown add, chip remove) |
| invalid hashtag characters | e2e `validation` (not added, alert shown; message text is a finding, see below) |
| ID-18, ID-19/38/54, ID-20 | e2e `writes-images` (three, five, add control hidden at five) |
| ID-21/22/37 | e2e `writes-images` (jpg and png upload and decode) |
| ID-23/24/55 | e2e `writes-images` (pdf, mp4, txt refused; nothing uploaded) |
| over 5 MiB | e2e `writes-images` (size error; nothing uploaded) |
| ID-39, ID-40 | e2e `writes-images` (remove frees a slot, add returns) |
| ID-41, ID-42, ID-43/44 | e2e `writes-anonymous` (checkbox, name field, alias, "Ẩn danh") |
| SC-016 | e2e `writes-anonymous` (public `profile_kudos_stats` unchanged; `viewer_kudos_stats` +1) |
| SC-012 | e2e `writes-anonymous` (guest view masked; `kudos_feed.sender_id` null; `kudos.sender_id` unreadable for anon and authenticated; PostgREST embed denied) |
| ID-45 | e2e `open-and-layout` (Hủy and Esc discard; reopened modal empty; overlay click is inert, SC-008) |
| ID-46 (text) | e2e `writes-submit` (title, bold, mention, two hashtags, loading held then released, toast, card, row) |
| ID-46 (images) | e2e `writes-submit` — GREEN (next/image storage hosts whitelisted; dev allows local IP) |
| ID-47 | e2e `writes-submit` (no images, empty image list) |
| FR-015 | e2e `writes-submit` (dropped action: error toast, values kept, nothing stored) |
| SC-015 | e2e `open-and-layout` (EN copy on the same modal) |
| SC-011 | e2e `writes-db-rules` (anon denied; self, 0 and 6 tags, 6 reserved images, unregistered / foreign-registry / external-host / over-long URLs, content > 50000, blank text, title length, anonymous name without flag; valid call; raw HTML stored as given, feed exposes content_text) — GREEN (send_kudos anchors the full storage origin via app_settings + registry ownership) |
| SC-014 | e2e `images-storage-rules` (anon denied, unregistered / legacy uid-folder / foreign-reserved paths denied, reserve RPC, registry unreadable, text/plain and PDF denied, 5 MiB+1 denied, bucket config) + `writes-db-rules` (reserved-path upload, public URL 200, RPC accepts it) + `writes-anonymous-images` (anonymous + images leaks no auth uid; `profiles.auth_user_id` permission-denied; normal kudos with images) |

## Open defects

None. Two defects found by this suite were fixed at the root cause and re-verified (181/181 twice):
1. `send_kudos` now anchors the FULL storage origin (`app_settings.storage_public_base`) and requires
   registry-owned, identity-free `<uuid>/<uuid>.<ext>` paths — foreign hosts and legacy uid folders are refused.
2. `next/image` now whitelists the Supabase Storage hosts (`127.0.0.1:54321` locally, `*.supabase.co` hosted)
   and allows local-IP upstreams outside production, so storage-hosted images render on the board.

## Observations (no red test)

- (fixed) The image-format copy now matches the JPG/PNG-only rule; send_kudos anchors the full storage origin via app_settings; next/image whitelists the Supabase Storage hosts.
- An invalid hashtag (for example `bad tag!`) shows "Không được để trống" (required). `mergeHashtag` returns
  `invalid`, which the controller maps to the required message. The test asserts only that the chip is not added and an alert shows.
- Removing a thumbnail does not delete its Storage object (no client delete policy). The object is an accepted orphan
  and is removed by test cleanup only.

## Deferred / not in the browser

- ID-28 (italic), ID-29 (strike), ID-32 (quote): TipTap toggles share the path proven by bold and the ordered list.
  Their command-to-format mapping is asserted by `kudos-editor-format-commands.test.ts`. Adding them browser-level would
  cost about 10 s each with no new branch.
- 5000-character cap: optional per the plan. Length enforcement is in `kudos-compose-limits` and the send
  validation tests. Not driven in the browser.
- Sanitizer and reducer edge cases (allow-list, entity decoding, reducer transitions): unit only, by design.
- jsdom-only editor behaviors are not run here; the editor specs use the real TipTap in Chromium.
