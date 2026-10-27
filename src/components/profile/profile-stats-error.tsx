"use client";

import { useRouter } from "next/navigation";

export interface ProfileStatsErrorProps {
  message: string;
  retryLabel: string;
}

/** Inline stats failure (FR-009): the rest of the page is unaffected; retry re-runs the server render. */
export function ProfileStatsError({ message, retryLabel }: ProfileStatsErrorProps) {
  const router = useRouter();
  return (
    <section
      role="alert"
      className="flex w-full max-w-[680px] flex-col items-center gap-4 rounded-[17px] border border-[#998C5F] bg-[#00070C] p-6 md:p-10"
    >
      <p className="text-center text-[22px] font-bold leading-7 text-white">{message}</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="h-12 cursor-pointer rounded-lg bg-[#FFEA9E] px-6 text-base font-bold text-[#00101A] transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]"
      >
        {retryLabel}
      </button>
    </section>
  );
}
