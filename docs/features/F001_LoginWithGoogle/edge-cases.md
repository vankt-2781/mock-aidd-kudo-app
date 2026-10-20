---
status: draft
authored_by: takumi
created: 2026-10-19
lang: en
---

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Visitor cancels or closes the Google consent step | Callback receives a provider error or no code; no session is created; visitor is returned to the Login screen and the button is re-enabled | "Đăng nhập không thành công. Vui lòng thử lại." |
| Google or Supabase fails during sign-in or code exchange (invalid/expired code, provider error, Google credentials not yet configured) | Treated the same as cancel: no session, return to Login screen with the error indicator | "Đăng nhập không thành công. Vui lòng thử lại." |
| Callback address opened directly without a code, or an already-used code is replayed | Exchange is skipped or rejected; no session; redirect to Login screen with the error indicator | "Đăng nhập không thành công. Vui lòng thử lại." |
| Visitor double-clicks the login button | First click disables the button and shows the loader; further clicks are ignored; only one sign-in flow starts | None — silent handling |
| Visitor presses browser Back from Google's page and returns to a restored Login screen | Button is reset from the loading state to enabled so the visitor can retry | None — silent handling |
| Signed-in user opens the Login screen (typed address, bookmark, or Back button) | Guard redirects to the Todo placeholder screen; the Login screen is not shown | None — silent redirect |
| Visitor without a session opens the Todo placeholder screen directly | Guard redirects to the Login screen; the original address is not remembered | None — silent redirect |
| Session expires or is revoked while the user is on the Todo placeholder screen | Next navigation or refresh fails the session check and redirects to the Login screen | None — silent redirect |
| User signs out and presses Back | Todo placeholder is not served without a session; the user lands on the Login screen | None — silent redirect |
| Language cookie holds an unsupported or tampered value | Value is ignored and Vietnamese is used; selector shows "VN" | None — silent fallback |
| Browser blocks cookies | Language choice is not remembered between visits and the session cannot be kept, so sign-in does not complete and the user returns to the Login screen | "Đăng nhập không thành công. Vui lòng thử lại." |
| Visitor switches language while an error message is shown | Error message is re-displayed in the newly selected language | "Sign-in failed. Please try again." (English wording pending approval) |
