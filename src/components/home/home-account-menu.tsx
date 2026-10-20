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

const ITEM_CLASS =
  "block w-full rounded px-4 py-3 text-left text-base font-bold leading-6 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E]";

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
        <ul
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-48 rounded-lg border border-[#2E3940] bg-[#0B0F12] p-1.5 shadow-lg"
        >
          {items.map((item) => (
            <li key={item.key} role="none">
              {item.key === "signOut" ? (
                // Not closed on click: unmounting the form would cancel the submit; the action redirects away.
                <form action={signOutAction}>
                  <button type="submit" role="menuitem" className={`${ITEM_CLASS} cursor-pointer`}>
                    {item.label}
                  </button>
                </form>
              ) : (
                <Link href={HREFS[item.key]} role="menuitem" onClick={close} className={ITEM_CLASS}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
