import type { AwardSlug } from "../site/award-categories";
import { awardsMessagesEn } from "./awards-dictionary-en";
import { awardsMessagesVi } from "./awards-dictionary-vi";
import type { Locale } from "./locale";

export interface AwardValueMessages {
  amount: string;
  /** Omitted when the design shows no note under the amount */
  note?: string;
}

export interface AwardDetailMessages {
  /** Paragraphs of the description */
  description: string[];
  quantity: string;
  quantityUnit: string;
  /** More than one value renders the `card.orLabel` separator between them */
  values: AwardValueMessages[];
}

export type AwardsMessages = {
  meta: { title: string };
  hero: { caption: string; heading: string; keyvisualAlt: string; logoAlt: string };
  nav: { ariaLabel: string; labels: Record<AwardSlug, string> };
  card: { quantityLabel: string; valueLabel: string; orLabel: string };
  details: Record<AwardSlug, AwardDetailMessages>;
};

const awardsDictionary: Record<Locale, AwardsMessages> = {
  vi: awardsMessagesVi,
  en: awardsMessagesEn,
};

export function getAwardsMessages(locale: Locale): AwardsMessages {
  return awardsDictionary[locale];
}
