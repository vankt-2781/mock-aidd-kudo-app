import type { AwardSlug } from "../site/award-categories";
import { homeMessagesEn } from "./home-dictionary-en";
import { homeMessagesVi } from "./home-dictionary-vi";
import type { Locale } from "./locale";

export type HomeMessages = {
  nav: { about: string; awards: string; kudos: string };
  header: {
    languageLabel: string;
    notificationsLabel: string;
    accountLabel: string;
    loginLabel: string;
    notificationsEmpty: string;
  };
  accountMenu: { profile: string; signOut: string; adminDashboard: string };
  hero: {
    comingSoon: string;
    countdownLabels: { days: string; hours: string; minutes: string };
    timeLabel: string;
    time: string;
    placeLabel: string;
    place: string;
    note: string;
    ctaAwards: string;
    ctaKudos: string;
  };
  /** Paragraphs before and after the quote block */
  rootFurther: { intro: string[]; quote: string; quoteTranslation: string; outro: string[] };
  awards: {
    caption: string;
    heading: string;
    detailLabel: string;
    descriptions: Record<AwardSlug, string>;
  };
  kudos: { label: string; title: string; kicker: string; description: string; detailLabel: string };
  footer: { standardsLabel: string; copyright: string };
  widget: { label: string; sendKudos: string; viewRules: string };
  placeholder: {
    kudosTitle: string;
    profileTitle: string;
    adminTitle: string;
    underConstruction: string;
  };
};

const homeDictionary: Record<Locale, HomeMessages> = {
  vi: homeMessagesVi,
  en: homeMessagesEn,
};

export function getHomeMessages(locale: Locale): HomeMessages {
  return homeDictionary[locale];
}
