export interface HeroEventInfoProps {
  timeLabel: string;
  time: string;
  placeLabel: string;
  place: string;
  note: string;
}

export function HeroEventInfo({ timeLabel, time, placeLabel, place, note }: HeroEventInfoProps) {
  return (
    // mm:2167:9053
    <div className="flex flex-col gap-2">
      {/* mm:2167:9054 */}
      <div className="flex flex-wrap items-center gap-x-[60px] gap-y-2">
        {/* mm:2167:9055 */}
        <p className="flex items-center gap-2">
          <span className="text-base font-bold leading-6 tracking-[0.15px] text-white">{timeLabel}</span>
          <span className="text-2xl font-bold leading-8 text-[#FFEA9E]">{time}</span>
        </p>
        {/* mm:2167:9058 */}
        <p className="flex items-center gap-2">
          <span className="text-base font-bold leading-6 tracking-[0.15px] text-white">{placeLabel}</span>
          <span className="text-2xl font-bold leading-8 text-[#FFEA9E]">{place}</span>
        </p>
      </div>
      {/* mm:2167:9061 */}
      <p className="text-base font-bold leading-6 tracking-[0.5px] text-white">{note}</p>
    </div>
  );
}
