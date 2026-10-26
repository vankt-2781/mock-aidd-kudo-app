import { ANON_NAME_MAX, TITLE_MAX } from "./kudos-compose-limits";

export interface ComposeFormValues {
  /** Picked recipient id; null while only a query is typed. */
  recipientId: string | null;
  hashtagCount: number;
  title: string;
  anonymousName: string;
}

export type ComposeFieldError = "required" | "tooLong";
export type ComposeFormErrors = Partial<
  Record<"recipient" | "content" | "hashtags" | "title" | "anonymousName", ComposeFieldError>
>;

/** Client-side gate (DEC-002): required fields flagged together on submit; the server re-validates. */
export function validateComposeForm(values: ComposeFormValues, editor: { editorEmpty: boolean }): ComposeFormErrors {
  const errors: ComposeFormErrors = {};
  if (!values.recipientId) errors.recipient = "required";
  if (editor.editorEmpty) errors.content = "required";
  if (values.hashtagCount < 1) errors.hashtags = "required";
  if (values.title.trim().length > TITLE_MAX) errors.title = "tooLong";
  if (values.anonymousName.trim().length > ANON_NAME_MAX) errors.anonymousName = "tooLong";
  return errors;
}
