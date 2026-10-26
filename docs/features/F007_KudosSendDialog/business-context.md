---
status: implemented
fcode: F007
authored_by: takumi
created: 2026-10-22
lang: en
---

# Business Context — KudosSendDialog

## Why It Matters

Sun* Annual Awards 2025 builds a culture of saying thanks, and the Kudos live board is where those thanks are seen. Until now the board only shows seeded notes: a Sunner can read it but cannot add to it. The "Viết Kudo" dialog closes that loop. A Sunner can thank a teammate in their own words, with formatting, a short title (danh hiệu), hashtags that group the note with similar ones, and photos, and see it appear at the top of the board at once. Sending anonymously is allowed for people who want to give thanks without being named; the board then shows a neutral name and avatar, and nothing public can reveal who wrote it. Sending requires a signed-in Sunner so every note is attributable internally, and nobody can send a kudos to themselves.

## Who Uses It

- **Visitor (not signed in)** — can read the board but cannot write. Pressing the "send" pill takes them to the login page and back to the board after sign-in.
- **Signed-in Sunner (sender)** — opens the dialog, writes and sends a kudos, optionally anonymously. Sees their new kudos first in the feed. Cannot heart their own kudos, even an anonymous one.
- **Recipient Sunner** — the teammate being thanked; appears on the board as the receiver. For an anonymous kudos they cannot tell who sent it.
- **Readers (everyone)** — see the kudos on the board, with the sender's name and avatar or, for anonymous ones, the alias and default avatar.
- **Admin / operator** — no admin screen in this task. The database still records the sender of an anonymous kudos for accountability; it is not exposed publicly.

## What They Do

1. A signed-in Sunner clicks the input pill on the Kudos board; the "Viết Kudo" dialog opens.
2. They search for a teammate by name and pick them from the list (they cannot pick themselves).
3. Optionally they give the teammate a danh hiệu (a short title shown on the card).
4. They write the thank-you message, using bold, italic, strike, numbered list, link or quote, and may mention colleagues with "@" and a name.
5. They add 1 to 5 hashtags, picking existing ones or typing new ones.
6. Optionally they add up to 5 photos (jpg or png, up to 5 MB each) and remove any they do not want.
7. Optionally they tick "Gửi lời cám ơn và ghi nhận ẩn danh" and may type an anonymous name; empty means the board shows "Ẩn danh".
8. They press "Gửi". If something required is empty (recipient, message or hashtags) each empty field turns red with "Không được để trống" and nothing is sent. Otherwise the button shows it is working, the dialog closes, the board refreshes with the new kudos on top, and a success message appears.
9. They can press "Hủy" (or the Esc key) at any time to close the dialog and throw everything away; clicking outside the dialog does nothing.
10. A visitor who clicks the pill goes to the login page and returns to the board after signing in.

## Unresolved Questions

- **Button behavior vs design text:** the design says "Gửi" is disabled until the form is complete, but the test cases click it and expect red errors. Decision: the button is always clickable and validates on click. PM to confirm; recorded as a known deviation.
- **Danh hiệu asterisk:** the frame marks "Danh hiệu" as required, the spec and test cases do not. Decision: optional. PM to confirm.
- **"Tiêu chuẩn cộng đồng" link:** the frame shows it beside the formatting buttons; its destination (a community-guidelines screen) is a separate task, so it goes to a placeholder for now.
- **Anonymous name wording:** the placeholder "Tên hiển thị ẩn danh" and the default alias "Ẩn danh" are developer drafts pending PM review. English copy overall is also a draft.
- **Copy not in the design:** wrong-file-type, file-too-large, upload-failed, send-failed and send-succeeded messages, empty recipient list, link-dialog labels. Developer-draft Vietnamese and English wording ships; PM to review.
- **Anonymous sender count (decided):** an anonymous kudos is not counted in the sender's publicly shown "kudos sent" total, so the total cannot hint at who sent it; the sender's own sidebar total counts it.
- **Photo clean-up (accepted risk):** photos are uploaded as soon as they are picked; photos from a dialog that is then cancelled stay in storage and no clean-up is planned.
- **Link behavior:** the design's "open in new tab" choice in the link dialog is simplified to the editor's default behavior.
- **Out of scope:** notifications to the recipient or to mentioned people, milestone or gift events, editing or deleting a sent kudos.
