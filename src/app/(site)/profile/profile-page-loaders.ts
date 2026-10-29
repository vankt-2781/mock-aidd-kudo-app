import { notFound } from "next/navigation";

import { profileDirectionHref, type ProfilePageContentProps } from "@/components/profile";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { ProfileMessages } from "@/lib/i18n/profile-dictionary";
import type { KudosViewer } from "@/lib/kudos/kudos-board-types";
import { getFilterOptions, getViewerStats } from "@/lib/kudos/kudos-board-queries";
import { getProfileFeedPage, getProfileHeader } from "@/lib/profile/profile-queries";
import { getOwnBadgeKeys } from "@/lib/secret-box/secret-box-queries";
import { toBadgeSlots } from "@/lib/secret-box/secret-box-badge-catalog";
import { parseProfileDirection, resolveProfileTarget } from "@/lib/profile/profile-id-resolution";
import type { ProfileHeader } from "@/lib/profile/profile-types";

type RawParam = string | string[] | undefined;

export interface ProfileCopy {
  messages: KudosMessages;
  profileMessages: ProfileMessages;
}

function heroOf(header: ProfileHeader): ProfilePageContentProps["hero"] {
  return {
    name: header.name,
    department: header.department,
    heroTier: header.heroTier,
    stars: header.stars,
    avatarSrc: header.avatarSrc,
  };
}

/**
 * Resolves `?id`/`?dir` and loads everything one face needs. Every failure (bad id, unknown profile,
 * viewer without a profile row) is the same `notFound()` (BR-004). The other face never fetches counts (BR-001).
 */
export async function loadProfilePage(
  viewer: KudosViewer,
  rawId: RawParam,
  rawDir: RawParam,
  { messages, profileMessages }: ProfileCopy,
): Promise<ProfilePageContentProps> {
  if (!viewer.profileId) notFound();
  const target = resolveProfileTarget(rawId, viewer.profileId);
  if (target.kind === "not-found") notFound();

  const cardEnv = {
    signedIn: true,
    filters: { hashtag: null, department: null },
    messages: { card: messages.card, stars: messages.stars, heroLabels: messages.heroLabels },
  };
  const common = { messages, profileMessages };

  if (target.kind === "self") {
    const direction = parseProfileDirection(rawDir, "self");
    const selfId = rawId ? viewer.profileId.toLowerCase() : null;
    // ONE stats fetch feeds both the five counters and the dropdown counts.
    const [header, stats, feed, badgeKeys] = await Promise.all([
      getProfileHeader(viewer.profileId),
      getViewerStats(viewer),
      getProfileFeedPage(viewer.profileId, direction, null, viewer),
      getOwnBadgeKeys(viewer),
    ]);
    if (!header) notFound();
    return {
      ...common,
      face: "self",
      badges: toBadgeSlots(badgeKeys),
      hero: heroOf(header),
      stats,
      directionHrefs: {
        received: profileDirectionHref("received", selfId),
        sent: profileDirectionHref("sent", selfId),
      },
      kudos: { profileId: header.profileId, activeDirection: direction, posts: feed.posts, cursor: feed.nextCursor },
      cardEnv: direction === "sent" ? { ...cardEnv, anonymousChipLabel: profileMessages.anonymousChip } : cardEnv,
    };
  }

  const [header, feed, options] = await Promise.all([
    getProfileHeader(target.profileId),
    getProfileFeedPage(target.profileId, "received", null, viewer),
    getFilterOptions(),
  ]);
  if (!header) notFound();
  return {
    ...common,
    face: "other",
    badges: [],
    hero: heroOf(header),
    kudos: { profileId: header.profileId, activeDirection: "received", posts: feed.posts, cursor: feed.nextCursor },
    cardEnv,
    writeBar: {
      recipient: { id: header.profileId, name: header.name, avatarUrl: header.avatarSrc },
      hashtagNames: options.hashtags,
    },
  };
}
