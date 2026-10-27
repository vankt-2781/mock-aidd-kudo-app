---
status: draft
authored_by: takumi
created: 2026-10-20
lang: en
---

# Screens — HomepageSaa

## Screen List

| Screen Name | SCR### | What User Sees | What User Can Do |
|-------------|--------|----------------|------------------|
| Homepage SAA | TBD (draft) | Fixed header (logo, three nav links, language button, and for signed-in users a bell and account icon); hero "ROOT FURTHER" with countdown, event info and two buttons; Root Further story; six award cards; Kudos promo; floating widget button; footer | Read content; use nav, buttons, cards and promo to open Awards or Kudos pages; switch language; open the bell panel and account menu (signed in); open the widget menu; sign out |
| Awards (placeholder) | TBD (draft) | Page title and an under-construction message, with a section anchor per award category | Return to the homepage; arrive from a card and land on the matching category anchor |
| Kudos (placeholder) | TBD (draft) | Page title and an under-construction message | Return to the homepage |

Profile (now the real F008 page) and the Admin Dashboard placeholder are also reached from the account menu; their screens are TBD (draft) and are not specified here. This homepage supersedes the starter boilerplate home screen.

## User Journey

1. A visitor arrives at the Homepage SAA and sees the hero, the countdown and the event details.
2. The visitor scrolls — reads the Root Further story, then the six award cards.
3. The visitor selects an award card — is taken to the Awards page, scrolled to that category.
4. The visitor goes back and selects the Kudos promo — is taken to the Kudos page.
5. The visitor switches the language from the header — the page changes between Vietnamese and English.
6. A signed-in employee opens the account menu — picks Profile, or signs out; an admin may pick Admin Dashboard.
7. At any point the visitor selects the logo — returns to the top of the Homepage SAA.

```mermaid
journey
    title Homepage SAA user journey
    section Discover
      See hero and countdown: 5: Visitor
      Read story and awards: 4: Visitor
    section Navigate
      Open an award category: 4: Visitor
      Open Kudos page: 3: Visitor
    section Account
      Switch language: 3: Visitor
      Open account menu or sign out: 3: Signed-in user
