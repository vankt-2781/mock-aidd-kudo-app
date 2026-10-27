import Image from "next/image";
import { RULES_COPY } from "./rules-panel-copy";

const HEADING = "text-[22px] font-bold leading-7 text-[#FFEA9E]";
const BODY = "text-justify text-base font-bold leading-6 tracking-[0.5px] text-white";

/** "Người nhận": intro + 4 Hero tiers (chip, headline, description). */
export function ReceiverSection() {
  const { receiver, tiers } = RULES_COPY;
  return (
    <section className="flex flex-col gap-4">
      <h3 className={HEADING}>{receiver.heading}</h3>
      <p className={BODY}>{receiver.intro}</p>
      <ul className="flex flex-col gap-4 pl-5">
        {tiers.map((tier) => (
          <li key={tier.chipAlt} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Image src={tier.chip} alt={tier.chipAlt} width={126} height={22} className="h-[22px] w-[126px] shrink-0" />
              <p className={BODY}>{tier.headline}</p>
            </div>
            <p className="text-justify text-sm font-bold leading-5 tracking-[0.1px] text-white">{tier.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "Người gửi": intro + 3x2 collectible icon grid + closing line. */
export function SenderSection() {
  const { sender, icons } = RULES_COPY;
  return (
    <section className="flex flex-col gap-4">
      <h3 className={HEADING}>{sender.heading}</h3>
      <p className={BODY}>{sender.intro}</p>
      <ul className="mx-auto grid w-[377px] max-w-full grid-cols-3 justify-items-center gap-x-4 gap-y-4 py-0">
        {icons.map((icon) => (
          <li key={icon.name}>
            <Image src={icon.src} alt={icon.name} width={icon.width} height={icon.height} />
          </li>
        ))}
      </ul>
      <p className={BODY}>{sender.outro}</p>
    </section>
  );
}

/** "Kudos Quốc Dân" heading + paragraph. */
export function NationalSection() {
  const { national } = RULES_COPY;
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-2xl font-bold leading-8 text-[#FFEA9E]">{national.heading}</h3>
      <p className={BODY}>{national.body}</p>
    </section>
  );
}
