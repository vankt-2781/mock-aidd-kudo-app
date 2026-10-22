import type { Locale } from "./locale";
import { kudosMessagesEn } from "./kudos-dictionary-en";
import { kudosMessagesVi } from "./kudos-dictionary-vi";

/** Mirrors the hero tiers used by the kudos components; kept literal so lib/ never imports components/. */
export type KudosHeroTierKey = "new" | "rising" | "super" | "legend";

export type KudosMessages = {
  meta: { title: string };
  banner: { title: string; logoAlt: string };
  actionBar: { composePlaceholder: string; searchSunnerLabel: string };
  section: { caption: string; highlightTitle: string; spotlightTitle: string; allKudosTitle: string };
  filters: { hashtag: string; department: string; all: string };
  carousel: { prev: string; next: string };
  card: {
    copyLink: string;
    viewDetail: string;
    heartLabel: string;
    likeError: string;
    copied: string;
    copyFailed: string;
    emptyKudos: string;
    openImage: string;
  };
  stars: { tooltip: Record<1 | 2 | 3, string> };
  heroLabels: Record<KudosHeroTierKey, string>;
  spotlight: {
    searchPlaceholder: string;
    panZoomLabel: string;
    panMode: string;
    zoomMode: string;
    totalSuffix: string;
    empty: string;
    loading: string;
    activityLabel: string;
    /** Contains a `{name}` placeholder, replaced by the consumer. */
    activityText: string;
  };
  stats: {
    received: string;
    sent: string;
    hearts: string;
    boxOpened: string;
    boxUnopened: string;
    openBox: string;
  };
  giftList: { title: string; empty: string };
  placeholder: {
    sendDialogTitle: string;
    secretBoxTitle: string;
    detailTitle: string;
    underConstruction: string;
    close: string;
    backToBoard: string;
  };
};

export const kudosDictionary: Record<Locale, KudosMessages> = {
  vi: kudosMessagesVi,
  en: kudosMessagesEn,
};

export function getKudosMessages(locale: Locale): KudosMessages {
  return kudosDictionary[locale];
}
