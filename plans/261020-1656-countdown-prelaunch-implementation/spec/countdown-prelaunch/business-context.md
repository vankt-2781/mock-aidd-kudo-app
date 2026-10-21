---
status: draft
authored_by: takumi
created: 2026-10-20
lang: en
---

# Business Context — CountdownPrelaunch

## Why It Matters

Before the Sun* Annual Awards 2025 event opens, the site must not be browsable by the public, yet visitors should see something meaningful instead of an error. A countdown page builds anticipation, tells people exactly when the event starts, and sends them to the homepage the moment it does. It also lets the team keep working on the live site during the pre-launch period without exposing unfinished pages. One launch-time setting drives the countdown, the lock and the homepage hero, so they never disagree.

## Who Uses It

- **Visitor (not signed in)** — sees the countdown; every other page redirects here until launch. Can still open the login page.
- **Signed-in employee (not admin)** — same as a visitor: held on the countdown until launch.
- **Admin** — signs in and browses the whole site before launch; still can open the countdown page directly.
- **Operator / deployer** — sets the event start time in one server setting.

## What They Do

1. A visitor opens any page before the event starts — is taken to the countdown page.
2. The visitor reads the title "Sự kiện sẽ bắt đầu sau" (or "Event starts in") and the three boxes DAYS, HOURS, MINUTES — the numbers count down every second.
3. The visitor leaves the page open — when the time arrives all boxes read 00 and, 1.5 seconds later, the homepage opens (if the server clock is slightly behind and sends the visitor back, the page keeps showing 00 and tries again about every 5 seconds).
4. A visitor who opens the countdown page after the event started — is sent straight to the homepage.
5. An admin signs in from the login page before launch — then browses the site normally while others still see the countdown.
6. The operator changes the event start time in the server setting — the countdown, the lock and the homepage hero all follow it.

## Unresolved Questions

- **Unit labels (resolved)**: DAYS / HOURS / MINUTES stay uppercase English in both languages, matching the design. The English title and page tab title are developer drafts; product owners need to review them before release.
- **Bad or missing start time (resolved)**: the site is treated as already launched, so a typo can never hide the whole site.
- **Large day counts (resolved)**: the DAYS box never shows more than 99.
- **Original test cases on access**: the MoMorph test cases left access rules open; the lock-for-everyone-but-admin model was chosen in clarification and should be confirmed by product owners.
- **Loading the start time (resolved)**: the page receives the start time from the server when it is built for the visitor, so there is no "cannot load" moment.
