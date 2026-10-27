import type { Ref } from "react";
import Image from "next/image";

import { IconPen } from "./home-icons";

export interface WidgetButtonProps {
  onClick?: () => void;
  label: string;
  /** Reflects whether the quick-action menu is open */
  expanded?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function WidgetButton({ onClick, label, expanded, ref }: WidgetButtonProps) {
  // mm:I313:9140;214:3827 — open state swaps the pill for the 56px round red cancel button.
  if (expanded) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded
        onClick={onClick}
        className="fixed bottom-6 right-5 z-40 flex size-14 cursor-pointer items-center justify-center rounded-full bg-[#D4271D] text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        {/* mm:I313:9140;214:3827;186:1766 — MM_MEDIA_Close */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
    );
  }

  return (
    // mm:5022:15169
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={false}
      onClick={onClick}
      className="fixed bottom-6 right-5 z-40 flex h-16 w-[106px] cursor-pointer items-center gap-2 rounded-full bg-[#FFEA9E] p-4 text-[#00101A] shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] transition duration-200 hover:scale-105 hover:shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_16px_#FAE287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      {/* mm:I5022:15169;214:3839;186:1935 */}
      <span className="flex h-8 items-center gap-2">
        {/* mm:I5022:15169;214:3839;186:1763 */}
        <IconPen />
        {/* mm:I5022:15169;214:3839;186:1568 */}
        <span className="text-2xl font-bold leading-8" aria-hidden>
          /
        </span>
      </span>
      {/* mm:I5022:15169;214:3839;186:1766 */}
      <Image src="/images/home/icon-saa.svg" alt="" width={20} height={18} aria-hidden />
    </button>
  );
}
