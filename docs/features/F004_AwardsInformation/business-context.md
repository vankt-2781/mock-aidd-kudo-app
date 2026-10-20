---
status: draft
authored_by: takumi
created: 2026-10-20
lang: en
---

# Business Context — AwardsInformation

## Why It Matters

Employees and guests need one clear place to learn what the Sun* Annual Awards 2025 recognize, how many prizes exist and what each is worth. Without it the homepage award cards lead nowhere useful, and questions about categories and prizes go to people instead of to the page. The page also points readers to Sun* Kudos, the recognition movement that runs alongside the awards.

This feature replaces the "under construction" Awards page that shipped with the homepage; the homepage itself remains its own feature.

## Who Uses It

- **Visitor (not signed in)** — reads the award system, checks quantities and prizes, follows a link on to Sun* Kudos. No account is needed because the content is general information.
- **Signed-in employee** — same reading experience; being signed in changes nothing on this page.
- **Employee arriving from a homepage award card** — lands directly on the category they picked.

## What They Do

1. A visitor opens the Awards Information page — sees the event keyvisual, the caption "Sun* Annual Awards 2025" and the gold heading "Hệ thống giải thưởng SAA 2025".
2. The visitor looks at the category menu on the left — sees the six categories in fixed order: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP.
3. The visitor selects a category — the page glides to that award, and the selected category is highlighted in gold with an underline while the previous one returns to normal.
4. The visitor reads the award card — sees an image, who the award honors, how many prizes exist and the prize value; for Signature 2025 - Creator, two prize values are shown (individual or team) separated by "Hoặc" (or).
5. The visitor keeps scrolling — the menu highlight moves along to the award being read.
6. The visitor switches the language in the header — all wording on the page changes between Vietnamese and English; award names stay in English.
7. The visitor reaches the Sun* Kudos block at the bottom and selects "Chi tiết" — is taken to the Sun* Kudos page.
8. A visitor who arrived from a homepage award card — is already at the chosen category, highlighted in the menu.

## Unresolved Questions

- **English wording**: the English copy is a developer draft; product owners need to review it before release.
- **Guest access**: the original test case expected guests to be sent to sign-in. The page is public instead, to match the homepage where guests can open award cards. Product owners should confirm this.
- **Page address**: the original test case names a different address for this page. The existing address is kept because the homepage already links to it. Product owners should confirm.
- **Top Talent unit**: the design says individuals; an earlier specification sheet said "unit". The design is followed. Confirm with product owners.
