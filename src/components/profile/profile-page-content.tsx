import { KudosKeyvisualBackground } from "@/components/kudos/kudos-banner";
import { ProfileBadgeCollection } from "./profile-badge-collection";
import { ProfileHero } from "./profile-hero";
import { ProfileKudosSection } from "./profile-kudos-section";
import { ProfileStats } from "./profile-stats";
import type { ProfilePageContentProps } from "./profile-types";
import { ProfileWriteKudosBar } from "./profile-write-kudos-bar";

/** Profile body for both faces (mm:362:5050 self, w4WUvsJ9KI other). Header/footer come from the shared (site) layout. */
export function ProfilePageContent(props: ProfilePageContentProps) {
  const { hero, badges, kudos, messages, profileMessages, cardEnv } = props;
  return (
    <>
      <KudosKeyvisualBackground />
      {/* 184 top rhythm, 120 between stats and KUDOS, 120 before the footer */}
      <div className="relative flex w-full flex-col items-center gap-[120px] pb-[120px] pt-[184px]">
        {/* mm:362:5051 (hero -> stats gap 64) */}
        <div className="flex w-full flex-col items-center gap-16">
          {/* mm:362:5052 */}
          <div className="flex w-full flex-col items-center gap-8">
            <ProfileHero hero={hero} messages={messages} />
            <ProfileBadgeCollection badges={badges} face={props.face} messages={profileMessages} />
          </div>
          {props.face === "self" ? (
            <div className="flex w-full justify-center px-4">
              <ProfileStats stats={props.stats} messages={messages} profileMessages={profileMessages} />
            </div>
          ) : (
            <ProfileWriteKudosBar
              recipient={props.writeBar.recipient}
              hashtagNames={props.writeBar.hashtagNames}
              messages={profileMessages.writeBar}
              composeMessages={messages.compose}
            />
          )}
        </div>
        <ProfileKudosSection
          kudos={kudos}
          cardEnv={cardEnv}
          profileMessages={profileMessages}
          direction={
            props.face === "self"
              ? {
                  receivedCount: props.stats?.kudosReceived ?? 0,
                  sentCount: props.stats?.kudosSent ?? 0,
                  hrefs: props.directionHrefs,
                }
              : undefined
          }
        />
      </div>
    </>
  );
}
