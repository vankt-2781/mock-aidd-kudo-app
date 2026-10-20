"use client";

import { ICON_BUTTON_CLASS, IconBell } from "./home-icons";
import { useDismissableMenu } from "./use-dismissable-menu";

export interface HomeNotificationBellProps {
  label: string;
  emptyLabel: string;
}

/** No notification backend yet (see plan): always shows the empty panel and never a badge. */
export function HomeNotificationBell({ label, emptyLabel }: HomeNotificationBellProps) {
  const { open, toggle, containerRef, triggerRef } = useDismissableMenu();

  return (
    // mm:I2167:9091;186:2101
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={ICON_BUTTON_CLASS}
      >
        <IconBell />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-[#2E3940] bg-[#0B0F12] p-4 text-center text-base font-bold leading-6 text-white shadow-lg"
        >
          {emptyLabel}
        </div>
      )}
    </div>
  );
}
