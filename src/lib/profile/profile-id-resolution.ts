import { isUuid } from "@/lib/kudos/kudos-uuid";
import type { ProfileFace, ProfileKudosDirection, ProfileTarget } from "./profile-types";

const NOT_FOUND: ProfileTarget = { kind: "not-found" };

/**
 * Pure: maps the raw `?id` to a face before any query runs. Repeated (array), whitespace-bearing or
 * non-uuid values are not-found; absent/empty is self; the viewer's own id (any case) is self.
 */
export function resolveProfileTarget(raw: string | string[] | undefined, viewerProfileId: string): ProfileTarget {
  if (Array.isArray(raw)) return NOT_FOUND;
  if (raw === undefined || raw === "") return { kind: "self" };
  if (!isUuid(raw)) return NOT_FOUND;
  const id = raw.toLowerCase();
  return id === viewerProfileId.toLowerCase() ? { kind: "self" } : { kind: "other", profileId: id };
}

/** `sent` only counts on the self face and only for the exact value `sent`; everything else is received. */
export function parseProfileDirection(raw: string | string[] | undefined, face: ProfileFace): ProfileKudosDirection {
  return face === "self" && raw === "sent" ? "sent" : "received";
}
