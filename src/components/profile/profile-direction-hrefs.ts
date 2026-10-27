import { PROFILE_PATH } from "@/lib/site/site-routes";
import type { ProfileDirection } from "./profile-types";

/** `/profile` link for a direction; `selfId` keeps an explicit `?id=` of the viewer's own profile. */
export function profileDirectionHref(direction: ProfileDirection, selfId: string | null): string {
  const params = new URLSearchParams();
  if (selfId) params.set("id", selfId);
  if (direction === "sent") params.set("dir", "sent");
  const query = params.toString();
  return query ? `${PROFILE_PATH}?${query}` : PROFILE_PATH;
}
