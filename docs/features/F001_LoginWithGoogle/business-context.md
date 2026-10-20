---
status: draft
authored_by: takumi
created: 2026-10-19
lang: en
---

## Why It Matters

The Sun* Annual Awards 2025 app needs a single, low-friction front door. Letting people sign in with the Google account they already have removes the need to create or remember another password, and it gives the app a trustworthy way to know who is using it. Every later feature of the app depends on this entry point.

## Who Uses It

- **Visitor (not signed in)** — arrives at the app, wants to get in quickly using their Google account, and may prefer Vietnamese or English for the welcome page.
- **Signed-in user** — already has a session; expects to go straight to their landing page instead of seeing the welcome page again, and expects to be able to sign out.
- **Project team member (setup)** — connects the Google credentials once so that sign-in works for everyone.

## What They Do

1. Visitor opens the welcome page and sees the "ROOT FURTHER" introduction with the invitation to sign in — the page is shown in Vietnamese unless they choose otherwise.
2. Visitor optionally chooses Vietnamese or English from the language selector in the top-right corner — the whole welcome page switches language and the choice is remembered for next time.
3. Visitor presses "LOGIN With Google" — the button shows it is busy and the visitor is taken to Google to pick an account.
4. Visitor picks any Google account and confirms — any Google account is accepted, with no list of approved people.
5. Visitor is brought back to the app and lands on their landing page, where their account details and a sign-out option are shown.
6. If the visitor cancels at Google or something goes wrong, they are brought back to the welcome page with the message "Đăng nhập không thành công. Vui lòng thử lại." and can try again.
7. A signed-in user who opens the welcome page again is taken straight to the landing page; after signing out, the welcome page is shown again.

## Unresolved Questions

- **English wording**: The design provides Vietnamese text only; the English versions of the introduction, button label, error message, and footer need business approval.
- **Landing page details**: Which account details (name, email, picture) the landing page should show is not yet decided.
