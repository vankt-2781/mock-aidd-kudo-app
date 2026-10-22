"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { toggleKudosLike, type LikeResult } from "@/lib/kudos/kudos-actions";
import type { KudosBoardPost } from "@/lib/kudos/kudos-board-types";
import { IconHeart } from "./kudos-icons";
import { useKudosLike } from "./kudos-like-provider";

const countFormat = new Intl.NumberFormat("vi-VN");
const BASE_CLASS =
  "flex h-8 items-center gap-1 rounded text-[24px] font-bold leading-8 text-[#00101A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4271D]";
const ENABLED_CLASS = "cursor-pointer transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100";

export interface KudosLikeButtonProps {
  post: Pick<KudosBoardPost, "id" | "likeCount" | "likedByViewer" | "viewerIsSender">;
  signedIn: boolean;
  label: string;
  errorLabel: string;
}

async function requestLike(id: string, liked: boolean): Promise<LikeResult> {
  try {
    return await toggleKudosLike(id, liked);
  } catch (error) {
    console.error("[kudos] like request failed", error);
    return { status: "error" };
  }
}

/** Heart + count. Visitor → login link; sender → disabled; otherwise optimistic toggle with rollback. */
export function KudosLikeButton({ post, signedIn, label, errorLabel }: KudosLikeButtonProps) {
  const router = useRouter();
  const [entry, setEntry] = useKudosLike(post);
  const [failed, setFailed] = useState(false);

  const content = (
    <>
      <span>{countFormat.format(entry.likeCount)}</span>
      <IconHeart className="size-8" muted={!entry.liked} />
    </>
  );

  if (!signedIn) {
    return (
      <Link href={KUDOS_LOGIN_HREF} aria-label={label} className={`${BASE_CLASS} ${ENABLED_CLASS}`}>
        {content}
      </Link>
    );
  }

  async function handleClick() {
    if (entry.pending) return;
    const previous = entry;
    const liked = !previous.liked;
    setFailed(false);
    setEntry({ liked, likeCount: Math.max(0, previous.likeCount + (liked ? 1 : -1)), pending: true });
    const result = await requestLike(post.id, liked);
    if (result.status === "ok") {
      setEntry({ liked: result.liked, likeCount: result.likeCount, pending: false });
      return;
    }
    setEntry({ ...previous, pending: false });
    if (result.status === "unauthenticated") router.push(KUDOS_LOGIN_HREF);
    else setFailed(true);
  }

  const locked = post.viewerIsSender;
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-label={label}
        aria-pressed={entry.liked}
        aria-disabled={locked || entry.pending}
        disabled={locked || entry.pending}
        onClick={handleClick}
        className={`${BASE_CLASS} ${locked || entry.pending ? "cursor-not-allowed opacity-70" : ENABLED_CLASS}`}
      >
        {content}
      </button>
      {failed ? (
        <p role="status" className="text-sm font-bold leading-5 text-[#D4271D]">
          {errorLabel}
        </p>
      ) : null}
    </div>
  );
}
