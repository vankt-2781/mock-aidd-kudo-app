"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { KUDOS_PATH } from "@/lib/site/site-routes";

import { IconPen } from "./home-icons";
import { RulesPanel } from "./rules-panel";
import { useDismissableMenu } from "./use-dismissable-menu";
import { WidgetButton } from "./widget-button";

export interface WidgetMenuProps {
  label: string;
  sendKudosLabel: string;
  viewRulesLabel: string;
}

// mm:313:9139 A/B — 64px yellow pills, 4px radius, 24px/32px bold label, hover lifts the shadow.
const ITEM_CLASS =
  "flex h-16 cursor-pointer items-center gap-2 rounded bg-[#FFEA9E] p-4 text-2xl font-bold leading-8 text-[#00101A] shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition-shadow duration-200 hover:shadow-[0_6px_10px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFEA9E]";

export function WidgetMenu({ label, sendKudosLabel, viewRulesLabel }: WidgetMenuProps) {
  const { open, toggle, close, containerRef, triggerRef } = useDismissableMenu();
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div ref={containerRef}>
      {open && (
        // mm:313:9140 — right-aligned column, 20px gap, sitting 20px above the round cancel button.
        <ul role="menu" className="fixed bottom-[100px] right-5 z-40 flex flex-col items-end gap-5">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                setRulesOpen(true);
              }}
              className={ITEM_CLASS}
            >
              {/* mm:I313:9140;214:3799;186:1763 — SAA logo in a 24px box */}
              <Image src="/images/home/icon-saa.svg" alt="" width={24} height={22} aria-hidden />
              {viewRulesLabel}
            </button>
          </li>
          <li role="none">
            <Link href={KUDOS_PATH} role="menuitem" onClick={close} className={ITEM_CLASS}>
              {/* mm:I313:9140;214:3732;186:1763 */}
              <IconPen />
              {sendKudosLabel}
            </Link>
          </li>
        </ul>
      )}
      <WidgetButton ref={triggerRef} label={label} expanded={open} onClick={toggle} />
      {/* mm:3204:6051 "Thể lệ UPDATE" — opened by the Thể lệ pill (navigation link I313:9140;214:3799). */}
      <RulesPanel open={rulesOpen} onClose={() => setRulesOpen(false)} writeKudosHref={KUDOS_PATH} />
    </div>
  );
}
