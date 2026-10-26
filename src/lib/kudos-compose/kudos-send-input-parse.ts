import { ANON_NAME_MAX, CONTENT_TEXT_MAX, MAX_HASHTAGS, MAX_IMAGES, RAW_HTML_MAX, TITLE_MAX } from "./kudos-compose-limits";
import type { SendKudosField } from "./kudos-compose-types";
import { mergeHashtag } from "./kudos-hashtag-normalize";
import { sanitizeKudosHtml } from "./kudos-html-sanitize";
import { isKudosImageUrl } from "./kudos-image-url";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SendKudosContext {
  viewerProfileId: string;
  existingHashtags: readonly string[];
  /** `<supabase url>/storage/v1/object/public` */
  storagePublicBase: string;
}

/** Trusted, sanitized values ready for the `send_kudos` RPC. */
export interface ParsedSendKudos {
  receiverId: string;
  title: string | null;
  html: string;
  text: string;
  hashtags: string[];
  images: string[];
  isAnonymous: boolean;
  anonymousName: string | null;
}

export type ParseSendKudosResult = { ok: true; value: ParsedSendKudos } | { ok: false; fields: SendKudosField[] };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function parseHashtags(raw: unknown, existing: readonly string[]): string[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > MAX_HASHTAGS * 4) return null;
  let selected: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") return null;
    const merged = mergeHashtag(selected, item, existing);
    if (!merged.ok) return null;
    selected = merged.hashtags;
  }
  return selected.length >= 1 ? selected : null;
}

/** Server-side re-validation of everything the client sent (SC-011). Never trusts client checks. */
export function parseSendKudosInput(raw: unknown, ctx: SendKudosContext): ParseSendKudosResult {
  if (!isRecord(raw)) return { ok: false, fields: ["recipient", "content", "hashtags"] };
  const fields: SendKudosField[] = [];

  const receiverId = raw.receiverId;
  if (typeof receiverId !== "string" || !UUID.test(receiverId) || receiverId.toLowerCase() === ctx.viewerProfileId.toLowerCase()) {
    fields.push("recipient");
  }

  let html = "";
  let text = "";
  if (typeof raw.contentHtml !== "string" || raw.contentHtml.length > RAW_HTML_MAX) {
    fields.push("content");
  } else {
    ({ html, text } = sanitizeKudosHtml(raw.contentHtml));
    if (text.length < 1 || text.length > CONTENT_TEXT_MAX) fields.push("content");
  }

  const title = typeof raw.title === "string" ? raw.title.trim() : raw.title === undefined ? "" : null;
  if (title === null || title.length > TITLE_MAX) fields.push("title");

  const hashtags = parseHashtags(raw.hashtags, ctx.existingHashtags);
  if (!hashtags) fields.push("hashtags");

  const images = raw.images === undefined ? [] : raw.images;
  if (
    !Array.isArray(images) ||
    images.length > MAX_IMAGES ||
    !images.every((url) => isKudosImageUrl(url, ctx.storagePublicBase))
  ) {
    fields.push("images");
  }

  const isAnonymous = raw.isAnonymous;
  const anonymousName = typeof raw.anonymousName === "string" ? raw.anonymousName.trim() : raw.anonymousName === undefined ? "" : null;
  if (typeof isAnonymous !== "boolean" || anonymousName === null || (isAnonymous && anonymousName.length > ANON_NAME_MAX)) {
    fields.push("anonymousName");
  }

  if (fields.length > 0 || !hashtags || typeof isAnonymous !== "boolean") return { ok: false, fields };
  return {
    ok: true,
    value: {
      receiverId: receiverId as string,
      title: title ? title : null,
      html,
      text,
      hashtags,
      images: images as string[],
      isAnonymous,
      anonymousName: isAnonymous && anonymousName ? anonymousName : null,
    },
  };
}
