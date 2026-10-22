---
status: implemented
fcode: F006
authored_by: takumi
created: 2026-10-21
lang: en
---

# Business Context — KudosLiveBoard

## Why It Matters

Sun* Annual Awards 2025 includes a company-wide culture of saying thanks. The Kudos live board is the public wall where those thank-you notes are seen: the most-loved kudos are featured, every kudos is browsable, and the most-thanked colleagues stand out. Seeing recognition in one place encourages more of it. Anyone can read the board, but liking a kudos, sending one or opening a gift needs a signed-in Sunner, so the board stays open to look at while participation stays attributable. This feature also lays the first real data foundation (people, departments, hashtags, kudos, likes, leaderboard events) that the later Kudos screens (send dialog, kudo detail, profile, Secret Box) build on.

## Who Uses It

- **Visitor (not signed in)** — reads the whole board (banner, highlights, spotlight, feed, gift list). Any action that needs an identity sends them to the login page. Does not see personal stats.
- **Signed-in Sunner** — everything a visitor does, plus likes and unlikes other people's kudos, sees personal kudos and heart totals, and can open the gift (Secret Box) and navigate to profiles and kudos details.
- **Kudos sender** — cannot like the kudos they wrote (the heart is disabled for them).
- **Admin / operator** — configures special days that double the hearts a like awards. There is no admin screen yet: for now a special day is data seeded in the database.

## What They Do

1. A visitor opens the Kudos page — sees the banner, the input pill, the top-5 highlight carousel, the spotlight word cloud, the feed and the right sidebar with the gift list.
2. A visitor narrows the board by choosing a hashtag and/or a department — both the highlight carousel and the feed follow the choice, and the carousel returns to slide 1.
3. A visitor pages through the highlights with the arrows (disabled at both ends) and reads the "2/5" position.
4. A visitor explores the spotlight: pans and zooms the cloud, hovers a name to see who and when, types in the search box to highlight matching names, clicks a name to open that kudos (placeholder for now).
5. A visitor scrolls the feed — more kudos load as they near the end; thumbnails open full size; clicking a hashtag filters the board by it.
6. A visitor copies a kudos link — sees the toast "Link copied — ready to share!".
7. A signed-in Sunner taps the heart on someone else's kudos — the heart turns red and the count goes up at once; tapping again undoes it. On a special day the sender of that kudos earns two hearts instead of one, and unliking takes back exactly what was given.
8. A signed-in Sunner reads their own totals in the sidebar (kudos received and sent, hearts received, Secret Boxes opened and unopened) and presses "Mở quà" (placeholder dialog for now).
9. A visitor who taps a heart, the input pill, "Mở quà" or a profile or detail link is taken to the login page and, after signing in, comes back to the Kudos board.

## Unresolved Questions

- **Vietnamese vs English copy**: most design copy is Vietnamese and is shipped exactly as designed; English strings are developer drafts pending PM review.
- **Spotlight search with empty input**: the design says the search is optional, but one original test case (TC-9e689933) expects an empty search to show a "required" error. Decision: empty search does nothing (follows the design). PM to confirm; recorded as a known test-case deviation.
- **"Mở quà" button**: one original test case (43b54c29) expects it to open the Secret Box dialog; that dialog is a separate screen, so for now the button opens a placeholder.
- **Send dialog test cases** (f183a3e4, ca8f60b3): the input pill's required-field and save-to-database checks belong to the separate "Viết Kudo" screen and are deferred to that task.
- **Sidebar lists**: the original spec rows list two leaderboards (promotions and gifts) but the design frame draws only the gift list; the frame is followed. PM to confirm.
- **Gift-event writers, special-day admin screen**: deferred to later tasks; data is seeded.
