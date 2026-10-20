# Clarifications — Login Page (/login)

## Session 2026-10-19

- Q: SDD mode for this project? → A: On — spec-first (saved to .claude/.tkm.json)
- Q: Spec/docs language? → A: English
- Q: Tech stack for greenfield repo? → A: Next.js + TypeScript (App Router, src dir, Tailwind)
- Q: Google OAuth credentials for Supabase local? → A: Wire config now, user fills GOOGLE_CLIENT_ID/SECRET in .env later; document setup steps
- Q: Post-login redirect target /todo does not exist? → A: Create minimal protected placeholder /todo (user info + logout), guarded by middleware
- Q: i18n scope for VN/EN language selector? → A: Lightweight vi/en dictionary + NEXT_LOCALE cookie, login screen only (no i18n library)
- Q: Google OAuth flow style (popup vs redirect)? → A: Same-tab redirect (standard Supabase signInWithOAuth)
- Q: Source of English strings (design has Vietnamese only)? → A: Dev drafts EN translations, PM reviews later
- Q: OAuth failure message placement? → A: Inline text directly under the Google login button
- Q: /todo placeholder user fields? → A: Name + email + avatar, plus logout button
- Q: Default language when no NEXT_LOCALE cookie? → A: Always default VN (no Accept-Language detection)
