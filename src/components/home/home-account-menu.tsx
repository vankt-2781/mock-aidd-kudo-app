"use client";

import Link from "next/link";

import { signOutAction } from "@/app/todo/sign-out-action";
import type { AccountMenuKey } from "@/lib/auth/build-account-menu";
import { ADMIN_PATH, PROFILE_PATH } from "@/lib/site/site-routes";

import { ICON_BUTTON_CLASS, IconUser } from "./home-icons";
import { useDismissableMenu } from "./use-dismissable-menu";

export interface HomeAccountMenuEntry {
  key: AccountMenuKey;
  label: string;
}

export interface HomeAccountMenuProps {
  accountLabel: string;
  items: HomeAccountMenuEntry[];
}

// mm:z4sCl3_Qtk I666:9601;563:7844 — 56px rows, radius 4; hover/active = 10% gold tile + glow (frame shows Profile in that state).
const ITEM_CLASS =
  "flex h-14 w-full cursor-pointer items-center gap-1 rounded px-4 text-left text-base font-bold leading-6 tracking-[0.5px] text-white transition-colors duration-200 hover:bg-[#FFEA9E]/10 hover:[text-shadow:0_4px_4px_rgba(0,0,0,0.25),0_0_6px_#FAE287] focus-visible:outline-2 focus-visible:outline-[#FFEA9E]";

/** mm:I666:9601;563:7868;186:1441 — Logout trailing chevron. */
function IconChevronRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const HREFS: Record<Exclude<AccountMenuKey, "signOut">, string> = {
  profile: PROFILE_PATH,
  adminDashboard: ADMIN_PATH,
};

export function HomeAccountMenu({ accountLabel, items }: HomeAccountMenuProps) {
  const { open, toggle, close, containerRef, triggerRef } = useDismissableMenu();

  return (
    // mm:I2167:9091;186:1597
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={accountLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className={`${ICON_BUTTON_CLASS} !border-[#998C5F]`}
      >
        <IconUser />
      </button>
      {open && (
        // mm:666:9601 — gold-bordered dark panel, 6px padding, radius 8.
        <ul
          role="menu"
          className="absolute right-0 top-full mt-2 w-[133px] rounded-lg border border-[#998C5F] bg-[#00070C] p-1.5 shadow-lg"
        >
          {items.map((item) => (
            <li key={item.key} role="none">
              {item.key === "signOut" ? (
                // Not closed on click: unmounting the form would cancel the submit; the action redirects away.
                <form action={signOutAction}>
                  <button type="submit" role="menuitem" className={ITEM_CLASS}>
                    {item.label}
                    <IconChevronRight />
                  </button>
                </form>
              ) : (
                <Link href={HREFS[item.key]} role="menuitem" onClick={close} className={ITEM_CLASS}>
                  {item.label}
                  {item.key === "profile" ? <IconUser /> : null}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
