"use client";

import { useEffect, useRef, useState } from "react";

import { loadMoreKudos } from "@/lib/kudos/kudos-actions";
import type { KudosBoardPost, KudosFeedPage, KudosFilters } from "@/lib/kudos/kudos-board-types";
import type { KudosCardEnv } from "./kudos-card-env";
import { KudosPostCard } from "./kudos-post-card";

export interface KudosFeedListProps {
  initialPosts: KudosBoardPost[];
  initialCursor: string | null;
  filters: KudosFilters;
  env: KudosCardEnv;
  emptyText: string;
  /** Next-page loader (cursor -> page). Must be referentially stable. Defaults to the board's `loadMoreKudos` with `filters`. */
  loadPage?: (cursor: string) => Promise<KudosFeedPage>;
}

/** C.2 feed: server-rendered first page, then keyset pages appended as the sentinel scrolls into view. */
export function KudosFeedList({ initialPosts, initialCursor, filters, env, emptyText, loadPage }: KudosFeedListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const sentinel = useRef<HTMLDivElement>(null);
  const loading = useRef(false);
  const { hashtag, department } = filters;

  useEffect(() => {
    const node = sentinel.current;
    if (cursor === null || !node) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || loading.current) return;
      loading.current = true;
      (loadPage ? loadPage(cursor) : loadMoreKudos({ hashtag, department }, cursor))
        .then((page) => {
          setPosts((current) => {
            const known = new Set(current.map((post) => post.id));
            return [...current, ...page.posts.filter((post) => !known.has(post.id))];
          });
          setCursor(page.nextCursor);
        })
        .catch((error: unknown) => {
          // Stay armed: the next intersection (scroll away and back) retries the same cursor.
          console.error("[kudos] load more failed", error);
        })
        .finally(() => {
          loading.current = false;
        });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, hashtag, department, loadPage]);

  if (posts.length === 0) {
    return <p className="py-10 text-center text-xl font-bold text-white/80">{emptyText}</p>;
  }
  return (
    <div className="flex w-full flex-col gap-6">
      {posts.map((post) => (
        <KudosPostCard key={post.id} post={post} env={env} />
      ))}
      {cursor !== null ? <div ref={sentinel} aria-hidden className="h-px w-full" /> : null}
    </div>
  );
}
