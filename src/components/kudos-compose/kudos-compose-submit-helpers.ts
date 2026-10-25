import { validateComposeForm } from "@/lib/kudos-compose/kudos-compose-form-validation";
import type { SendKudosField, SendKudosInput } from "@/lib/kudos-compose/kudos-compose-types";
import type { ComposeMessages, KudosComposeErrors, KudosComposeValues } from "./kudos-compose-types";

/** Client-side gate: required/too-long fields plus image state; returns localized per-field errors. */
export function validateCompose(
  values: KudosComposeValues,
  editorEmpty: boolean,
  messages: ComposeMessages,
): KudosComposeErrors {
  const flagged = validateComposeForm(
    {
      recipientId: values.recipient?.id ?? null,
      hashtagCount: values.hashtags.length,
      title: values.title,
      anonymousName: values.anonymousName,
    },
    { editorEmpty },
  );
  const errors: KudosComposeErrors = {};
  for (const field of Object.keys(flagged) as (keyof typeof flagged)[]) errors[field] = messages.required;
  if (values.images.some((image) => image.status === "uploading")) errors.images = messages.errors.imageUploading;
  else if (values.images.some((image) => image.status === "failed")) errors.images = messages.errors.uploadFailed;
  return errors;
}

/** Maps the server's rejected fields back onto the form (localized). */
export function serverFieldErrors(fields: SendKudosField[], messages: ComposeMessages): KudosComposeErrors {
  const errors: KudosComposeErrors = {};
  for (const field of fields) {
    errors[field] = field === "images" ? messages.errors.uploadFailed : messages.required;
  }
  return errors;
}

export function buildSendInput(values: KudosComposeValues, contentHtml: string): SendKudosInput {
  return {
    receiverId: values.recipient?.id ?? "",
    title: values.title.trim(),
    contentHtml,
    hashtags: values.hashtags.map((h) => h.id),
    images: values.images.flatMap((image) => (image.status === "done" ? [image.url] : [])),
    isAnonymous: values.anonymous,
    anonymousName: values.anonymous ? values.anonymousName.trim() : "",
  };
}
