"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export interface KudosLikeEntry {
  liked: boolean;
  likeCount: number;
  pending: boolean;
}

interface LikeStore {
  entries: Record<string, KudosLikeEntry>;
  setEntry: (id: string, entry: KudosLikeEntry) => void;
}

const LikeContext = createContext<LikeStore | null>(null);

/**
 * Client-side like store keyed by kudos id. Entries exist only after the viewer interacts; until then the
 * server-provided post values apply. The same kudos shown in highlight and feed share one entry.
 */
export function KudosLikeProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Record<string, KudosLikeEntry>>({});
  const setEntry = useCallback((id: string, entry: KudosLikeEntry) => {
    setEntries((current) => ({ ...current, [id]: entry }));
  }, []);
  const value = useMemo(() => ({ entries, setEntry }), [entries, setEntry]);
  return <LikeContext.Provider value={value}>{children}</LikeContext.Provider>;
}

export function useKudosLike(post: {
  id: string;
  likedByViewer: boolean;
  likeCount: number;
}): [KudosLikeEntry, (entry: KudosLikeEntry) => void] {
  const store = useContext(LikeContext);
  if (!store) throw new Error("useKudosLike must be used inside <KudosLikeProvider>");
  const entry = store.entries[post.id] ?? { liked: post.likedByViewer, likeCount: post.likeCount, pending: false };
  return [entry, (next) => store.setEntry(post.id, next)];
}
