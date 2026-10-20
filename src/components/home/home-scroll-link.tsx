"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type HomeScrollLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/** Link that scrolls to top (no reload) when it points at the page the user is already on. */
export function HomeScrollLink({ href, onClick, ...rest }: HomeScrollLinkProps) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0 });
    }
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}
