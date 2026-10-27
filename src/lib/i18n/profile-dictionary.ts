import { kudosDictionary, type KudosMessages } from "./kudos-dictionary";
import type { Locale } from "./locale";
import { profileMessagesEn } from "./profile-dictionary-en";
import { profileMessagesVi } from "./profile-dictionary-vi";

/** Profile-only strings. `stats` and `heroLabels` are the kudos dictionary objects, reused by identity. */
export type ProfileOwnMessages = {
  badgeCollectionHeadingSelf: string;
  badgeCollectionHeadingOther: string;
  sectionCaption: string;
  sectionTitle: string;
  /** Contains `{count}`. */
  directionReceived: string;
  /** Contains `{count}`. */
  directionSent: string;
  staticReceivedLabel: string;
  directionListLabel: string;
  badgeLockedSuffix: string;
  emptyReceived: string;
  emptySent: string;
  /** Contains `{name}`. */
  writeBar: string;
  anonymousChip: string;
  openSecretBox: string;
  statsError: string;
  statsRetry: string;
  notFoundTitle: string;
  notFoundHome: string;
};

export type ProfileMessages = ProfileOwnMessages & {
  stats: KudosMessages["stats"];
  heroLabels: KudosMessages["heroLabels"];
};

export const profileDictionary: Record<Locale, ProfileMessages> = {
  vi: { ...profileMessagesVi, stats: kudosDictionary.vi.stats, heroLabels: kudosDictionary.vi.heroLabels },
  en: { ...profileMessagesEn, stats: kudosDictionary.en.stats, heroLabels: kudosDictionary.en.heroLabels },
};

export function getProfileMessages(locale: Locale): ProfileMessages {
  return profileDictionary[locale];
}

/** Single-pass substitution of `{name}` / `{count}` (values are never re-scanned for placeholders). */
export function formatProfileCopy(template: string, values: { name?: string; count?: number }): string {
  return template.replace(/\{(name|count)\}/g, (match, key: "name" | "count") => {
    const value = values[key];
    return value === undefined ? match : String(value);
  });
}
