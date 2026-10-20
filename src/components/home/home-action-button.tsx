import Link from "next/link";

import { IconArrowUpRight } from "./home-icons";

export interface HomeActionButtonProps {
  label: string;
  href: string;
  /** primary = yellow fill, outline = bordered; both turn yellow + glow on hover */
  variant?: "primary" | "outline";
  /** compact = 56px high "Chi tiết" button, default = 60px hero CTA */
  size?: "default" | "compact";
  className?: string;
}

const VARIANTS = {
  primary: "bg-[#FFEA9E] text-[#00101A] border border-transparent",
  outline: "border border-[#998C5F] bg-[#FFEA9E]/10 text-white",
} as const;

export function HomeActionButton({
  label,
  href,
  variant = "primary",
  size = "default",
  className = "",
}: HomeActionButtonProps) {
  const sizing =
    size === "compact" ? "h-14 gap-2 rounded px-4 text-base" : "h-[60px] gap-2 rounded-lg px-6 text-[22px]";
  return (
    // mm:2167:9063 | mm:2167:9064 | mm:I3390:10349;313:8426
    <Link
      href={href}
      className={`inline-flex items-center justify-center font-bold leading-7 transition duration-200 hover:-translate-y-0.5 hover:bg-[#FFEA9E] hover:text-[#00101A] hover:shadow-[0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${sizing} ${VARIANTS[variant]} ${className}`}
    >
      <span>{label}</span>
      <IconArrowUpRight />
    </Link>
  );
}
