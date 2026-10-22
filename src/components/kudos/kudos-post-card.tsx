import Image from "next/image";

import type { KudosBoardPost } from "@/lib/kudos/kudos-board-types";
import type { KudosCardEnv } from "./kudos-card-env";
import { CardDivider, KudosHashtags, KudosMessageBox, KudosParties } from "./kudos-card-parts";
import { KudosCopyLinkButton } from "./kudos-copy-link-button";
import { KudosLikeButton } from "./kudos-like-button";

export interface KudosPostCardProps {
  post: KudosBoardPost;
  env: KudosCardEnv;
}

/** C.3 feed card: 680px wide, content clamped to 5 lines, up to 5 square thumbnails (full size in a new tab). */
export function KudosPostCard({ post, env }: KudosPostCardProps) {
  const { card } = env.messages;
  return (
    // mm:3127:21871
    <article className="flex w-full flex-col gap-4 rounded-3xl bg-[#FFF8E1] px-4 pb-4 pt-6 text-[#00101A] sm:px-10 sm:pt-10">
      <KudosParties post={post} env={env} />
      <CardDivider />
      {/* mm:I3127:21871;256:5645 */}
      <div className="flex flex-col gap-4">
        {/* mm:I3127:21871;256:5229 */}
        <p className="text-base font-bold leading-6 tracking-[0.5px] text-[#999]">{post.sentAtLabel}</p>
        <KudosMessageBox text={post.content} clampClass="line-clamp-5" heightClass="h-[192px] py-4" />
        {/* mm:I3127:21871;256:5176 */}
        <ul className="flex flex-wrap items-center gap-4">
          {post.images.slice(0, 5).map((src, index) => (
            <li key={`${src}-${index}`} className="size-[88px] overflow-hidden rounded border border-[#FFEA9E]">
              <a href={src} target="_blank" rel="noopener noreferrer" aria-label={card.openImage}>
                <Image src={src} alt="" width={88} height={88} className="size-full object-cover" />
              </a>
            </li>
          ))}
        </ul>
        {/* mm:I3127:21871;256:5159 */}
        <KudosHashtags tags={post.hashtags} filters={env.filters} className="line-clamp-2 min-h-12" />
      </div>
      <CardDivider />
      {/* mm:I3127:21871;256:5194 */}
      <div className="flex items-center justify-between gap-6">
        <KudosLikeButton post={post} signedIn={env.signedIn} label={card.heartLabel} errorLabel={card.likeError} />
        <KudosCopyLinkButton
          kudosId={post.id}
          label={card.copyLink}
          copiedLabel={card.copied}
          failedLabel={card.copyFailed}
        />
      </div>
    </article>
  );
}
