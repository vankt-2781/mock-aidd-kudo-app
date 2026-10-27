"use client";

import { useCallback } from "react";

import type { KudosCardEnv } from "@/components/kudos/kudos-card-env";
import { KudosFeedList } from "@/components/kudos/kudos-feed-list";
import { KudosLikeProvider } from "@/components/kudos/kudos-like-provider";
import { getProfileKudosPage } from "@/lib/profile/profile-kudos-actions";
import type { ProfileKudosListData } from "./profile-types";

export interface ProfileKudosFeedProps {
  kudos: ProfileKudosListData;
  env: KudosCardEnv;
  emptyText: string;
}

/** Profile feed: first page from the server, then pages via `getProfileKudosPage` (same list as the board). */
export function ProfileKudosFeed({ kudos, env, emptyText }: ProfileKudosFeedProps) {
  const { profileId, activeDirection, posts, cursor } = kudos;
  const loadPage = useCallback(
    (next: string) => getProfileKudosPage(profileId, activeDirection, next),
    [profileId, activeDirection],
  );
  return (
    <KudosLikeProvider>
      <KudosFeedList
        // Direction + first post id in the key: a switch (or a refresh with a new kudos) discards stale pages.
        key={`${profileId}:${activeDirection}:${posts[0]?.id ?? ""}`}
        initialPosts={posts}
        initialCursor={cursor}
        filters={env.filters}
        env={env}
        emptyText={emptyText}
        loadPage={loadPage}
      />
    </KudosLikeProvider>
  );
}
