const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Shape check for ids that arrive from outside (client input, URL); runs before any query or filter. */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
