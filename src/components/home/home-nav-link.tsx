import { HomeScrollLink } from "./home-scroll-link";

export interface HomeNavLinkProps {
  label: string;
  /** Omitted = plain text (e.g. a footer entry without a destination yet) */
  href?: string;
  /** Selected link is yellow with a 1px yellow underline */
  selected?: boolean;
}

const BASE =
  "flex items-center gap-1 whitespace-nowrap rounded p-4 text-base font-bold leading-6 tracking-[0.15px]";

export function HomeNavLink({ label, href, selected = false }: HomeNavLinkProps) {
  if (!href) return <span className={`${BASE} text-white`}>{label}</span>;
  return (
    // mm:I2167:9091;186:1579 | mm:I2167:9091;186:1587 | mm:I2167:9091;186:1593
    <HomeScrollLink
      href={href}
      aria-current={selected ? "page" : undefined}
      className={`${BASE} transition-colors duration-200 hover:bg-[#FFEA9E]/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] ${
        selected
          ? "rounded-none border-b border-[#FFEA9E] text-[#FFEA9E] [text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287]"
          : "text-white"
      }`}
    >
      {label}
    </HomeScrollLink>
  );
}
