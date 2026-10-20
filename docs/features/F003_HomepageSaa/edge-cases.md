---
status: draft
authored_by: takumi
created: 2026-10-20
lang: en
---

# Edge Cases — HomepageSaa

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Event start setting missing, empty or not a valid date | Countdown shows 00 / 00 / 00 and the "Coming soon" label is hidden; page keeps working | None — silent fallback |
| Event start time is reached while the page is open | Next update shows 00 / 00 / 00 and hides "Coming soon"; timer stops | None — silent change |
| Event start is already in the past on load | Same as reached: zeros, label hidden | None — silent handling |
| Countdown values below 10 | Values are zero-padded to two digits (05, 09) | None |
| Award card has no category anchor | Card opens the Awards page without scrolling to a section | None — silent handling |
| Awards page opened with an anchor that matches no section | Page opens at the top; no error | None — silent handling |
| Visitor is not signed in | Bell and account icon are not shown; Admin Dashboard is never offered | None — signed-out header |
| Signed-in user has no admin marker, or an unrecognized one | Treated as a regular user; Admin Dashboard hidden | None |
| Session service cannot be reached | Visitor is treated as signed out; homepage still loads | None — signed-out header |
| Regular user opens the Admin Dashboard address directly | Must be refused server-side; menu hiding alone is not protection (route behavior TBD) | TBD (draft) |
| Notification bell opened (no data source) | Panel opens with an empty state; no unread badge | "Chưa có thông báo" |
| Menu open and visitor clicks elsewhere or presses Esc | Menu closes; Esc returns focus to its trigger | None |
| One menu open and another trigger is used | The first menu closes, the second opens | None |
| Language switched to English | Every homepage string changes; Vietnamese is restored on switching back | None |
| Language cookie missing or invalid | Falls back to the default language (Vietnamese) | None |
| Small screen | Sections stack or shrink; awards grid shows 2 columns on tablet and mobile; text wraps | None |
| Award description longer than two lines | Truncated with an ellipsis | None |
| Sign out chosen from the account menu | Existing sign-out runs; user returns to the signed-out experience | None |
| Server and browser disagree on the current time for the countdown | First paint may differ by one minute; corrected on the next update | None — silent correction |
