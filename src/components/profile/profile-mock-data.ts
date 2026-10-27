import type { KudosBoardPost, KudosBoardUser } from "@/lib/kudos/kudos-board-types";
import type { ProfileBadgeSlot, ProfileHeroData, ProfileKudosListData } from "./profile-types";
import type { KudosStats } from "@/components/kudos/kudos-types";

/** Test fixtures extracted from the Figma frame 362:5037 (no invented values). The page no longer imports them. */
export const MOCK_PROFILE_HERO: ProfileHeroData = {
  name: "Huỳnh Dương Xuân Nhật",
  department: "CEVC3",
  heroTier: "legend",
  stars: 3,
  // The frame's avatar is a bitmap fill without a media URL; the kudos sunner avatar stands in.
  avatarSrc: "/images/kudos/avatar-sunner.png",
};

/** Six locked plain circles, exactly as drawn (mm:362:5066..5071). */
export const MOCK_PROFILE_BADGES: ProfileBadgeSlot[] = [1, 2, 3, 4, 5, 6].map((n) => ({
  id: `badge-${n}`,
  label: `Huy hiệu ${n}`,
  unlocked: false,
  imageSrc: null,
}));

/** mm:362:5076..5081 values (5 / 25 / 25 / 25 / 25). */
export const MOCK_PROFILE_STATS: KudosStats = {
  kudosReceived: 5,
  kudosSent: 25,
  heartsReceived: 25,
  secretBoxOpened: 25,
  secretBoxUnopened: 25,
};

const SENDER: KudosBoardUser = {
  name: "Huỳnh Dương Xuân Nhật",
  department: "CEVC10",
  heroTier: "super",
  avatarSrc: "/images/kudos/avatar-sender.png",
  profileId: "mock-sender",
  stars: 2,
};

const RECEIVER: KudosBoardUser = {
  name: "Huỳnh Dương Xuân",
  department: "CEVC10",
  heroTier: "legend",
  avatarSrc: "/images/kudos/avatar-receiver.png",
  profileId: "mock-receiver",
  stars: 3,
};

const CONTENT =
  "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...";
const HASHTAGS = ["#Dedicated", "#Inspring", "#Dedicated", "#Inspring", "#Dedicated", "#Inspring..."];

function mockPost(index: number, over: Partial<KudosBoardPost>): KudosBoardPost {
  const id = `00000000-0000-4000-8000-00000000000${index}`;
  return {
    id,
    sender: SENDER,
    receiver: RECEIVER,
    title: null,
    senderAnonymous: false,
    sentAtLabel: "10:00 - 10/30/2025",
    content: CONTENT,
    hashtags: HASHTAGS,
    images: Array.from({ length: 5 }, () => "/images/kudos/sample-image.png"),
    likeCount: 1000,
    detailHref: `/kudos/${id}`,
    likedByViewer: false,
    viewerIsSender: false,
    createdAt: "2025-10-30T03:00:00.000Z",
    ...over,
  };
}

/** Four cards as drawn: two untitled (chip "Spam" deferred), two titled "IDOL GIỚI TRẺ" with a Legend sender. */
export const MOCK_PROFILE_POSTS: KudosBoardPost[] = [
  mockPost(1, {}),
  mockPost(2, {}),
  mockPost(3, { title: "IDOL GIỚI TRẺ", sender: { ...SENDER, heroTier: "legend", stars: 3 } }),
  mockPost(4, { title: "IDOL GIỚI TRẺ", sender: { ...SENDER, heroTier: "legend", stars: 3 } }),
];

/** Test fixture: the frame shows the Sent list. */
export const MOCK_PROFILE_KUDOS: ProfileKudosListData = {
  profileId: "00000000-0000-4000-8000-000000010100",
  activeDirection: "sent",
  posts: MOCK_PROFILE_POSTS,
  cursor: null,
};
