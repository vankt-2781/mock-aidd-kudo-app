import sanitizeHtml from "sanitize-html";

const LINK_REL = "noopener noreferrer nofollow";
const BLOCK_TAGS = ["p", "ol", "li", "blockquote"] as const;

/** Allow-list matching the TipTap marks the editor can emit (ALG-002). */
const HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "s", "ol", "li", "blockquote", "a", "span"],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["data-type", "data-id", "data-label"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (tagName, attribs) => {
      const next: Record<string, string> = { ...attribs, rel: LINK_REL };
      if (next.target !== "_blank") delete next.target;
      return { tagName, attribs: next };
    },
    span: (tagName, attribs) => {
      if (attribs["data-type"] === "mention") return { tagName, attribs };
      return { tagName: "", attribs: {} };
    },
  },
};

export interface SanitizedKudos {
  html: string;
  /** Tags removed, entities decoded, whitespace collapsed. */
  text: string;
}

function toPlainText(cleanHtml: string): string {
  const spaced = cleanHtml
    .replace(new RegExp(`</?(?:${BLOCK_TAGS.join("|")})\\b[^>]*>|<br\\s*/?>`, "gi"), " ");
  const stripped = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} });
  return decodeEntities(stripped).replace(/\s+/g, " ").trim();
}

const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Single-pass decode (so `&amp;lt;` becomes `&lt;`, never `<`). */
function decodeEntities(value: string): string {
  return value.replace(/&(?:#(\d{1,7})|#x([0-9a-f]{1,6})|([a-z]+));/gi, (match, dec, hex, name) => {
    if (name) return NAMED_ENTITIES[name.toLowerCase()] ?? match;
    const code = dec ? Number.parseInt(dec, 10) : Number.parseInt(hex, 16);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

/** Sanitizes editor HTML and derives `content_text`. Server-side only: components must not import this. */
export function sanitizeKudosHtml(rawHtml: string): SanitizedKudos {
  const html = sanitizeHtml(rawHtml, HTML_OPTIONS);
  return { html, text: toPlainText(html) };
}
