import type { KudosHeroTierKey } from "@/lib/i18n/kudos-dictionary";
import type { KudosStars } from "./kudos-board-types";

const TIME_ZONE = "Asia/Ho_Chi_Minh";

const TIERS: readonly KudosHeroTierKey[] = ["new", "rising", "super", "legend"];

/** Kudos received >= 10 / 20 / 50 earns 1 / 2 / 3 stars. */
export function deriveStars(received: number): KudosStars {
  if (!Number.isFinite(received)) return 0;
  if (received >= 50) return 3;
  if (received >= 20) return 2;
  if (received >= 10) return 1;
  return 0;
}

export function deriveHeroTier(stars: number): KudosHeroTierKey {
  const index = Math.min(3, Math.max(0, Math.trunc(stars) || 0));
  return TIERS[index];
}

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function zonedParts(iso: string): Record<string, string> | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts: Record<string, string> = {};
  for (const { type, value } of partsFormatter.formatToParts(date)) parts[type] = value;
  return parts;
}

/** "HH:mm - MM/DD/YYYY" in Asia/Ho_Chi_Minh; "" for an unparseable timestamp. */
export function formatKudosTime(iso: string): string {
  const p = zonedParts(iso);
  if (!p) return "";
  return `${p.hour}:${p.minute} - ${p.month}/${p.day}/${p.year}`;
}

/** "hh:mmAM/PM" (design "08:30PM") in Asia/Ho_Chi_Minh; "" for an unparseable timestamp. */
export function formatActivityTime(iso: string): string {
  const p = zonedParts(iso);
  if (!p) return "";
  const hour24 = Number(p.hour);
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, "0")}:${p.minute}${suffix}`;
}
