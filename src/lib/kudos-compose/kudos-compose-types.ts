/** Wire shape of the compose form sent to `sendKudos`. Never carries a sender id (BR-005 / SC-011). */
export interface SendKudosInput {
  receiverId: string;
  title: string;
  /** Editor HTML; untrusted, sanitized server-side. */
  contentHtml: string;
  hashtags: string[];
  /** Public Storage URLs inside the caller's own `kudos-images/<uid>/` folder. */
  images: string[];
  isAnonymous: boolean;
  anonymousName: string;
}

export type SendKudosField = "recipient" | "content" | "title" | "hashtags" | "images" | "anonymousName";

export type SendKudosResult =
  | { status: "ok"; kudosId: string }
  | { status: "unauthenticated" }
  | { status: "invalid"; fields: SendKudosField[] }
  | { status: "error" };

/** A recipient suggestion; same shape the compose modal renders. */
export interface ComposeSunnerOption {
  id: string;
  name: string;
  avatarUrl: string;
}
