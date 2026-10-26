import Link from "next/link";
import type { ReactNode } from "react";

import { buildKudosFilterHref } from "@/lib/kudos/kudos-filter-params";
import type { KudosBoardPost } from "@/lib/kudos/kudos-board-types";
import type { KudosCardEnv } from "./kudos-card-env";
import { gatedHref } from "./kudos-card-env";
import { IconSend } from "./kudos-icons";
import { KudosUserInfo } from "./kudos-user-info";

export const ACTION_CLASS =
  "flex h-14 cursor-pointer items-center gap-1 rounded p-4 text-base font-bold leading-6 tracking-[0.15px] text-[#00101A] transition-colors duration-200 hover:bg-[#00101A]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00101A]";

/** Text + icon link on a cream card ("Xem chi tiết"); visitors are routed to login (FR-019). */
export function KudosDetailLink({ post, env, icon }: { post: KudosBoardPost; env: KudosCardEnv; icon: ReactNode }) {
  return (
    <Link href={gatedHref(env.signedIn, post.detailHref)} className={ACTION_CLASS}>
      <span>{env.messages.card.viewDetail}</span>
      {icon}
    </Link>
  );
}

/** Hashtags as filter links; `max` limits the count and appends "..." when more exist. */
export function KudosHashtags({
  tags,
  filters,
  max,
  className,
}: {
  tags: string[];
  filters: KudosCardEnv["filters"];
  max?: number;
  className: string;
}) {
  const shown = max === undefined ? tags : tags.slice(0, max);
  return (
    <p className={`text-base font-bold leading-6 tracking-[0.5px] text-[#D4271D] ${className}`}>
      {shown.map((tag, index) => (
        <span key={tag}>
          {index > 0 ? " " : null}
          <Link
            href={buildKudosFilterHref(filters, { hashtag: tag.replace(/^#/, "") })}
            scroll={false}
            className="hover:underline focus-visible:underline"
          >
            {tag}
          </Link>
        </span>
      ))}
      {max !== undefined && tags.length > max ? "..." : null}
    </p>
  );
}

/** Sender → receiver row at the top of every kudos card. */
export function KudosParties({ post, env }: { post: KudosBoardPost; env: KudosCardEnv }) {
  return (
    // mm:I3127:21871;256:4857
    <div className="flex w-full flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
      <KudosUserInfo user={post.sender} env={env} anonymous={post.senderAnonymous} />
      {/* mm:I3127:21871;256:5161 */}
      <div className="flex shrink-0 sm:pt-4">
        <IconSend className="size-8 rotate-90 text-[#00101A] sm:rotate-0" />
      </div>
      <KudosUserInfo user={post.receiver} env={env} />
    </div>
  );
}

/** Optional sender-written title (F007 FR-028); renders nothing when absent. */
export function KudosTitleLine({ title }: { title: string | null }) {
  if (!title) return null;
  return (
    <p data-kudos-title className="line-clamp-2 text-center text-xl font-bold leading-8 text-[#00101A]">
      {title}
    </p>
  );
}

export function CardDivider() {
  return <div className="h-px w-full shrink-0 bg-[#FFEA9E]" aria-hidden />;
}

/** Quote box holding the kudos message (mm:662:11382). `clampClass` sets the line clamp. */
export function KudosMessageBox({ text, clampClass, heightClass }: { text: string; clampClass: string; heightClass: string }) {
  return (
    // mm:I3127:21871;662:11382
    <div className={`w-full overflow-hidden flex items-center rounded-xl border border-[#FFEA9E] bg-[#FFEA9E]/40 px-6 ${heightClass}`}>
      <p className={`w-full text-justify text-xl font-bold leading-8 text-[#00101A] ${clampClass}`}>{text}</p>
    </div>
  );
}
