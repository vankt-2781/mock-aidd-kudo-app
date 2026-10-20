---
status: implemented
fcode: F005
authored_by: takumi
created: 2026-10-20
lang: en
---

# Edge Cases — CountdownPrelaunch

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Visitor not signed in, before launch | Any non-excluded page redirects to the countdown | None — countdown page is the message |
| Signed-in non-admin, before launch | Redirected to the countdown like a visitor | None |
| Admin, before launch | Browses normally; may open the countdown page too | None |
| User whose role marker is missing or not "admin" | Treated as a regular user, gated | None |
| Sign-in service unreachable, before launch | User treated as not signed in, gated | None |
| Login page or sign-in return step, before launch | Never redirected, so an admin can sign in and an expired session can reach login | None |
| `/api/event-config` requested, before launch | Not gated; returns the start time | None |
| Static assets, favicon, images, before launch | Not gated | None |
| `/countdown` opened after launch | Redirects to the homepage | None |
| Countdown reaches zero while page is open | Units show 00 00 00, then homepage opens after 1.5 s | None |
| Target already in the past when the page loads | Units show 00; visitor ends on the homepage | None |
| Less than one day remains | DAYS shows 00 | None |
| Single-digit values (for example 5, 9, 0) | Shown zero-padded (05, 09, 00) | None |
| Hours or minutes value out of range (-1, 24+, 60+) or invalid | That unit shows 00 | None |
| Days above 99 | DAYS display is capped at 99 (two LED boxes, format 00-99) | None |
| Start time unset or not a valid ISO datetime with offset | Fail-open: treated as already launched — no gate, `/countdown` redirects to `/` | None |
| Start time source on the page | Read server-side and passed to the ticker; no runtime fetch, so no fetch-failure state. `/api/event-config` serves only external or other clients | None |
| Visitor's device clock is wrong | Display and the zero moment follow the device clock, so they can run early or late versus the server; the proxy gate uses the server clock. The target is offset-based (Asia/Ho_Chi_Minh), so the device time zone does not matter — only drift does | None |
| Device clock behind the server at launch | Page still counts down although the server already allows other routes; a reload leaves via the proxy redirect | None |
| Device clock ahead of the server at zero | Page redirects to `/` once after 1.5 s; the proxy (server time) may bounce a non-admin back to `/countdown`. Loop guard (resolved): the page auto-redirects at most once, then keeps showing `00` and retries the redirect every ~5 s until it sticks | None |
| Locale cookie missing or invalid | Falls back to Vietnamese | None |
| Language switched to English | Title reads "Event starts in"; unit labels DAYS/HOURS/MINUTES stay English uppercase in both locales (English copy pending PM review) | None |
| Background image fails to load | Dark page background and the units stay readable | None |
| Page cached by browser or CDN | The page reads the env per request on the server (dynamic), and `/api/event-config` is non-cached, so a changed setting is picked up on reload | None |
| Hash or query string on a gated URL | Dropped by the redirect to `/countdown` | None |
