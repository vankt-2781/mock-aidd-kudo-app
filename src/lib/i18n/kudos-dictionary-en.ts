import type { KudosMessages } from "./kudos-dictionary";

// EN is a developer draft pending PM review (the design is vi only). The copied
// toast stays English in both locales per design; hero labels and section titles
// are English proper nouns in the design as well.
export const kudosMessagesEn: KudosMessages = {
  meta: { title: "Sun* Kudos | Sun* Annual Awards 2025" },
  banner: { title: "Recognition and appreciation system", logoAlt: "SAA 2025 KUDOS" },
  actionBar: {
    composePlaceholder: "Today, who would you like to thank and recognize?",
    searchSunnerLabel: "Search Sunner profile",
  },
  section: {
    caption: "Sun* Annual Awards 2025",
    highlightTitle: "HIGHLIGHT KUDOS",
    spotlightTitle: "SPOTLIGHT BOARD",
    allKudosTitle: "ALL KUDOS",
  },
  filters: { hashtag: "Hashtag", department: "Department", all: "All" },
  carousel: { prev: "Previous", next: "Next" },
  card: {
    copyLink: "Copy Link",
    viewDetail: "View details",
    heartLabel: "Like",
    likeError: "Could not like this right now. Please try again.",
    copied: "Link copied — ready to share!",
    copyFailed: "Could not copy the link. Please try again.",
    emptyKudos: "There are no Kudos yet.",
    openImage: "Open image",
  },
  stars: {
    tooltip: {
      1: "This Sunner has received 10 Kudos and started spreading warm energy to everyone around.",
      2: "This Sunner has received 20 Kudos and proven their influence through positive actions every day.",
      3: "This Sunner has received 50 Kudos and become a role model of recognition, sharing and the Sun* spirit.",
    },
  },
  heroLabels: { new: "New Hero", rising: "Rising Hero", super: "Super Hero", legend: "Legend Hero" },
  spotlight: {
    searchPlaceholder: "Search",
    panZoomLabel: "Zoom / pan",
    panMode: "Pan",
    zoomMode: "Zoom",
    totalSuffix: "KUDOS",
    empty: "No data yet",
    loading: "Loading...",
    activityLabel: "Latest Kudos",
    activityText: "{name} received a new Kudos",
  },
  stats: {
    received: "Kudos you received:",
    sent: "Kudos you sent:",
    hearts: "Hearts you received:",
    boxOpened: "Secret Boxes you opened:",
    boxUnopened: "Unopened Secret Boxes:",
    openBox: "Open Secret Box",
  },
  giftList: { title: "10 LATEST SUNNERS\nRECEIVING GIFTS", empty: "No data yet" },
  placeholder: {
    sendDialogTitle: "Send a thank-you",
    secretBoxTitle: "Secret Box",
    detailTitle: "Kudos details",
    underConstruction: "This feature is under construction.",
    close: "Close",
    backToBoard: "Back to Kudos",
  },
};
