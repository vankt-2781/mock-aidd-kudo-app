# Business Rules

> DRAFT. Plain-language summary of rules from behavior-logic.md; refine after feature specs (W5).

### Signed-out users cannot reach Todo
**Applies when:** Someone without a verified session requests `/todo` or any page under it.
**Says:** They are redirected to the login page. If the sign-in service is unreachable they are treated as signed out.
**Source artifact:** [Screen flow](screen-flow.md)

---

### Signed-in users skip the login page
**Applies when:** A signed-in user requests `/login`.
**Says:** They are redirected to Todo.
**Source artifact:** [Screen flow](screen-flow.md)

---

### Todo re-verifies the user on load
**Applies when:** The Todo page renders.
**Says:** The server asks the sign-in service for the user. No user or an error sends the visitor to login.
**Source artifact:** [Screen list](screen-list.md)

---

### Sign-in uses Google only
**Applies when:** A visitor presses "Login with Google".
**Says:** The app starts Google sign-in and asks to be returned to its own callback address. The button shows a spinner and is disabled while loading. If starting fails, a localized error is shown and the button re-enables.
**Source artifact:** [Behavior logic](behavior-logic.md)

---

### Back from Google must not leave the button stuck
**Applies when:** The user returns to the login page with the browser Back button after starting sign-in.
**Says:** Loading state resets so they can try again.
**Source artifact:** [Behavior logic](behavior-logic.md)

---

### Callback outcome decides where the user lands
**Applies when:** Google/Supabase returns the user to the callback address.
**Says:** A valid code with no provider error and a successful exchange sends the user to Todo. Anything else (provider error, missing code, failed exchange) sends them to login with an OAuth error message. The destination is always one of these two fixed pages.
**Source artifact:** [Behavior logic](behavior-logic.md)

---

### Sessions refresh automatically
**Applies when:** Any page request, except static files, images and the callback.
**Says:** The session is refreshed and renewed cookies are kept, including on redirects. Identity is verified from signed token claims, not trusted from the cookie alone.
**Source artifact:** [Behavior logic](behavior-logic.md)

---

### Session cookie updates are best-effort on server pages
**Applies when:** A server-rendered page cannot write cookies.
**Says:** The write is skipped silently; the next request refreshes the session instead.
**Source artifact:** [Behavior logic](behavior-logic.md)

---

### Logout ends the session and returns to login
**Applies when:** The user presses Logout on Todo.
**Says:** The session is cleared and the user is sent to login.
**Source artifact:** [Screen list](screen-list.md)

---

### Language choice
**Applies when:** The user picks Vietnamese or English on the login page.
**Says:** Text changes immediately and the choice is saved as a cookie (default Vietnamese; unknown values fall back to default). If saving fails, the screen stays in the new language but the choice is not remembered. The page language attribute follows the selection.
**Source artifact:** [Behavior logic](behavior-logic.md)

---

### Sign-in error message
**Applies when:** Sign-in fails to start, or login loads with the OAuth error marker.
**Says:** A localized error alert shows on the login page.
**Source artifact:** [Screen list](screen-list.md)
