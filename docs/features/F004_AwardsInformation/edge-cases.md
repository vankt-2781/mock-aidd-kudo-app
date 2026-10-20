---
status: draft
authored_by: takumi
created: 2026-10-20
lang: en
---

# Edge Cases — AwardsInformation

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Visitor is not signed in | Page opens normally; no redirect to sign-in (recorded deviation from the test case, pending product confirmation) | None — page is public |
| Page opened with an anchor that matches none of the six categories | Page opens at the top, first category highlighted, no error | None — silent handling |
| Page opened with no anchor | Page opens at the top, first category highlighted | None |
| Menu item pressed but its card cannot be found | Nothing scrolls, no error, highlight stays where it was | None — silent handling |
| Visitor pressed a category and the glide passes other cards | Final highlight is the pressed category, not the ones passed over | None |
| Visitor scrolls quickly through several cards | Highlight settles on the card nearest the top once scrolling stops; never two highlighted | None |
| Visitor prefers reduced motion | Pressing a category jumps straight to the card without gliding | None |
| Pressing a category | Address fragment updates to that category without adding a back-button step | None |
| Arriving from a homepage card with a valid anchor | Page opens at that award with the sticky header not covering its title; matching category highlighted | None |
| Signature 2025 - Creator card | Shows two prize values (individual and team) separated by "Hoặc" | None |
| Award whose prize has no note (Best Manager, MVP) | Only the amount is shown, no empty line | None |
| Spec sheet and design disagree on a value (Top Talent unit) | The design value is shown ("Cá nhân"); the sheet is ignored | None |
| Language switched to English | All page wording changes; award names and currency amounts stay as designed | None |
| Language preference missing or invalid | Falls back to Vietnamese | None |
| Small screen | Menu becomes a horizontal strip above the cards; cards stack with image above text | None |
| Sun* Kudos "Chi tiết" pressed | Kudos page opens (placeholder page exists); a simulated network failure is a manual test | None — if the page cannot load, the browser's own error page shows |
| Image fails to load | Card keeps its text and layout; the image area stays empty | None |
