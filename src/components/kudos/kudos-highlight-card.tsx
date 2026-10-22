import { CardDivider, KudosDetailLink, KudosHashtags, KudosMessageBox, KudosParties } from "./kudos-card-parts";
import type { KudosBoardPost } from "@/lib/kudos/kudos-board-types";
import type { KudosCardEnv } from "./kudos-card-env";
import { KudosCopyLinkButton } from "./kudos-copy-link-button";
import { IconArrowUpRight } from "./kudos-icons";
import { KudosLikeButton } from "./kudos-like-button";

export interface KudosHighlightCardProps {
  post: KudosBoardPost;
  env: KudosCardEnv;
  className?: string;
}

/** B.3 highlight card: 528px wide, content clamped to 3 lines, hashtags on one line (max 5). */
export function KudosHighlightCard({ post, env, className = "" }: KudosHighlightCardProps) {
  const { card } = env.messages;
  return (
    // mm:2940:13465
    <article
      className={`flex w-full max-w-[528px] shrink-0 flex-col gap-4 lg:h-[525px] lg:w-[528px] rounded-2xl border-4 border-[#FFEA9E] bg-[#FFF8E1] px-5 pb-3 pt-5 text-[#00101A] ${className}`}
    >
      <KudosParties post={post} env={env} />
      <CardDivider />
      {/* mm:I2940:13465;335:9448 */}
      <div className="flex flex-col gap-4 lg:h-[240px]">
        {/* mm:I2940:13465;335:9449 */}
        <p className="text-base font-bold leading-6 tracking-[0.5px] text-[#999]">{post.sentAtLabel}</p>
        <KudosMessageBox text={post.content} clampClass="line-clamp-3" heightClass="h-[120px] py-[11px]" />
        {/* mm:I2940:13465;335:9459 */}
        <KudosHashtags tags={post.hashtags} filters={env.filters} max={5} className="truncate" />
      </div>
      <CardDivider />
      {/* mm:I2940:13465;335:9461 */}
      <div className="flex flex-wrap items-center justify-between gap-x-6">
        <KudosLikeButton post={post} signedIn={env.signedIn} label={card.heartLabel} errorLabel={card.likeError} />
        <div className="flex flex-wrap items-center gap-2">
          <KudosCopyLinkButton
            kudosId={post.id}
            label={card.copyLink}
            copiedLabel={card.copied}
            failedLabel={card.copyFailed}
          />
          <KudosDetailLink post={post} env={env} icon={<IconArrowUpRight />} />
        </div>
      </div>
    </article>
  );
}
