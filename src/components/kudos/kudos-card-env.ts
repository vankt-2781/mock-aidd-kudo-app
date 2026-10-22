import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { KudosFilters } from "@/lib/kudos/kudos-board-types";
import { PROFILE_PATH } from "@/lib/site/site-routes";

/** Everything a card needs besides the post itself; all fields are serializable (client-safe). */
export interface KudosCardEnv {
  signedIn: boolean;
  filters: KudosFilters;
  messages: Pick<KudosMessages, "card" | "stars" | "heroLabels">;
}

/** Visitors are sent to login (return-to /kudos) instead of the gated target (FR-019). */
export function gatedHref(signedIn: boolean, target: string): string {
  return signedIn ? target : KUDOS_LOGIN_HREF;
}

export function profileHref(signedIn: boolean): string {
  return gatedHref(signedIn, PROFILE_PATH);
}
