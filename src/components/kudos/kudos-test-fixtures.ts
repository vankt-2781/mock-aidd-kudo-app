import { getKudosMessages } from "@/lib/i18n/kudos-dictionary";
import type { KudosBoardPost } from "@/lib/kudos/kudos-board-types";
import type { KudosCardEnv } from "./kudos-card-env";

export const viMessages = getKudosMessages("vi");

const USER = {
  name: "Nguyễn Văn A",
  department: "CEVC1",
  heroTier: "new" as const,
  avatarSrc: "/images/kudos/avatar-1.png",
  profileId: "p-1",
  stars: 0 as const,
};

export function makePost(over: Partial<KudosBoardPost> = {}): KudosBoardPost {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    sender: USER,
    receiver: { ...USER, name: "Trần Thị B", profileId: "p-2" },
    title: null,
    senderAnonymous: false,
    sentAtLabel: "10:00 - 10/30/2025",
    content: "Cảm ơn bạn rất nhiều!",
    hashtags: ["#Pioneer", "#Teamwork"],
    images: [],
    likeCount: 3,
    detailHref: "/kudos/11111111-1111-4111-8111-111111111111",
    likedByViewer: false,
    viewerIsSender: false,
    createdAt: "2025-10-30T03:00:00.000Z",
    ...over,
  };
}

export function makeEnv(over: Partial<KudosCardEnv> = {}): KudosCardEnv {
  return {
    signedIn: true,
    filters: { hashtag: null, department: null },
    messages: { card: viMessages.card, stars: viMessages.stars, heroLabels: viMessages.heroLabels },
    ...over,
  };
}
