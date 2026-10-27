import type { KudosCardEnv } from "@/components/kudos/kudos-card-env";
import type { ProfileMessages } from "@/lib/i18n/profile-dictionary";
import { formatProfileCopy } from "@/lib/i18n/profile-dictionary";
import { ProfileKudosDirectionDropdown } from "./profile-kudos-direction-dropdown";
import { ProfileKudosFeed } from "./profile-kudos-feed";
import type { ProfileDirection, ProfileKudosListData } from "./profile-types";

/** Self face only: counts and links for the direction dropdown. The other face passes nothing. */
export interface ProfileDirectionControl {
  receivedCount: number;
  sentCount: number;
  hrefs: Record<ProfileDirection, string>;
}

export interface ProfileKudosSectionProps {
  kudos: ProfileKudosListData;
  cardEnv: KudosCardEnv;
  profileMessages: ProfileMessages;
  /** Present on the self face (dropdown); absent on the other face (static "Đã nhận", no counts). */
  direction?: ProfileDirectionControl;
}

/** C header (caption, divider, KUDOS + direction control) and D feed of reused board cards (mm:362:5083). */
export function ProfileKudosSection({ kudos, cardEnv, profileMessages, direction }: ProfileKudosSectionProps) {
  const emptyText = kudos.activeDirection === "sent" ? profileMessages.emptySent : profileMessages.emptyReceived;
  return (
    // mm:362:5083 (gap 40)
    <section className="flex w-full max-w-[680px] flex-col gap-10 px-4 md:px-0">
      {/* mm:362:5084 (gap 16) */}
      <header className="flex w-full flex-col gap-4">
        <p className="text-2xl font-bold leading-8 text-white">{profileMessages.sectionCaption}</p>
        <div className="h-px w-full bg-[#2E3940]" role="separator" />
        {/* mm:362:5087 */}
        <div className="flex w-full items-center justify-between gap-8">
          <h2 className="text-[40px] font-bold leading-[48px] tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-[64px]">
            {profileMessages.sectionTitle}
          </h2>
          {direction ? (
            <ProfileKudosDirectionDropdown
              options={[
                {
                  value: "received",
                  label: formatProfileCopy(profileMessages.directionReceived, { count: direction.receivedCount }),
                  href: direction.hrefs.received,
                },
                {
                  value: "sent",
                  label: formatProfileCopy(profileMessages.directionSent, { count: direction.sentCount }),
                  href: direction.hrefs.sent,
                },
              ]}
              activeValue={kudos.activeDirection}
              ariaLabel={profileMessages.directionListLabel}
            />
          ) : (
            <h3 className="text-base font-bold leading-6 tracking-[0.15px] text-white">{profileMessages.staticReceivedLabel}</h3>
          )}
        </div>
      </header>
      {/* mm:362:5091 (gap 24) */}
      <ProfileKudosFeed kudos={kudos} env={cardEnv} emptyText={emptyText} />
    </section>
  );
}
