"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { KudosComposeController, type ComposeMessages, type ComposeSunner } from "@/components/kudos-compose";
import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";

const TOAST_MS = 2500;

export interface KudosComposeLauncherProps {
  signedIn: boolean;
  className: string;
  messages: ComposeMessages;
  hashtagNames: string[];
  /** Preselected recipient for the dialog (profile write bar). */
  initialRecipient?: ComposeSunner | null;
  children: ReactNode;
}

/** Compose pill: visitors get a login link (FR-019); signed-in users open the "Viết Kudo" dialog. */
export function KudosComposeLauncher({ signedIn, className, messages, hashtagNames, initialRecipient, children }: KudosComposeLauncherProps) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function notify(text: string) {
    clearTimeout(timer.current);
    setToast(text);
    timer.current = setTimeout(() => setToast(null), TOAST_MS);
  }

  if (!signedIn) {
    return (
      <Link href={KUDOS_LOGIN_HREF} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open ? (
        <KudosComposeController
          messages={messages}
          hashtagNames={hashtagNames}
          initialRecipient={initialRecipient}
          onClose={() => setOpen(false)}
          onNotify={notify}
        />
      ) : null}
      {toast ? (
        <div
          role="status"
          className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-[#00101A] px-6 py-3 text-base font-bold text-[#FFEA9E] shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
