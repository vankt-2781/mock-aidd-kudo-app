import { AwardCard, type AwardCardProps } from "./award-card";

export interface AwardsGridProps {
  caption: string;
  heading: string;
  awards: AwardCardProps[];
}

export function AwardsGrid({ caption, heading, awards }: AwardsGridProps) {
  return (
    // mm:2167:9068
    <section className="mx-auto flex w-full max-w-[1224px] flex-col gap-10 px-4 md:px-12 xl:gap-20 xl:px-0">
      {/* mm:2167:9069 */}
      <div className="flex flex-col gap-4">
        {/* mm:2167:9070 */}
        <p className="text-xl font-bold leading-8 text-white md:text-2xl">{caption}</p>
        {/* mm:2167:9071 */}
        <hr className="h-px border-0 bg-[#2E3940]" />
        {/* mm:2167:9072 */}
        <h2 className="text-4xl font-bold leading-tight tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-[64px]">
          {heading}
        </h2>
      </div>
      {/* mm:5005:14974 */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-8 lg:grid-cols-3 xl:gap-x-[108px] xl:gap-y-[104px]">
        {awards.map((award) => (
          <li key={award.title} className="flex">
            <AwardCard {...award} />
          </li>
        ))}
      </ul>
    </section>
  );
}
