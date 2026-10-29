---
status: implemented
fcode: F009
authored_by: takumi
created: 2026-10-28
lang: en
---

# Business Context — Open Secret Box

## Why It Matters

Sending and receiving Kudos earns Secret Boxes, but today a box is only a number. Opening one is the reward moment: a surprise badge that the Sunner then keeps on their Profile. Because badges are prizes, the draw must be fair and impossible to game: the result is decided by the server with fixed odds, one box at a time.

## Who Uses It

- **Visitor (not signed in)** — cannot open boxes; clicking the button on the board goes to login.
- **Signed-in Sunner with unopened boxes** — opens boxes from the board sidebar or their own Profile, sees each badge, keeps going until none are left.
- **Signed-in Sunner with no unopened boxes** — button is disabled; nothing to open.
- **Other Sunners** — never see or affect someone else's boxes.
- **Admin / operator** — no admin screen; odds are fixed in the database function.

## What They Do

1. Click "Mở Secret Box" on `/kudos` (sidebar) or on their own Profile.
2. See "KHÁM PHÁ SECRET BOX CỦA BẠN", the gift box and how many boxes are left unopened.
3. Click the box; the title changes to "MỞ SECRET BOX THÀNH CÔNG" and the received badge appears in the box.
4. See the count drop by one; if boxes remain, click again ("Click vào box để tiếp tục mở").
5. When the count reaches 0, the instruction disappears and the box stops responding.
6. Close the modal; the board or Profile counters are up to date, and on Profile the matching badge slot is lit.

## Unresolved Questions

- **Odds:** Stay Gold 30, Flow to Horizon 25, Beyond the Boundary 10, Root Further 5, Touch of Light 20, Revival 10 (from the decision log); PM to confirm they are final.
- **Legacy opened boxes:** boxes opened before this feature have no badge; PM to decide whether to backfill.
- **Other people's badges:** whether a colleague's collection should show their badges; default is own Profile only.
- **Copy and assets:** error text, badge names in English, the six badge images.
