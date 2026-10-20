"use client";

import Link from "next/link";

import { KUDOS_PATH } from "@/lib/site/site-routes";

import { useDismissableMenu } from "./use-dismissable-menu";
import { WidgetButton } from "./widget-button";

export interface WidgetMenuProps {
  label: string;
  sendKudosLabel: string;
  backToTopLabel: string;
}

const ITEM_CLASS =
  "block w-full cursor-pointer rounded px-4 py-3 text-left text-base font-bold leading-6 text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-[#FFEA9E]";

export function WidgetMenu({ label, sendKudosLabel, backToTopLabel }: WidgetMenuProps) {
  const { open, toggle, close, containerRef, triggerRef } = useDismissableMenu();

  return (
    <div ref={containerRef}>
      {open && (
        <ul
          role="menu"
          className="fixed bottom-24 right-5 z-40 min-w-48 rounded-lg border border-[#2E3940] bg-[#0B0F12] p-1.5 shadow-lg"
        >
          <li role="none">
            <Link href={KUDOS_PATH} role="menuitem" onClick={close} className={ITEM_CLASS}>
              {sendKudosLabel}
            </Link>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                window.scrollTo({ top: 0 });
                close();
              }}
              className={ITEM_CLASS}
            >
              {backToTopLabel}
            </button>
          </li>
        </ul>
      )}
      <WidgetButton ref={triggerRef} label={label} expanded={open} onClick={toggle} />
    </div>
  );
}
