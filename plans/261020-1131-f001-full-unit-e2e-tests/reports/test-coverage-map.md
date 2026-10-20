# F001 Test Coverage Map (TC001–TC041)

Source: `docs/features/F001_LoginWithGoogle/test-cases.md`. Run: vitest 75/75, Playwright 23/23 (x2 each).
UT = vitest (file: `src/...`), E2E = Playwright (file: `e2e/...`).

| TC | Type | Automated test (file › name) | MANUAL (reason) |
|----|------|------------------------------|-----------------|
| TC001 | UT | `src/lib/auth/decide-route-redirect.test.ts` › "sends authenticated user on /login to /todo"; E2E `e2e/authenticated.spec.ts` › "TC022 / TC001 / TC039" | — |
| TC002 | UT | `decide-route-redirect.test.ts` › "sends unauthenticated user on /todo to /login"; E2E `e2e/login-unauthenticated.spec.ts` › "TC021 / TC002 …" | — |
| TC003 | UT | `decide-route-redirect.test.ts` › "lets unauthenticated user view /login"; E2E `login-unauthenticated.spec.ts` › "TC003 /login without a session is shown" | — |
| TC004 | UT | `decide-route-redirect.test.ts` › "lets authenticated user view /todo"; E2E `authenticated.spec.ts` › "TC033 / TC004 / TC037" | — |
| TC005 | UT | `src/lib/auth/resolve-callback-redirect.test.ts` › "redirects to /login?error=oauth when provider returned an error"; E2E `login-unauthenticated.spec.ts` › "TC005 provider error on the callback…" | — |
| TC006 | UT | `resolve-callback-redirect.test.ts` › "redirects to failure when code is missing"; E2E `login-unauthenticated.spec.ts` › "TC023 / TC006 / TC007 / TC028 …" | — |
| TC007 | UT | `resolve-callback-redirect.test.ts` › "redirects to failure when the exchange failed"; E2E as TC006 | — |
| TC008 | UT | `resolve-callback-redirect.test.ts` › "redirects to /todo on success" | Real exchange with a real code is MANUAL under TC020 |
| TC009 | E2E | `e2e/authenticated.spec.ts` › "TC009 / TC041 an account with an arbitrary domain is admitted" | Real Google account variant (see TC041) |
| TC010 | UT | `src/lib/i18n/login-dictionary.test.ts` › "returns English message for en"; `src/lib/i18n/locale.test.ts` › "accepts en" | — |
| TC011 | UT | `src/lib/i18n/locale.test.ts` › "falls back to vi for undefined"; `src/components/login/language-selector.test.tsx` › "TC011/TC034: vi shows VN and the flag" | — |
| TC012 | UT | `locale.test.ts` › "falls back to vi for 'fr'"; `language-selector.test.tsx` › "TC012: unsupported locale value falls back to the VN option"; E2E `login-unauthenticated.spec.ts` › "TC012 tampered NEXT_LOCALE cookie…" | — |
| TC013 | UT | `src/lib/i18n/login-dictionary.test.ts` › "has identical keys in vi and en"; `src/components/login/login-layout-parts.test.tsx` › "LoginFooter … TC013/TC035" | — |
| TC014 | UT | `src/components/login/google-login-button.test.tsx` › "TC014: click in idle calls onLogin once"; `login-page-client.test.tsx` › "TC014/TC018/TC036 …"; `login-layout-parts.test.tsx` › "TC014: loading disables the button" | — |
| TC015 | E2E | `e2e/login-oauth-start.spec.ts` › "TC015 page showing Back from Google restores an enabled login button"; UT `login-page-client.test.tsx` › "TC015: page show with persisted=true re-enables the button" | Real browser Back from Google's page (partly covered: bfcache reproduced via pageshow) |
| TC016 | UT | `src/app/login/has-login-error.test.ts` › "true only for error=oauth"; `login-page-client.test.tsx` › "TC016/TC038 …"; E2E `login-unauthenticated.spec.ts` › "TC016 / TC038 ?error=oauth…" and "TC016 unrelated error value…" | — |
| TC017 | UT | `login-page-client.test.tsx` › "TC017: clicking again from error clears the message and re-enters loading" | — |
| TC018 | UT + E2E | `login-page-client.test.tsx` › "TC014/TC018/TC036 … callback redirectTo"; E2E `login-oauth-start.spec.ts` › "TC036 / TC018 / TC014 …" | — |
| TC019 | UT | `login-page-client.test.tsx` › "TC019: SDK error returns to idle with the error message…" and "TC019/TC029: thrown rejection…" | Real missing-provider config is MANUAL (TC029); unit mocks the SDK error |
| TC020 | UT (branch only) | `resolve-callback-redirect.test.ts` › "redirects to /todo on success" (mocked exchange) | MANUAL: needs a real Google authorization code exchanged by real Supabase |
| TC021 | E2E | `e2e/login-unauthenticated.spec.ts` › "TC021 / TC002 /todo without a session redirects server-side to /login without remembering the URL" | — |
| TC022 | E2E | `e2e/authenticated.spec.ts` › "TC022 / TC001 / TC039 signed-in user opening /login is redirected to /todo" | — |
| TC023 | E2E | `e2e/login-unauthenticated.spec.ts` › "TC023 / TC006 / TC007 / TC028 /auth/callback is reachable without a session…" | — |
| TC024 | UT + E2E | `google-login-button.test.tsx` › "TC024: clicks while loading are ignored"; `login-page-client.test.tsx` › "TC024: repeated click…"; E2E `login-oauth-start.spec.ts` › "TC024 double click starts exactly one sign-in flow" | — |
| TC025 | E2E | `e2e/authenticated.spec.ts` › "TC025 garbage session cookie redirects /todo to /login without a 500" and "TC025 revoked session … never serves /todo content" | — |
| TC026 | E2E | `e2e/authenticated.spec.ts` › "TC026 after logout, Back does not serve /todo" | — |
| TC027 | E2E | `e2e/authenticated.spec.ts` › "TC027 / TC040 logout clears the session and redirects to /login" | — |
| TC028 | E2E | `e2e/login-unauthenticated.spec.ts` › "TC023 / TC006 / TC007 / TC028 …" (invalid code path) | Replay of a genuinely used code is MANUAL (needs a real consumed code) |
| TC029 | UT (simulated) | `login-page-client.test.tsx` › "TC019/TC029: thrown rejection is handled the same way" | MANUAL: requires blank GOOGLE_CLIENT_ID/SECRET and restarting Supabase |
| TC030 | UT (partial) | `login-page-client.test.tsx` › "TC030: failed locale persistence is logged and the UI still switches" | MANUAL: browser with cookies blocked. Unit covers only the setLocale-rejection branch, not the sign-in failure |
| TC031 | UT + E2E | `login-layout-parts.test.tsx` › "TC031: English error wording renders when supplied"; `login-page-client.test.tsx` › "TC031: …re-rendered in English"; E2E `login-unauthenticated.spec.ts` › "TC031 switching language while the error is shown…" | — |
| TC032 | UT + E2E | `language-selector.test.tsx` › "TC032: picking EN calls onLocaleChange('en')" (+4 more TC032 cases); `login-page-client.test.tsx` › "TC032/TC035 …"; E2E `login-unauthenticated.spec.ts` › "TC035 / TC032 switching to EN…" | — |
| TC033 | E2E | `e2e/authenticated.spec.ts` › "TC033 / TC004 / TC037 /todo shows the signed-in user's name, email and a logout control"; UT `src/lib/auth/get-display-user.test.ts` (7 cases) | — |
| TC034 | UT + E2E | `google-login-button.test.tsx` › "TC034: idle state renders label, icon, enabled"; `login-page-client.test.tsx` › "TC034: first visit…"; E2E `login-unauthenticated.spec.ts` › "TC034 first visit shows ROOT FURTHER intro…", "TC034 language dropdown…", "TC034 footer stays fixed…", "TC034 interactive control exposes a pointer cursor on hover" | — |
| TC035 | UT + E2E | `login-layout-parts.test.tsx` › "LoginFooter / LoginHero … TC034/TC035"; E2E `login-unauthenticated.spec.ts` › "TC035 / TC032 switching to EN translates all text…" | — |
| TC036 | UT + E2E | `login-page-client.test.tsx` › "TC014/TC018/TC036 …"; `google-login-button.test.tsx` › "TC014/TC036: loading state disables the button…"; E2E `login-oauth-start.spec.ts` › "TC036 / TC018 / TC014 …" | — |
| TC037 | E2E | `e2e/authenticated.spec.ts` › "TC033 / TC004 / TC037 …" (post-login half) | Google account chooser and confirmation are MANUAL (real Google UI; never contacted by tests) |
| TC038 | UT + E2E | `login-layout-parts.test.tsx` › "TC016/TC038: errorMessage renders role=alert under the button"; `login-page-client.test.tsx` › "TC016/TC038 …"; E2E `login-unauthenticated.spec.ts` › "TC016 / TC038 …" | Real consent-step cancel on Google is MANUAL (UI half automated) |
| TC039 | E2E | `e2e/authenticated.spec.ts` › "TC022 / TC001 / TC039 …" | — |
| TC040 | E2E | `e2e/authenticated.spec.ts` › "TC027 / TC040 logout clears the session and redirects to /login" | — |
| TC041 | E2E | `e2e/authenticated.spec.ts` › "TC009 / TC041 an account with an arbitrary domain is admitted" | MANUAL: a real, never-listed Google account (tests use an admin-created user) |

## Stats

- 41 TCs total. Every TC has at least one automated test or a manual justification. No TC is uncovered without justification.
- **Automated, no MANUAL remainder: 30** — TC001–TC007, TC010–TC014, TC016–TC018, TC021–TC027, TC031–TC036, TC039, TC040.
- **Automated, with a MANUAL remainder: 8** — TC008, TC009, TC015, TC019, TC028, TC037, TC038, TC041.
- **Weak or manual-dominant: 3** — TC020 (branch only), TC029 (simulated), TC030 (partial).
- Check: 30 + 8 + 3 = 41.

## Flags

1. **TC030 is weakly covered.** The unit test covers only "setLocale rejects, UI still switches". The cookies-blocked sign-in failure has no automated test. Keep MANUAL; do not claim covered.
2. **TC028 replay** has only the invalid-code E2E. A true replay needs a consumed code. Keep MANUAL.
3. **TC029 and TC019** share one unit test title. TC029 (blank credentials) is simulated by a thrown rejection. Real config failure stays MANUAL.
4. **TC020 is branch-only.** `resolve-callback-redirect` mocks the exchange. Real code exchange is MANUAL.
5. **TC015** is unit-simulated (`pageshow persisted=true`); the real Back-from-Google bfcache path is not reproduced.
6. **Stale doc:** `e2e/README.md` "Known findings" still says the TC034 cursor test is a `test.fixme`. It is now an active test that passes (`cursor-pointer` added). Not edited here; flagged for doc owner.
7. TC011 row in `locale.test.ts` covers `undefined → vi` via the parametrized fallback list. Not a dedicated named case.
