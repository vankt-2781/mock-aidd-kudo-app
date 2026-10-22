import type { ReactNode } from "react";

const DEFAULT_CAPTION = "Sun* Annual Awards 2025";

export interface KudosSectionHeaderProps {
  /** Defaults to the event name, identical in every locale (the spotlight section omits it). */
  caption?: string;
  title: string;
  /** id for the <h2>, so the section can reference it via aria-labelledby */
  titleId?: string;
  /** Optional right-aligned controls (e.g. filter dropdowns) */
  children?: ReactNode;
}

/** Caption + divider + big gold title shared by B.1 / B.6 / C.1 (mm:2940:13453). */
export function KudosSectionHeader({ caption = DEFAULT_CAPTION, title, titleId, children }: KudosSectionHeaderProps) {
  return (
    <header className="flex w-full flex-col gap-4">
      <p className="text-xl font-bold leading-8 text-white md:text-2xl">{caption}</p>
      <div className="h-px w-full bg-[#2E3940]" />
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <h2 id={titleId} className="text-4xl font-bold leading-tight tracking-[-0.25px] text-[#FFEA9E] md:text-[57px] md:leading-[64px]">
          {title}
        </h2>
        {children}
      </div>
    </header>
  );
}
