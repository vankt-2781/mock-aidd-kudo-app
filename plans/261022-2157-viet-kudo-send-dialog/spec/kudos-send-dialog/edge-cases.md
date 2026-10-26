---
status: draft
authored_by: takumi
created: 2026-10-22
lang: en
---

# Edge Cases — KudosSendDialog

| Scenario | What Happens | User-Facing Message |
|----------|--------------|---------------------|
| Guest clicks the input pill | Redirected to `/login?next=%2Fkudos`; no modal | None |
| Session expires while the modal is open, then "Gửi" | Action reports unauthenticated; modal stays with values; user is sent to `/login?next=%2Fkudos` | None |
| Click "Gửi" with all required fields empty | Red border and message on recipient, content and hashtags; no request (TC ID-56) | "Không được để trống" on each |
| Only some required fields empty | Only the empty ones show errors | "Không được để trống" |
| Danh hiệu left empty | Valid; no error; card shows no title line | None |
| Recipient text typed but no entry picked | Counts as empty recipient | "Không được để trống" |
| Recipient input has leading or trailing spaces | Trimmed before searching (TC ID-10) | None |
| Recipient input has special characters such as `@ # $` | Filtered list or empty result (TC ID-9) | Empty list; copy TBD (draft) |
| Recipient search matches no Sunner | Empty list; nothing can be picked | Copy TBD (draft) |
| Viewer searches for their own name | Own profile is not listed | None |
| Forged send to self | Rejected by the server and by the table check | Generic error toast, copy TBD (draft) |
| Recipient picked, then recipient profile no longer exists at send time | Server rejects; modal stays open | Error toast, copy TBD (draft) |
| Editor holds only an empty paragraph or only spaces | Counts as empty content | "Không được để trống" |
| Pasted rich content with unsupported formatting (headings, images, colors) | Editor keeps what it supports; the server strips the rest | None |
| Forged HTML with script, event handlers or `javascript:` link | Stripped by the server allow-list before storage | None |
| `@` typed with no matching Sunner | No suggestion list; text stays as typed | None |
| Hashtag entered with leading `#`, extra spaces or different case of an existing tag | Normalized and reused; no duplicate chip | None |
| Hashtag already picked is added again | Ignored, no second chip | None |
| Sixth hashtag attempted (dropdown or typing) | Blocked; chips stay at 5 (TC ID-17) | "Tối đa 5 hashtag" |
| Zero hashtags on submit | Error on hashtag field (TC ID-14) | "Không được để trống" |
| Hashtag chip removed down to zero | Field is empty again; error appears on next "Gửi" | None |
| Sixth image attempted | Not possible: add button is hidden at 5 (spec and TC win over the frame) | None |
| Delete an image when 5 are shown | Add button reappears (TC ID-40) | None |
| Select several files that would exceed 5 in one pick | Only up to the remaining slots are accepted; rest rejected | Copy TBD (draft) |
| pdf, mp4, txt or other non-jpg/png file | Rejected, not uploaded (TC ID-23, ID-24, ID-55) | Format error, copy TBD (draft) |
| Image over 5 MB | Rejected, not uploaded | Size error, copy TBD (draft) |
| Image upload fails (network) | That thumbnail shows a failed state; other images unaffected; submit is blocked until it is removed or retried | Error copy TBD (draft) |
| Image URL forged to an external host or another user's folder | Server rejects the submit | Generic error toast |
| "Gửi" clicked repeatedly | First click starts loading; further clicks ignored | None |
| Submit fails (network or server error) | Modal stays open, values kept, loading stops | Error toast, copy TBD (draft) |
| Submit succeeds | Modal closes, board refreshes, new kudos first in feed | Success toast, copy TBD (draft) |
| "Hủy" clicked with data entered | Modal closes, everything discarded, uploaded images remain orphaned in storage | None |
| Esc key | Closes an open dropdown or popup first; otherwise closes the modal and discards like "Hủy" | None |
| Overlay click | Nothing happens; modal stays open | None |
| Anonymous kudos sent | Sender's public sent total is unchanged; the sender's own sidebar total counts it | None |
| Hashtag longer than 30 characters or with characters other than letters, digits, underscore | Refused | Copy TBD (draft) |
| Title over 60, anonymous name over 30, or message text over 5000 characters | Input stops at the limit or is refused on submit | Copy TBD (draft) |
| Anonymous unchecked after typing a name | Name field hides; the name is not sent | None |
| Anonymous checked, name empty | Valid; board shows "Ẩn danh" and the default avatar | None |
| Anonymous kudos viewed by anyone | Alias and default avatar; no sender link, department or stars | None |
| Anonymous kudos viewed by its sender | Same masked card; heart disabled because they cannot like their own kudos | None |
| Anonymous kudos queried directly through public views or tables | No sender id, name or avatar returned | None |
| Legacy kudos (before this feature) | `content_text` backfilled from `content`; no title line; not anonymous | None |
| New kudos while the board is filtered by a hashtag the kudos lacks | After refresh the kudos does not appear until the filter changes | None |
| Concurrent send of a new hashtag by two users | Case-insensitive reuse; one hashtag row; both kudos linked | None |
| Locale `en` | English draft compose copy | Draft strings |
