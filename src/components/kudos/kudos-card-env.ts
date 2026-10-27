import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { KudosFilters } from "@/lib/kudos/kudos-board-types";
import { PROFILE_PATH } from "@/lib/site/site-routes";

/** Everything a card needs besides the post itself; all fields are serializable (client-safe). */
export interface KudosCardEnv {
  signedIn: boolean;
  filters: KudosFilters;
  messages: Pick<KudosMessages, "card" | "stars" | "heroLabels">;
  /** Profile Sent list only: label of the "Ẩn danh" chip on the viewer's own anonymous sends. The board never sets it. */
  anonymousChipLabel?: string;
}

/** Visitors are sent to login (return-to /kudos) instead of the gated target (FR-019). */
export function gatedHref(signedIn: boolean, target: string): string {
  return signedIn ? target : KUDOS_LOGIN_HREF;
}

/** Profile link; with an id it targets that person's profile (`?id=`), without it the viewer's own. */
export function profileHref(signedIn: boolean, profileId?: string): string {
  return gatedHref(signedIn, profileId ? `${PROFILE_PATH}?id=${encodeURIComponent(profileId)}` : PROFILE_PATH);
}
