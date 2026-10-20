# Supabase local + Google OAuth setup (F001 Login)

## Prerequisites
- Node 20+ and Docker running (required by `npx supabase start`). The CLI is a dev dependency; no global install.

## 1. Google Cloud Console
1. APIs & Services > Credentials > Create credentials > OAuth client ID, type **Web application**.
2. Authorized redirect URI: `http://127.0.0.1:54321/auth/v1/callback`.
3. Copy the client ID and secret.

## 2. Environment files
```bash
cp supabase/.env.example supabase/.env   # fill GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
npx supabase start                       # boots the local stack (needs Docker)
npx supabase status                      # prints the anon key
cp .env.example .env.local               # set NEXT_PUBLIC_SUPABASE_ANON_KEY from status
```
`supabase/.env` and `.env.local` are git-ignored; only `*.example` files are tracked. Only the anon (public) key reaches the browser; the Google secret stays in `supabase/.env`.

## 3. Flow
Browser -> Google -> `http://127.0.0.1:54321/auth/v1/callback` (Supabase) -> `http://localhost:3000/auth/callback` (Next app). The latter is allow-listed in `supabase/config.toml` (`additional_redirect_urls`).

## 4. Notes
- After changing `supabase/.env` or `config.toml`, run `npx supabase stop && npx supabase start`.
- With blank Google credentials, sign-in fails with a generic provider error until they are filled.
- Unit tests (`npm test`) do not need Docker.
