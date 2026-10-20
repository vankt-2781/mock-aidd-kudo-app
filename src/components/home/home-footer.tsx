import Image from "next/image";

import { HOME_PATH } from "@/lib/site/site-routes";

import { montserratAlternates } from "./home-fonts";
import { HomeNavLink, type HomeNavLinkProps } from "./home-nav-link";
import { HomeScrollLink } from "./home-scroll-link";

export interface HomeFooterProps {
  links: HomeNavLinkProps[];
  copyright: string;
}

export function HomeFooter({ links, copyright }: HomeFooterProps) {
  return (
    // mm:5001:14800
    <footer className="w-full border-t border-[#2E3940] px-4 py-10 md:px-12 xl:px-[90px]">
      <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
        {/* mm:I5001:14800;342:1407 */}
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-20">
          {/* mm:I5001:14800;342:1408 */}
          <HomeScrollLink href={HOME_PATH} aria-label="Sun* Annual Awards 2025" className="shrink-0">
            {/* mm:I5001:14800;342:1408;178:1030 */}
            <Image src="/images/home/footer-logo.png" alt="Sun* Annual Awards 2025" width={69} height={64} />
          </HomeScrollLink>
          {/* mm:I5001:14800;342:1409 */}
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 xl:gap-12">
            {links.map((l) => (
              <HomeNavLink key={l.label} {...l} />
            ))}
          </nav>
        </div>
        {/* mm:I5001:14800;342:1413 */}
        <p className={`${montserratAlternates.className} text-base font-bold leading-6 text-white`}>{copyright}</p>
      </div>
    </footer>
  );
}
