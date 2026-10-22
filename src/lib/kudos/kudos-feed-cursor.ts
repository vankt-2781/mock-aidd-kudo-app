export interface FeedCursor {
  createdAt: string;
  id: string;
}

// Strict shapes: the cursor is interpolated into a PostgREST `or()` filter, so anything
// outside these patterns must be rejected rather than escaped.
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function encodeCursor({ createdAt, id }: FeedCursor): string {
  return `${createdAt}|${id}`;
}

export function decodeCursor(value: string | null | undefined): FeedCursor | null {
  if (!value) return null;
  const parts = value.split("|");
  if (parts.length !== 2) return null;
  const [createdAt, id] = parts;
  if (!ISO_TIMESTAMP.test(createdAt) || Number.isNaN(Date.parse(createdAt)) || !UUID.test(id)) return null;
  return { createdAt, id };
}
