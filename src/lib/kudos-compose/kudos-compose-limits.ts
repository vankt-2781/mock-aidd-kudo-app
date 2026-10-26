/** Single source of truth for compose limits (spec BR-004/005, ALG-001); the UI re-exports these. */
export const MAX_HASHTAGS = 5;
export const MAX_IMAGES = 5;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png"] as const;
export const TITLE_MAX = 60;
export const ANON_NAME_MAX = 30;
export const HASHTAG_MAX = 30;
export const CONTENT_TEXT_MAX = 5000;
export const RAW_HTML_MAX = 50_000;
export const SEARCH_LIMIT = 10;
export const SEARCH_QUERY_MAX = 50;
