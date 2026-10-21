# Clarifications — Countdown Prelaunch (screen 8PJQswPZmU)

## Session 2026-10-20

- Q: Target datetime source (spec says "from API", TODO endpoint)? → A: API route reads server env — GET /api/event-config returns {startAt} from EVENT_START_AT server env
- Q: Scope of "navigation locked until countdown reaches 0"? → A: Site-wide gate via proxy — before launch every route (except /countdown, /login, /auth, api/assets) redirects to /countdown; after launch all open
- Q: Who bypasses the gate before launch time? → A: Admin bypass — app_metadata.role === 'admin' browses normally; guests and normal users redirected to /countdown
- Q: Behavior on the prelaunch page when countdown hits 0? → A: Auto-redirect to homepage (~1–2s after zero); gate opens simultaneously
- Q: Unify event date env (homepage uses NEXT_PUBLIC_EVENT_START_AT, gate/API need server env)? → A: Unify on EVENT_START_AT server env — homepage server component reads it directly, prelaunch via /api/event-config, proxy reads it directly; drop NEXT_PUBLIC_EVENT_START_AT
- Q: Post-launch behavior when visiting /countdown directly? → A: Proxy inverts — after launch /countdown redirects to /; before launch all other routes redirect to /countdown
- Q: EVENT_START_AT missing or invalid — gate behavior? → A: Fail-open — treated as launched: no gate, /countdown redirects to /
- Q: DAYS/HOURS/MINUTES labels in Vietnamese locale? → A: Keep EN uppercase in both locales (matches frame; PM review note like other EN drafts)
- Q: /api/event-config fetch failure handling on the page? → A: Page renders server-side reading EVENT_START_AT directly (startAt passed as prop, no runtime fetch); /api/event-config still exists per spec for other clients
- Q: Days above 99 display? → A: Cap at 99 (spec format 00–99, two LED boxes)
